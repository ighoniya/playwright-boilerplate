import * as mysql from "mysql";
import * as fs from "fs";
import * as path from "path";

/**
 * Database connection configuration
 */
export interface DBConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: any;
  connectTimeout?: number;
}

/**
 * Database helper for read-only queries
 * Connections are automatically closed after each query
 */
export class DatabaseHelper {
  private config: any;

  constructor(config: DBConfig) {
    // Add default connection options
    this.config = {
      host: config.host,
      port: String(config.port), // Convert to string
      user: config.user,
      password: config.password,
      database: config.database,
      connectTimeout: config.connectTimeout || 10000,
    };
    // Don't configure SSL - let MySQL use default
  }

  /**
   * Execute a SELECT query
   * Connection is automatically closed after query
   * @param query SQL SELECT query string
   * @param params Query parameters (optional) - use ? placeholders
   * @returns Query results
   *
   * @example
   * const rows = await db.query('SELECT * FROM users WHERE email = ?', ['test@example.com']);
   * const allUsers = await db.query('SELECT * FROM users');
   */
  async query<T = any>(query: string, params?: any[]): Promise<T[]> {
    // Use callback-based API, wrapped in Promise
    return new Promise((resolve, reject) => {
      const connection = mysql.createConnection(this.config);

      connection.connect((connectErr) => {
        if (connectErr) {
          console.error("Connection error:", connectErr);
          return reject(connectErr);
        }

        connection.query(query, params, (queryErr, results) => {
          if (queryErr) {
            connection.end();
            console.error("Query error:", queryErr);
            return reject(queryErr);
          }

          connection.end();
          resolve(results as T[]);
        });
      });
    });
  }

  /**
   * Execute a SELECT query and return first row only
   * Connection is automatically closed after query
   * @param query SQL SELECT query string
   * @param params Query parameters (optional)
   * @returns First row or null if no results
   *
   * @example
   * const user = await db.queryOne('SELECT * FROM users WHERE id = ?', [123]);
   */
  async queryOne<T = any>(query: string, params?: any[]): Promise<T | null> {
    const rows = await this.query<T>(query, params);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Test database connection
   * @returns true if connection successful
   */
  async testConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const connection = mysql.createConnection(this.config);

        connection.connect((err) => {
          if (err) {
            console.error("Database connection failed:", err);
            resolve(false);
            return;
          }

          connection.ping((pingErr) => {
            connection.end();
            if (pingErr) {
              console.error("Database ping failed:", pingErr);
              resolve(false);
            } else {
              resolve(true);
            }
          });
        });
      } catch (error) {
        console.error("Database connection failed:", error);
        resolve(false);
      }
    });
  }
}

/**
 * Get database configuration from credentials file
 * @param env Environment name (staging, production)
 * @param projectName Database name (project_1, project_2, etc.)
 * @param dbName Database name (db_1, db_2, etc.)
 * @returns Database configuration
 *
 * @example
 * const config = getDBConfig('staging', 'project_1', 'db_1');
 */
export function getDBConfig(
  env: string = "staging",
  projectName: string = "project_1",
  dbName: string = "db_1",
): DBConfig {
  const credPath = path.join(
    __dirname,
    `../fixtures/credentials/${env}/database.json`,
  );

  if (!fs.existsSync(credPath)) {
    throw new Error(`Database credentials file not found: ${credPath}`);
  }

  const data = JSON.parse(fs.readFileSync(credPath, "utf-8"));
  const config = data[projectName]?.[dbName];

  if (!config) {
    throw new Error(
      `Database configuration '${dbName}' not found in ${env}/database.json`,
    );
  }

  return config;
}

/**
 * Create database helper from credentials file
 * @param env Environment name (staging, production)
 * @param projectName Database name (project_1, project_2, etc.)
 * @param dbName Database name (db_1, db_2, etc.)
 * @returns DatabaseHelper instance
 *
 * @example
 * // Use staging db_1
 * const db = createDBHelper('staging', 'project_1', 'db_1');
 * const users = await db.query('SELECT * FROM users');
 *
 * // Use production db_2
 * const dbProd = createDBHelper('production', 'project_1', 'db_2');
 * const orders = await dbProd.query('SELECT * FROM orders WHERE status = ?', ['completed']);
 */
export function createDBHelper(
  env: string = "staging",
  projectName: string = "project_1",
  dbName: string = "db_1",
): DatabaseHelper {
  const config = getDBConfig(env, projectName, dbName);
  return new DatabaseHelper(config);
}

/**
 * Create database helper with custom configuration
 * Use this when you need a one-off connection not in credentials
 * @param config Database configuration
 * @returns DatabaseHelper instance
 *
 * @example
 * const db = createCustomDBHelper({
 *   host: '10.201.2.22',
 *   port: 14045,
 *   user: 'readonly_user',
 *   password: 'password123',
 *   database: 'test_db'
 * });
 * const results = await db.query('SELECT * FROM orders WHERE status = ?', ['completed']);
 */
export function createCustomDBHelper(config: DBConfig): DatabaseHelper {
  return new DatabaseHelper(config);
}
