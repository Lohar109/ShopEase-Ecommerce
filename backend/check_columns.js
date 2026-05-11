require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    const res = await pool.query("ALTER TABLE product_variant ADD COLUMN IF NOT EXISTS override_discount BOOLEAN DEFAULT false;");
    console.log('ALTER COMPLETE:', res.rowCount);
  } catch (e) {
    console.error('ERROR:', e);
  } finally {
    await pool.end();
  }
}
check();
