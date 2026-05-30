require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(/([?&])sslmode=[^&]*/gi, '$1').replace(/[?&]$/, ''),
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    const productsRes = await pool.query('SELECT id, name FROM product LIMIT 5');
    console.log('Sample Products:', productsRes.rows);
    
    if (productsRes.rows.length > 0) {
      const ids = productsRes.rows.map(p => p.id);
      console.log('Querying variants for IDs:', ids);
      
      const variantsRes = await pool.query(
        'SELECT id, product_id, price FROM product_variant WHERE product_id = ANY($1)',
        [ids]
      );
      console.log('Resulting variants count:', variantsRes.rows.length);
      console.log('Variants found:', variantsRes.rows);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

test();
