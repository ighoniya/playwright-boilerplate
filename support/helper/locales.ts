import * as enLang from "../language/en.json";

// State store - simple object to hold shared data across scenarios/steps
export const stateStore: Record<string, any> = {};

// Language constants
export const languages = {
  en: enLang,
};

// Dynamic language getter - always checks current state store
export const getCurrentLanguage = () => {
  return stateStore["language"] || "en";
};

// Dynamic language data getter
export const getLangData = () => {
  return languages[getCurrentLanguage() as keyof typeof languages];
};

// Set language
export const setLanguage = (lang: "en" | "id") => {
  stateStore["language"] = lang;
};

// Get translation text for a specific project, page, and key
export const getText = (project: string, page: string, key: string): string => {
  const langData: any = getLangData();
  return langData?.[project]?.[page]?.[key] || "";
};

// Get all translations for a specific project and page
export const getPageTranslations = (
  project: string,
  page: string,
): Record<string, string> => {
  const langData: any = getLangData();
  return langData?.[project]?.[page] || {};
};
