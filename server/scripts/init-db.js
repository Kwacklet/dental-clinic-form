import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';
import { config } from '../config.js';

const { database, ...login } = config.db;

async function main() {
  let connection;
  try {
    connection = await mysql.createConnection({ ...login, multipleStatements: true });
  } catch (error) {
    if (error.code === 'ECONNREFUSED') throw new Error('MySQL is not running. Start MySQL in XAMPP, then try again.');
    if (error.code === 'ER_ACCESS_DENIED_ERROR') throw new Error('MySQL refused the login. Check DB_USER and DB_PASSWORD in server/.env.');
    throw error;
  }

  try {
    const [existing] = await connection.query('SHOW DATABASES LIKE ?', [database]);
    if (existing.length > 0) {
      console.log(`Database "${database}" already exists. Nothing was changed.`);
      return;
    }
    const schema = await readFile(new URL('../schema.sql', import.meta.url), 'utf8');
    await connection.query(schema.replaceAll('dental_clinic_db', database));
    console.log(`Database "${database}" created with sample data.`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error.message || error.code);
  process.exitCode = 1;
});
