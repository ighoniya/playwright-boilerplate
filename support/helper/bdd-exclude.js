/**
 * Exclude - Handles BDD and TypeScript file exclusion based on environment
 * Moves excluded files (feature and ts/spec.ts) to temp location before running bddgen, then restores them
 */

// File extensions to be excluded (easy to extend for future file types)
const EXCLUDED_EXTENSIONS = [".feature", ".ts"];

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { minimatch } = require("minimatch");
const { getEnv } = require("./env.cjs");

const PROJECT_ROOT = path.join(__dirname, "../../");
const TEMP_EXCLUDED_DIR = path.join(PROJECT_ROOT, ".bddgen-excluded");
const TESTS_DIR = path.join(PROJECT_ROOT, "tests");

/**
 * Get current environment using getEnv helper
 * Checks ENVIRONMENT variable, defaults to 'staging'
 */
function getEnvironment() {
  return getEnv("ENVIRONMENT", "staging");
}

/**
 * Load exclude configuration for the current environment
 * Reads all JSON files from support/exclude/{env}/ and combines them
 */
function loadExcludeConfig() {
  const env = getEnvironment();
  const excludeDir = path.join(PROJECT_ROOT, `support/exclude/${env}`);

  if (!fs.existsSync(excludeDir)) {
    console.log(`No exclude directory found for ${env}`);
    return { exclude: [] };
  }

  const allExcludes = [];
  const jsonFiles = fs
    .readdirSync(excludeDir)
    .filter((f) => f.endsWith(".json"));

  if (jsonFiles.length === 0) {
    console.log(`No JSON files found in ${excludeDir}`);
    return { exclude: [] };
  }

  console.log(`Loading exclude configs from ${excludeDir}/:`);

  for (const file of jsonFiles) {
    try {
      const config = JSON.parse(
        fs.readFileSync(path.join(excludeDir, file), "utf-8"),
      );
      if (config.exclude && Array.isArray(config.exclude)) {
        if (config.exclude.length > 0) {
          console.log(`  ✓ ${file}: ${config.exclude.length} pattern(s)`);
          allExcludes.push(...config.exclude);
        } else {
          console.log(`  ✓ ${file}: no exclusions`);
        }
      }
    } catch (error) {
      console.error(`  ✗ Error loading ${file}: ${error.message}`);
    }
  }

  return { exclude: allExcludes };
}

/**
 * Check if a pattern points to a file (has excluded extension)
 */
function isFilePath(pattern) {
  return EXCLUDED_EXTENSIONS.some((ext) => pattern.endsWith(ext));
}

/**
 * Normalize pattern to match minimatch format
 * - Simple folder: "saucedemo/example-parallel" → "tests/saucedemo/example-parallel/**"
 * - Folder with wildcard: "saucedemo/example-parallel/**" → "tests/saucedemo/example-parallel/**"
 * - Full path to file: "tests/saucedemo/example-parallel/login2.feature" → used as-is
 * - Full path to file: "tests/practise/example.spec.ts" → used as-is
 * - Full path to folder: "tests/saucedemo/example-parallel" → "tests/saucedemo/example-parallel/**"
 * - Full path with wildcard: "tests/saucedemo/example-parallel/**" → used as-is
 * - Absolute path: used as-is
 */
function normalizePattern(pattern) {
  // Absolute path: use as-is
  if (path.isAbsolute(pattern)) {
    return pattern;
  }

  // If pattern starts with "tests/"
  if (pattern.startsWith("tests/")) {
    // Check if it's a file (ends with excluded extension) - use as-is
    if (isFilePath(pattern)) {
      return pattern;
    }
    // If it has wildcard at the end - use as-is
    if (pattern.endsWith("/**")) {
      return pattern;
    }
    // Otherwise it's a folder path - add "/**"
    return `${pattern}/**`;
  }

  // If pattern already has wildcard at the end, prepend "tests/"
  if (pattern.endsWith("/**")) {
    return `tests/${pattern}`;
  }

  // Simple folder pattern: prepend "tests/" and add "/**"
  return `tests/${pattern}/**`;
}

