// MySQL connection layer for the TypeScript skills (Week 3+).
//
// Mirrors the Python db.py: same .env credentials, same idx_exchange database.
// Exposes a pooled `query<T>()` helper so every skill can run parameterized SQL
// without managing connections. READ-ONLY usage only — SELECTs, never writes.

import "dotenv/config"; // loads .env into process.env (same file db.py reads)
import mysql from "mysql2/promise";

// One shared pool for the whole process. pool.execute() uses prepared statements,
// so every `?` placeholder is bound safely (no string interpolation of user input).
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST ?? "localhost",
  user: process.env.MYSQL_USER ?? "root",
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE ?? "idx_exchange",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Run a parameterized query and return the rows typed as T.
// callers put ? placeholders in their SQL -> params fills them in order
export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

// Close the pool so a script (or the test file) can exit cleanly.
export async function closePool(): Promise<void> {
  await pool.end();
}
