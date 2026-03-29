// CommonJS wrapper for env helper functions
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const projectRoot = process.cwd();

// Get env file name based on ENVIRONMENT variable
const getEnvFileName = () => {
  const env = process.env.ENVIRONMENT;
  if (env) {
    return `.env.${env}.yaml`;
  }
  return ".env.yaml";
};

// Load config from YAML file
const config = (() => {
  const envFile = getEnvFileName();
  const configPath = path.join(projectRoot, "support/environment", envFile);

  console.log(`[env.cjs] Loading config from: ${envFile}`);

  const content = fs.readFileSync(configPath, "utf-8");
  return yaml.load(content);
})();

// Get environment variable with optional default value
const getEnv = (key, defaultValue = "") => {
  const value = config && config[key];
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return defaultValue || "";
};

module.exports = { getEnv };