/**
 * Find all files matching the glob patterns
 */
function findFilesToExclude(patterns) {
  const excludedFiles = [];

  for (const originalPattern of patterns) {
    console.log(`  Checking pattern: ${originalPattern}`);

    // Normalize the pattern to minimatch format
    const pattern = normalizePattern(originalPattern);
    console.log(`    Normalized to: ${pattern}`);

    // Walk through the tests directory
    function walkDir(dir, relativePath = "") {
      if (!fs.existsSync(dir)) {
        return;
      }

      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativeFilePath = path.join(relativePath, entry.name);
        const testRelativePath = path.join("tests", relativeFilePath);

        if (entry.isDirectory()) {
          walkDir(fullPath, relativeFilePath);
        } else {
          // Check if file has an excluded extension
          const hasExcludedExtension = EXCLUDED_EXTENSIONS.some((ext) =>
            entry.name.endsWith(ext),
          );

          if (hasExcludedExtension) {
            // Check if this file matches the pattern
            if (minimatch(testRelativePath, pattern)) {
              excludedFiles.push(fullPath);
            }
          }
        }
      }
    }

    walkDir(TESTS_DIR);
  }

  return [...new Set(excludedFiles)];
}

/**
 * Move files to temp directory, preserving directory structure
 */
function moveFilesToTemp(files) {
  if (files.length === 0) {
    return;
  }

  console.log(`\nMoving ${files.length} excluded file(s) to temp directory...`);

  // Create temp directory if it doesn't exist
  if (!fs.existsSync(TEMP_EXCLUDED_DIR)) {
    fs.mkdirSync(TEMP_EXCLUDED_DIR, { recursive: true });
  }

  for (const filePath of files) {
    const relativePath = path.relative(TESTS_DIR, filePath);
    const tempPath = path.join(TEMP_EXCLUDED_DIR, relativePath);
    const tempDir = path.dirname(tempPath);

    // Create directory structure in temp
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Move the file
    fs.renameSync(filePath, tempPath);
    console.log(`  ✓ Excluded: ${relativePath}`);
  }
}

/**
 * Restore files from temp directory
 */
function restoreFilesFromTemp() {
  if (!fs.existsSync(TEMP_EXCLUDED_DIR)) {
    return;
  }

  console.log("\nRestoring excluded files...");

  function restoreDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        restoreDir(fullPath);
      } else {
        // Check if file has an excluded extension
        const hasExcludedExtension = EXCLUDED_EXTENSIONS.some((ext) =>
          entry.name.endsWith(ext),
        );

        if (hasExcludedExtension) {
          // Calculate original path
          const relativePath = path.relative(TEMP_EXCLUDED_DIR, fullPath);
          const originalPath = path.join(TESTS_DIR, relativePath);
          const originalDir = path.dirname(originalPath);

          // Create directory structure if needed
          if (!fs.existsSync(originalDir)) {
            fs.mkdirSync(originalDir, { recursive: true });
          }

          // Restore the file
          fs.renameSync(fullPath, originalPath);
          console.log(`  ✓ Restored: ${relativePath}`);
        }
      }
    }
  }

  restoreDir(TEMP_EXCLUDED_DIR);

  // Clean up empty directories in temp
  try {
    fs.rmSync(TEMP_EXCLUDED_DIR, { recursive: true, force: true });
  } catch (error) {
    console.log(`  Note: Could not remove temp dir: ${error.message}`);
  }
}

/**
 * Remove empty directories recursively
 */
