import { createDBHelper } from "../../helper/database";

/**
 * Database Queries Page Object
 * Contains all database query logic separated from step definitions
 */
export class DatabaseQueries {
  private dbTest: ReturnType<typeof createDBHelper>;

  constructor(env: string = "staging", project: string = "saucedemo") {
    this.dbTest = createDBHelper(env, project, "test_db");
  }

  // ========== Saucedemo Queries ==========

  /**
   * Get user by email from db_name database
   * @param email User email
   * @returns User data or null
   */
  async getUserByEmail(email: string) {
    return await this.dbTest.queryOne("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
  }

  /**
   * Get user by phone number similiar number from db_name database
   * @param phone User email
   * @returns User data or null
   */
  async getUserByPhoneSimiliar(phone: string) {
    return await this.dbTest.query("SELECT * FROM users WHERE phone LIKE ?", [
      `%${phone}%`,
    ]);
  }

  // ========== Connection Tests ==========

  /**
   * Test db_name database connection
   * @returns true if connection successful
   */
  async testDbTestConnection(): Promise<boolean> {
    return await this.dbTest.testConnection();
  }

  /**
   * Test all database connections
   * @returns true if all connections successful
   */
  async testAllConnections(): Promise<boolean> {
    const testOk = await this.testDbTestConnection();
    return testOk;
  }
}
