// MySQL connection layer for the TypeScript skills (Week 3+)

import "dotenv/config"; 
import mysql from "mysql2/promise";

// one shared pool for the whole process -> pool.execute() uses prepared statements
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST ?? "localhost",
  user: process.env.MYSQL_USER ?? "root",
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE ?? "idx_exchange",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// run a parameterized query and return the rows typed as T
export async function query<T>(sql: string, params: any[] = []): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

// close the pool so a script (or the test file) can exit cleanly
export async function closePool(): Promise<void> {
  await pool.end();
}
