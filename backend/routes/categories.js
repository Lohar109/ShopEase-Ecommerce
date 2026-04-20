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

// GET /api/categories - fetch all categories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, image, parent_id FROM category ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categories - add a new category
router.post('/', async (req, res) => {
  const { name, image, parent_id } = req.body;
  if (!name || !image) {
    return res.status(400).json({ error: 'Name and image are required' });
  }
  const normalizedParentId = typeof parent_id === 'string' ? parent_id.trim() : null;
  const finalParentId = normalizedParentId ? normalizedParentId : null;
  try {
    if (finalParentId) {
      const parentResult = await pool.query(
        'SELECT id, parent_id FROM category WHERE id = $1 LIMIT 1',
        [finalParentId]
      );
      if (parentResult.rowCount === 0) {
        return res.status(400).json({ error: 'Selected parent category does not exist' });
      }
      if (parentResult.rows[0].parent_id !== null) {
        return res.status(400).json({ error: 'Parent category must be a main category' });
      }
    }

    const result = await pool.query(
      'INSERT INTO category (name, image, parent_id) VALUES ($1, $2, $3) RETURNING id, name, image, parent_id',
      [name, image, finalParentId]
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

// DELETE /api/categories/:id - delete category and all its descendant subcategories
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const normalizedId = typeof id === 'string' ? id.trim() : '';

  if (!normalizedId) {
    return res.status(400).json({ error: 'Category id is required' });
  }

  try {
    const result = await pool.query(
      `WITH RECURSIVE category_tree AS (
         SELECT id
         FROM category
         WHERE id = $1
         UNION ALL
         SELECT c.id
         FROM category c
         INNER JOIN category_tree ct ON c.parent_id = ct.id
       )
       DELETE FROM category
       WHERE id IN (SELECT id FROM category_tree)
       RETURNING id, name`,
      [normalizedId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.json({
      message: 'Category deleted',
      deleted_count: result.rowCount,
      deleted_ids: result.rows.map((row) => row.id),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
