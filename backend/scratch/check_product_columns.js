require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function check() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'product';");
    console.log('COLUMNS:', res.rows.map(r => r.column_name));
  } catch (e) {
    console.error('ERROR:', e);
  } finally {
    await pool.end();
  }
}
check();
