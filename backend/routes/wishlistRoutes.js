const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const dbUrl = process.env.DATABASE_URL || '';
const useManagedSsl = dbUrl.includes('supabase.com') || dbUrl.includes('pooler.supabase.com');
const pool = new Pool({
  connectionString: dbUrl,
  ssl: useManagedSsl ? { rejectUnauthorized: false } : undefined,
});

// Toggle Wishlist
router.post('/toggle', async (req, res) => {
  const { user_id, product_id } = req.body;
  if (!user_id || !product_id) {
    return res.status(400).json({ error: 'user_id and product_id are required' });
  }

  try {
    const checkResult = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [user_id, product_id]
    );

    if (checkResult.rows.length > 0) {
      // It exists, remove it
      await pool.query('DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2', [user_id, product_id]);
      res.json({ message: 'Removed from wishlist', isWishlisted: false });
    } else {
      // It doesn't exist, add it
      await pool.query('INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)', [user_id, product_id]);
      res.status(201).json({ message: 'Added to wishlist', isWishlisted: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch Wishlist
router.get('/', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  try {
    const result = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM wishlist w
       JOIN product p ON w.product_id = p.id
       LEFT JOIN category c ON p.category_id = c.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [user_id]
    );

    const products = result.rows.map(row => ({
      ...row,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : null
    }));
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;