function removeEmptyDirs(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let hasFiles = false;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      removeEmptyDirs(fullPath);
      if (!fs.existsSync(fullPath)) {
        continue;
      }
      // Check if still empty after recursive cleanup
      const remaining = fs.readdirSync(fullPath);
      if (remaining.length === 0) {
        fs.rmdirSync(fullPath);
      } else {
        hasFiles = true;
      }
    } else {
      hasFiles = true;
    }
  }

  // Don't remove the root integration directory
  if (dir === path.join(PROJECT_ROOT, "integration")) {
    return;
  }
}

/**
 * Remove excluded .spec.ts files from integration directory
 */
function removeExcludedSpecFilesFromIntegration(excludedFiles) {
  if (excludedFiles.length === 0) {
    return;
  }

  const integrationDir = path.join(PROJECT_ROOT, "integration");
  let removedCount = 0;

  for (const excludedFile of excludedFiles) {
    // Only process .spec.ts files
    if (!excludedFile.endsWith(".spec.ts")) {
      continue;
    }

    // Calculate the corresponding path in integration/
    const relativePath = path.relative(TESTS_DIR, excludedFile);
    const integrationPath = path.join(integrationDir, relativePath);

    if (fs.existsSync(integrationPath)) {
      fs.unlinkSync(integrationPath);
      console.log(`  ✓ Removed from integration: ${relativePath}`);
      removedCount++;
    }
  }

  if (removedCount > 0) {
    console.log(`  Removed ${removedCount} excluded .spec.ts file(s) from integration/`);
    // Clean up empty directories
    removeEmptyDirs(integrationDir);
  }
}

/**
 * Main execution
 */
function main() {
  const env = getEnvironment();
  console.log(`\n=== BDD Gen Wrapper (Environment: ${env}) ===\n`);

  // Load exclude config
  const config = loadExcludeConfig();

  let filesToExclude = [];

  if (config.exclude && config.exclude.length > 0) {
    console.log("Exclude patterns found:");
    config.exclude.forEach((p) => console.log(`  - ${p}`));

    // Find files to exclude
    filesToExclude = findFilesToExclude(config.exclude);

    if (filesToExclude.length > 0) {
      moveFilesToTemp(filesToExclude);
    } else {
      console.log("  No files matched the exclusion patterns.");
    }
  } else {
    console.log("No exclusion patterns for this environment.");
  }

  try {
    // Run original bddgen command
    console.log("\nRunning bddgen...");
    execSync("bddgen", { stdio: "inherit" });

    // Run rsync operations
    console.log("\nRunning rsync operations...");

    const integrationTestsDir = path.join(PROJECT_ROOT, "integration/tests");

    // Only run the first rsync if bddgen created integration/tests/
    if (fs.existsSync(integrationTestsDir)) {
      execSync(
        "rsync -av integration/tests/ integration/ && rm -rf integration/tests",
        { stdio: "inherit" },
      );
    } else {
      console.log(
        "  Note: No bddgen output in integration/tests/, skipping rsync",
      );
    }

    // Copy .spec.ts files from tests/ to integration/
    execSync(
      "rsync -av --include='**/' --include='*.spec.ts' --exclude='*' tests/ integration/",
      { stdio: "inherit" },
    );

    // Remove excluded .spec.ts files from integration/ and clean up empty dirs
    if (filesToExclude.length > 0) {
      console.log("\nCleaning up excluded .spec.ts files from integration/...");
      removeExcludedSpecFilesFromIntegration(filesToExclude);
    }

    // Always clean up empty directories created by rsync
    const integrationDir = path.join(PROJECT_ROOT, "integration");
    removeEmptyDirs(integrationDir);

    // Run make-serial
    console.log("\nRunning make-serial...");
    execSync("node support/helper/make-serial.js", { stdio: "inherit" });

    console.log("\n=== BDD Gen Complete ===\n");
  } catch (error) {
    console.error(`\nError during bddgen: ${error.message}`);
    process.exit(1);
  } finally {
    // Always restore excluded files
    if (fs.existsSync(TEMP_EXCLUDED_DIR)) {
      restoreFilesFromTemp();
    }
  }
}

main();
