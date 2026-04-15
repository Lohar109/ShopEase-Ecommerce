const { Pool } = require('pg');
const dbUrl = process.env.DATABASE_URL || '';
const useManagedSsl = dbUrl.includes('supabase.com') || dbUrl.includes('pooler.supabase.com');
const pool = new Pool({
  connectionString: dbUrl,
  ssl: useManagedSsl ? { rejectUnauthorized: false } : undefined,
});

exports.getAllProducts = async (req, res) => {
  try {
    const { audience, category_id } = req.query;
    let queryArgs = [];
    let whereClauses = [];

    if (audience) {
      queryArgs.push(audience);
      whereClauses.push(`p.audience = $${queryArgs.length}`);
    }
    if (category_id) {
      queryArgs.push(category_id);
      whereClauses.push(`(p.category_id = $${queryArgs.length} OR c.parent_id = $${queryArgs.length})`);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const result = await pool.query(`
      SELECT p.*, c.name AS category_name, COALESCE(vs.total_stock, 0) AS stock
      FROM product p
      LEFT JOIN category c ON p.category_id = c.id
      LEFT JOIN LATERAL (
        SELECT SUM(pv.stock)::int AS total_stock
        FROM product_variant pv
        WHERE pv.product_id = p.id
      ) vs ON TRUE
      ${whereString}
      ORDER BY p.created_at DESC
    `, queryArgs);
    // Optionally format created_at as ISO string
    const products = result.rows.map(row => ({
      ...row,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : null
    }));
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new product with variants (atomic)
exports.createProduct = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      name,
      slug,
      brand,
      description,
      category_id,
      main_image,
      images = [],
      specifications = {},
      variants = [],
      audience = 'unisex'
    } = req.body;

    await client.query('BEGIN');
    // Insert product
    const productResult = await client.query(
      `INSERT INTO product (name, slug, brand, description, category_id, main_image, images, specifications, audience)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id` ,
      [name, slug, brand, description, category_id, main_image, images, specifications, audience]
    );
    const productId = productResult.rows[0].id;

    // Insert variants
    for (const v of variants) {
      await client.query(
        `INSERT INTO product_variant (product_id, size, color, price, stock, sku, image)
         VALUES ($1, $2, $3, $4, $5, $6, $7)` ,
        [productId, v.size, v.color, v.price, v.stock, v.sku, v.image]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Product created', product_id: productId });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// Get a single product and its variants
exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const productResult = await pool.query(
      `SELECT p.*, c.name AS category_name FROM product p LEFT JOIN category c ON p.category_id = c.id WHERE p.id = $1`,
      [id]
    );
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const product = productResult.rows[0];
    const variantsResult = await pool.query(
      `SELECT * FROM product_variant WHERE product_id = $1 ORDER BY price ASC`,
      [id]
    );
    res.json({
      product: {
        ...product,
        created_at: product.created_at ? new Date(product.created_at).toISOString() : null
      },
      variants: variantsResult.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update an existing product
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const {
      name,
      slug,
      brand,
      description,
      category_id,
      main_image,
      images = [],
      specifications = {},
      audience = 'unisex',
      variants = []
    } = req.body;

    await client.query('BEGIN');
    
    // Update product
    const productResult = await client.query(
      `UPDATE product 
       SET name = $1, slug = $2, brand = $3, description = $4, category_id = $5, main_image = $6, images = $7, specifications = $8, audience = $9 
       WHERE id = $10 RETURNING id`,
      [name, slug, brand, description, category_id, main_image, images, specifications, audience, id]
    );

    if (productResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Product not found' });
    }

    // Replace variants (delete old, insert new)
    await client.query(`DELETE FROM product_variant WHERE product_id = $1`, [id]);
    for (const v of variants) {
      await client.query(
        `INSERT INTO product_variant (product_id, size, color, price, stock, sku, image)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, v.size, v.color, v.price, v.stock, v.sku, v.image]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Product updated', product_id: id });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// Update product flags (active/featured)
exports.updateProductStatus = async (req, res) => {
  const { id } = req.params;
  const { is_active, is_featured } = req.body;

  const updates = [];
  const values = [];

  if (typeof is_active === 'boolean') {
    updates.push(`is_active = $${values.length + 1}`);
    values.push(is_active);
  }

  if (typeof is_featured === 'boolean') {
    updates.push(`is_featured = $${values.length + 1}`);
    values.push(is_featured);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid status fields provided' });
  }

  values.push(id);

  try {
    const result = await pool.query(
      `UPDATE product SET ${updates.join(', ')}, updated_at = now() WHERE id = $${values.length} RETURNING id, is_active, is_featured`,
      values
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a product and its variants
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM product WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted', product_id: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};