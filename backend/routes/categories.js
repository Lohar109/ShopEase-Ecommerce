const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// GET /api/categories - fetch all categories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, image FROM category ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categories - add a new category
router.post('/', async (req, res) => {
  const { name, image } = req.body;
  if (!name || !image) {
    return res.status(400).json({ error: 'Name and image are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO category (name, image) VALUES ($1, $2) RETURNING id, name, image',
      [name, image]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      // Unique violation
      res.status(409).json({ error: 'Category name already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

module.exports = router;
