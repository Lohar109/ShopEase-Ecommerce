require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(/([?&])sslmode=[^&]*/gi, '$1').replace(/[?&]$/, ''),
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    const products = [
      'Samsung 419 L Frost Free',
      'Butterfly Rapid Plus',
      'Panasonic SR-WA22H',
      'Solara SOL-AF-501z',
      'PHILIPS NA120/00 Air Fryer'
    ];
    
    for (const name of products) {
      const res = await pool.query(
        'SELECT id, name FROM product WHERE name ILIKE $1',
        [`%${name}%`]
      );
      if (res.rows.length > 0) {
        const prod = res.rows[0];
        const vars = await pool.query(
          'SELECT id, product_id, size, price, discount_value, apply_discount FROM product_variant WHERE product_id = $1',
          [prod.id]
        );
        console.log(`Product: ${prod.name} (${prod.id})`);
        console.log(`Variants count: ${vars.rows.length}`);
        console.log(`Variants:`, vars.rows);
      } else {
        console.log(`Product NOT found: ${name}`);
      }
      console.log('---');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

test();
