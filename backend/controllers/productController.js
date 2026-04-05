const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

exports.getAllProducts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name AS category_name
      FROM product p
      LEFT JOIN category c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
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
      variants = []
    } = req.body;

    await client.query('BEGIN');
    // Insert product
    const productResult = await client.query(
      `INSERT INTO product (name, slug, brand, description, category_id, main_image, images, specifications)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id` ,
      [name, slug, brand, description, category_id, main_image, images, specifications]
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