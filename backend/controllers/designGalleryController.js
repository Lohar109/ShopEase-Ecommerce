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

const normalizeUuidOrNull = (value) => {
  const normalized = String(value || '').trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized)
    ? normalized
    : null;
};

exports.upsertDesignGallery = async (req, res) => {
  const { id, product_id, color_name, images, video_url, variant_id } = req.body;

  if (!product_id || !color_name || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: 'product_id, color_name, and images array are required' });
  }

  const normalizedColor = String(color_name).trim();
  if (!normalizedColor) {
    return res.status(400).json({ error: 'color_name cannot be empty' });
  }

  const normalizedVideoUrl = video_url && String(video_url).trim() ? String(video_url).trim() : null;
  const galleryVariantId = normalizeUuidOrNull(variant_id);

  if (id) {
    try {
      const updated = await pool.query(
        `UPDATE product_design_gallery
         SET color_name = $1, images = $2, video_url = $3, variant_id = $4, updated_at = now()
         WHERE id = $5 AND product_id = $6
         RETURNING *`,
        [normalizedColor, images, normalizedVideoUrl, galleryVariantId, id, product_id]
      );

      if (updated.rowCount === 0) {
        return res.status(404).json({ error: 'Design gallery not found' });
      }

      return res.json(updated.rows[0]);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Query for existing gallery based on variant_id
    let existingQuery;
    let existingParams;
    
    if (galleryVariantId) {
      // Variant-specific gallery lookup
      existingQuery = `SELECT id
       FROM product_design_gallery
       WHERE product_id = $1 AND variant_id = $2
       ORDER BY created_at ASC`;
      existingParams = [product_id, galleryVariantId];
    } else {
      // Shared gallery lookup (color-based)
      existingQuery = `SELECT id
       FROM product_design_gallery
       WHERE product_id = $1 AND lower(color_name) = lower($2) AND variant_id IS NULL
       ORDER BY created_at ASC`;
      existingParams = [product_id, normalizedColor];
    }

    const existing = await client.query(existingQuery, existingParams);

    if (existing.rowCount > 0) {
      const keepId = existing.rows[0].id;

      await client.query(
        `UPDATE product_design_gallery
         SET color_name = $1, images = $2, video_url = $3, variant_id = $4, updated_at = now()
         WHERE id = $5`,
        [normalizedColor, images, normalizedVideoUrl, galleryVariantId, keepId]
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
      `INSERT INTO product_design_gallery (product_id, color_name, images, video_url, variant_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [product_id, normalizedColor, images, normalizedVideoUrl, galleryVariantId]
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
  const { variant_id } = req.query;
  const galleryVariantId = normalizeUuidOrNull(variant_id);

  try {
    let query;
    let params;

    if (galleryVariantId) {
      // Fetch variant-specific gallery
      query = `SELECT *
       FROM product_design_gallery
       WHERE product_id = $1 AND variant_id = $2
       ORDER BY created_at ASC
       LIMIT 1`;
      params = [product_id, galleryVariantId];
    } else {
      // Fetch shared gallery (color-based)
      query = `SELECT *
       FROM product_design_gallery
       WHERE product_id = $1 AND lower(color_name) = lower($2) AND variant_id IS NULL
       ORDER BY created_at ASC
       LIMIT 1`;
      params = [product_id, color_name];
    }

    const result = await pool.query(query, params);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Design gallery not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteDesignGallery = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM product_design_gallery WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Design gallery not found' });
    }

    res.json({ message: 'Design gallery deleted', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
