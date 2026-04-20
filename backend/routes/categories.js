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
  const forceDelete = String(req.query.force || '').toLowerCase() === 'true';
  const fallbackCategoryId =
    typeof req.query.fallback_category_id === 'string' ? req.query.fallback_category_id.trim() : '';

  if (!normalizedId) {
    return res.status(400).json({ error: 'Category id is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const categoryTreeResult = await client.query(
      `WITH RECURSIVE category_tree AS (
         SELECT id, name
         FROM category
         WHERE id = $1
         UNION ALL
         SELECT c.id, c.name
         FROM category c
         INNER JOIN category_tree ct ON c.parent_id = ct.id
       )
       SELECT id, name FROM category_tree`,
      [normalizedId]
    );

    if (categoryTreeResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Category not found' });
    }

    const categoryIds = categoryTreeResult.rows.map((row) => String(row.id));

    const linkedProductsCountResult = await client.query(
      `SELECT COUNT(*)::int AS count
       FROM product
       WHERE category_id::text = ANY($1::text[])`,
      [categoryIds]
    );
    const linkedProductsCount = linkedProductsCountResult.rows[0]?.count || 0;

    const linkedProductsSampleResult = await client.query(
      `SELECT id, name, category_id
       FROM product
       WHERE category_id::text = ANY($1::text[])
       ORDER BY created_at DESC NULLS LAST
       LIMIT 5`,
      [categoryIds]
    );

    let reassignedProductCount = 0;
    let reassignedToCategoryId = null;

    if (linkedProductsCount > 0) {
      if (!forceDelete) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          error: 'Cannot delete category while products are linked. Use force=true to reassign or nullify linked products first.',
          linked_product_count: linkedProductsCount,
          linked_products_sample: linkedProductsSampleResult.rows,
        });
      }

      if (fallbackCategoryId) {
        if (categoryIds.includes(fallbackCategoryId)) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            error: 'fallback_category_id cannot be one of the categories being deleted',
          });
        }

        const fallbackCategoryResult = await client.query(
          'SELECT id FROM category WHERE id = $1 LIMIT 1',
          [fallbackCategoryId]
        );
        if (fallbackCategoryResult.rowCount === 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'fallback_category_id does not exist' });
        }

        const reassignedResult = await client.query(
          `UPDATE product
           SET category_id = $1
           WHERE category_id::text = ANY($2::text[])
           RETURNING id`,
          [fallbackCategoryId, categoryIds]
        );
        reassignedProductCount = reassignedResult.rowCount;
        reassignedToCategoryId = fallbackCategoryId;
      } else {
        try {
          const nullifiedResult = await client.query(
            `UPDATE product
             SET category_id = NULL
             WHERE category_id::text = ANY($1::text[])
             RETURNING id`,
            [categoryIds]
          );
          reassignedProductCount = nullifiedResult.rowCount;
        } catch (err) {
          if (err.code === '23502') {
            await client.query('ROLLBACK');
            return res.status(400).json({
              error: 'Product category_id cannot be NULL. Pass force=true&fallback_category_id=<uuid> to reassign linked products before delete.',
            });
          }
          throw err;
        }
      }
    }

    const result = await client.query(
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

    await client.query('COMMIT');

    return res.json({
      message: 'Category deleted',
      deleted_count: result.rowCount,
      deleted_ids: result.rows.map((row) => row.id),
      linked_product_count: linkedProductsCount,
      reassigned_product_count: reassignedProductCount,
      reassigned_to_category_id: reassignedToCategoryId,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
