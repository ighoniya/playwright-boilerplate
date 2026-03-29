import * as fs from "fs";
import * as path from "path";
import yaml from "js-yaml";

// Get project root directory - works in both ESM and CommonJS transpilation
const projectRoot = process.cwd();

export interface EnvConfig {
  ENVIRONMENT: string;
  SAUCE_BASE_URL: string;
  PRACTISE_BASE_URL: string;
  PRACTISE_API_KEY: string;
  TIMEOUT?: number;
  RETRIES?: number;
  [key: string]: string | number | undefined;
}

// Get env file name based on ENV variable
const getEnvFileName = (): string => {
  const env = process.env.ENV;
  if (env) {
    return `.env.${env}.yaml`;
  }
  return ".env.yaml";
};

// Load config from YAML file
const config = (() => {
  const envFile = getEnvFileName();
  const configPath = path.join(projectRoot, "support/environment", envFile);

  console.log(`[env.ts] Loading config from: ${envFile}`);

  const content = fs.readFileSync(configPath, "utf-8");
  return yaml.load(content) as EnvConfig;
})();

// Get environment variable with optional default value
export const getEnv = (key: string, defaultValue?: string): string => {
  const value = config[key as keyof EnvConfig];
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return defaultValue || "";
};
