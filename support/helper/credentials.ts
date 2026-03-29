import fs from "fs";
import path from "path";
import { getEnv } from "./env";

// Get the environment (staging or production)
const getEnvironment = (): string => {
  return getEnv("ENVIRONMENT", "staging");
};

// Load credentials from the appropriate environment folder
export const getCredentials = (
  project: string,
  credentialType: string = "account",
): any => {
  const environment = getEnvironment();
  const credentialsPath = path.resolve(
    __dirname,
    `../fixtures/credentials/${environment}/${credentialType}.json`,
  );

  try {
    const data = fs.readFileSync(credentialsPath, "utf-8");
    const credentials = JSON.parse(data);
    return credentials[project] || {};
  } catch (error) {
    console.warn(
      `Warning: Could not load credentials from ${credentialsPath}`,
      error,
    );
    return {};
  }
};

// Get specific user credentials by key
export const getUserCredentials = (
  project: string,
  userKey: string,
  credentialType: string = "account",
): { username: string; password: string } => {
  const credentials = getCredentials(project, credentialType);
  return credentials[userKey] || {};
};
