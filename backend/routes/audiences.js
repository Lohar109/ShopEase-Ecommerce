const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const dbUrl = process.env.DATABASE_URL || '';
const sanitizedDbUrl = dbUrl
  .replace(/([?&])sslmode=[^&]*/gi, '$1')
  .replace(/([?&])sslcert=[^&]*/gi, '$1')
  .replace(/([?&])sslkey=[^&]*/gi, '$1')
  .replace(/([?&])sslrootcert=[^&]*/gi, '$1')
  .replace(/[?&]$/, '');
const useManagedSsl = dbUrl.includes('supabase.com') || dbUrl.includes('pooler.supabase.com');
const pool = new Pool({
  connectionString: sanitizedDbUrl,
  ssl: useManagedSsl ? { rejectUnauthorized: false } : undefined,
});

// GET /api/audiences - fetch all audiences
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM audiences ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/audiences - add a new audience
router.post('/', async (req, res) => {
  const { name } = req.body;
  const normalizedName = typeof name === 'string' ? name.trim() : '';

  if (!normalizedName) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO audiences (name) VALUES ($1) RETURNING id, name',
      [normalizedName]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Audience name already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/audiences/:id - update an audience name
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const normalizedName = typeof name === 'string' ? name.trim() : '';

  if (!normalizedName) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const result = await pool.query(
      'UPDATE audiences SET name = $1 WHERE id = $2 RETURNING id, name',
      [normalizedName, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Audience not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Audience name already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/audiences/:id - delete an audience (only if not in use)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Check if any products use this audience
    const checkResult = await pool.query(
      'SELECT COUNT(*) as count FROM product WHERE audience = $1',
      [id]
    );

    if (checkResult.rows[0].count > 0) {
      return res.status(409).json({
        error: `Cannot delete audience. It is used by ${checkResult.rows[0].count} product(s).`,
      });
    }

    // Delete the audience
    const deleteResult = await pool.query(
      'DELETE FROM audiences WHERE id = $1 RETURNING id, name',
      [id]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: 'Audience not found' });
    }

    res.json({ message: 'Audience deleted successfully', deleted: deleteResult.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
