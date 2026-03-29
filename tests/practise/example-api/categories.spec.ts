import { test, expect } from "@playwright/test";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { categoriesSchema } from "../../../support/schema/practise/categories";
import { getEnv } from "../../../support/helper/env";

const ajv = new Ajv();
addFormats(ajv);

test.describe("Biller Categories API", () => {
  const BASE_URL = getEnv("PRACTISE_BASE_URL");
  const API_KEY = getEnv("PRACTISE_API_KEY");

  test("GET /v1/billers/categories - validate response and JSON schema", async ({
    request,
  }) => {
    const response = await request.get(`${BASE_URL}/v1/billers/categories`, {
      headers: {
        accept: "application/json",
        "X-API-Key": `${API_KEY}`,
        "X-Request-Id": "swagger-ftqyjkacx",
      },
    });

    // Validate status code
    expect(response.status()).toBe(200);

    // Parse response body
    const responseBody = await response.json();

    // Validate JSON schema using Ajv
    const validate = ajv.compile(categoriesSchema);
    const valid = validate(responseBody);

    // Check if schema validation passes
    expect(valid, JSON.stringify(validate.errors, null, 2)).toBe(true);
  });
});
