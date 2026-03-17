/**
 * Post-process generated BDD files:
 * Convert test.describe() to test.describe.serial() for @sequence tagged features
 */

const fs = require("fs");
const path = require("path");

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.name.endsWith(".spec.js")) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  // Check if file has @sequence tag
  if (content.includes("@sequence")) {
    // Replace test.describe( with test.describe.serial(
    const updatedContent = content.replace(
      /test\.describe\(/g,
      "test.describe.serial(",
    );

    if (updatedContent !== content) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✓ Made serial: ${path.relative(process.cwd(), filePath)}`);
    }
  }
}

// Start processing from integration directory
const integrationDir = path.join(__dirname, "../../integration");
if (fs.existsSync(integrationDir)) {
  console.log("Processing BDD files for @sequence...");
  processDirectory(integrationDir);
  console.log("Done!");
} else {
  console.log(`Integration directory not found: ${integrationDir}`);
  console.log("Run bddgen first.");
}
