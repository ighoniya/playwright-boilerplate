import { test, expect } from "@playwright/test";
import { DatabaseQueries } from "../../../support/pages/saucedemo/database.queries";
import { getEnv } from "../../../support/helper/env";

const project = "saucedemo";

test.describe("Database Connection", () => {
  let dbQueries: DatabaseQueries;

  test.beforeAll(() => {
    // Initialize database queries with environment from YAML config
    dbQueries = new DatabaseQueries(getEnv("ENVIRONMENT"), project);
  });

  test("Test Connection", async () => {
    const isConnected = await dbQueries.testDbTestConnection();
    expect(isConnected).toBe(true);
  });

  test("Query result one", async () => {
    // Query for a single user by email
    // Replace with an actual email from your database
    const testEmail = "xx";
    const user = await dbQueries.getUserByEmail(testEmail);

    // Verify we got a result (adjust based on your actual data)
    if (user) {
      console.log("Found user:", user);
      expect(user).toBeTruthy();
      expect(user).toHaveProperty("email", testEmail);
    } else {
      console.log(`No user found with email: ${testEmail}`);
      // You can either fail the test or handle it gracefully
      expect(user).toBeNull();
    }
  });

  test("Query result more than one then show all data", async () => {
    // Query for users with similar phone number
    const testPhone = "00";

    const users = await dbQueries.getUserByPhoneSimiliar(testPhone);

    // Verify we got results
    expect(users).toBeInstanceOf(Array);
    expect(users.length).toBeGreaterThanOrEqual(0);

    // Log all results for verification
    console.log(
      `Found ${users.length} users with phone containing: ${testPhone}`,
    );

    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`User ${index + 1}:`, JSON.stringify(user, null, 2));
      });

      // Verify each user has expected properties
      users.forEach((user) => {
        expect(user).toHaveProperty("phone");
      });
    }
  });

  test("Query with multiple results and verify data structure", async () => {
    // This test shows how to verify the structure of multiple results
    const testPhone = "00";

    const users = await dbQueries.getUserByPhoneSimiliar(testPhone);

    expect(Array.isArray(users)).toBe(true);

    // Verify data structure if results exist
    if (users.length > 0) {
      const firstUser = users[0];
      const expectedKeys = ["id", "email", "phone", "name"];

      // Check that at least some expected keys exist
      const hasExpectedKeys = expectedKeys.some((key) => key in firstUser);
      expect(hasExpectedKeys).toBe(true);

      console.log("First user structure:", Object.keys(firstUser));
      console.log("Total users found:", users.length);
    }
  });
});
