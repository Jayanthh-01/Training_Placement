console.log('URL loaded:', process.env.DATABASE_URL ? 'YES' : 'NO — .env not found');
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }   // Render requires SSL
});

async function run() {
  await client.connect();
  console.log('Connected to database.');

  const sql = fs.readFileSync('schema.sql', 'utf8');
  await client.query(sql);
  console.log('Schema loaded — all tables created.');

  // Verify: list tables and count seed rows
  const tables = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name`);
  console.log('Tables:', tables.rows.map(r => r.table_name));

  const users = await client.query('SELECT name, role FROM users');
  console.log('Seed users:', users.rows);

  await client.end();
}

run().catch(e => { console.error('Error:', e.message); client.end(); });