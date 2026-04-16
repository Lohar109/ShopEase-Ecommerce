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

exports.upsertDesignGallery = async (req, res) => {
  const { product_id, color_name, images } = req.body;

  if (!product_id || !color_name || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: 'product_id, color_name, and images array are required' });
  }

  const normalizedColor = String(color_name).trim();
  if (!normalizedColor) {
    return res.status(400).json({ error: 'color_name cannot be empty' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query(
      `SELECT id
       FROM product_design_gallery
       WHERE product_id = $1 AND lower(color_name) = lower($2)
       ORDER BY created_at ASC`,
      [product_id, normalizedColor]
    );

    if (existing.rowCount > 0) {
      const keepId = existing.rows[0].id;

      await client.query(
        `UPDATE product_design_gallery
         SET color_name = $1, images = $2
         WHERE id = $3`,
        [normalizedColor, images, keepId]
      );

      if (existing.rowCount > 1) {
        const extraIds = existing.rows.slice(1).map((row) => row.id);
        await client.query(
          `DELETE FROM product_design_gallery WHERE id = ANY($1::uuid[])`,
          [extraIds]
        );
      }

      const updated = await client.query(
        `SELECT * FROM product_design_gallery WHERE id = $1`,
        [keepId]
      );

      await client.query('COMMIT');
      return res.json(updated.rows[0]);
    }

    const inserted = await client.query(
      `INSERT INTO product_design_gallery (product_id, color_name, images)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [product_id, normalizedColor, images]
    );

    await client.query('COMMIT');
    res.status(201).json(inserted.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

exports.getGalleriesByProduct = async (req, res) => {
  const { product_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT *
       FROM product_design_gallery
       WHERE product_id = $1
       ORDER BY created_at ASC`,
      [product_id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGalleryByProductAndColor = async (req, res) => {
  const { product_id, color_name } = req.params;

  try {
    const result = await pool.query(
      `SELECT *
       FROM product_design_gallery
       WHERE product_id = $1 AND lower(color_name) = lower($2)
       ORDER BY created_at ASC
       LIMIT 1`,
      [product_id, color_name]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Design gallery not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
