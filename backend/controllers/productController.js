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

const isDuplicateSkuError = (err) => (
  err?.code === '23505' &&
  String(err?.constraint || '').toLowerCase().includes('sku')
);

const extractDuplicateSku = (err) => {
  const match = String(err?.detail || '').match(/\(sku\)=\((.*?)\)/i);
  return match?.[1] || null;
};

const normalizeUuidOrNull = (value) => {
  const normalized = String(value || '').trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized)
    ? normalized
    : null;
};

const normalizeVariantForDb = (v) => {
  const {
    size_value,
    size_unit,
    size_info,
    variety,
    variety_label,
    sub_size,
    sub_size_unit,
    size,
    color,
    price,
    stock,
    sku,
    image,
    use_separate_gallery,
    override_discount,
    discount_type,
    discount_value
  } = v;

  return {
    size_value: size_value ? String(size_value).trim() : null,
    size_unit: size_unit ? String(size_unit).trim() : null,
    size_info: size_info ? String(size_info).trim() : null,
    variety: variety ? String(variety).trim() : (variety_label ? String(variety_label).trim() : null),
    sub_size: sub_size ? String(sub_size).trim() : null,
    sub_size_unit: sub_size_unit ? String(sub_size_unit).trim() : null,
    size: size ? String(size).trim() : null,
    color: color ? String(color).trim() : null,
    price: price !== '' && price !== null ? Number(price) : null,
    stock: stock !== '' && stock !== null ? Number(stock) : null,
    sku: sku ? String(sku).trim() : null,
    image: image ? String(image).trim() : null,
    use_separate_gallery: use_separate_gallery || false,
    override_discount: override_discount || false,
    discount_type: discount_type || 'Percentage',
    discount_value: discount_value !== '' && discount_value !== null ? Number(discount_value) : 0
  };
};

const normalizeVariantUpdatePayload = (variant = {}) => {
  const {
    size_value,
    size_unit,
    size_info,
    variety,
    variety_label,
    sub_size,
    sub_size_unit,
    size,
    color,
    price,
    stock,
    sku,
    image,
    use_separate_gallery,
    override_discount,
    discount_type,
    discount_value,
  } = variant;

  return {
    size: size ? String(size).trim() : null,
    size_value: size_value ? String(size_value).trim() : null,
    size_unit: size_unit ? String(size_unit).trim() : null,
    size_info: size_info ? String(size_info).trim() : null,
    variety: variety ? String(variety).trim() : (variety_label ? String(variety_label).trim() : null),
    sub_size: sub_size ? String(sub_size).trim() : null,
    sub_size_unit: sub_size_unit ? String(sub_size_unit).trim() : null,
    color: color ? String(color).trim() : null,
    price: price !== '' && price !== null ? Number(price) : null,
    stock: stock !== '' && stock !== null ? Number(stock) : null,
    sku: sku ? String(sku).trim() : null,
    image: image ? String(image).trim() : null,
    use_separate_gallery: use_separate_gallery || false,
    override_discount: override_discount || false,
    discount_type: discount_type || 'Percentage',
    discount_value: discount_value !== '' && discount_value !== null ? Number(discount_value) : 0,
  };
};

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
      whereClauses.push(`p.category_id IN (
        WITH RECURSIVE category_tree AS (
          SELECT id FROM category WHERE id = $${queryArgs.length}
          UNION ALL
          SELECT c.id FROM category c
          INNER JOIN category_tree ct ON c.parent_id = ct.id
        )
        SELECT id FROM category_tree
      )`);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const result = await pool.query(`
      SELECT p.*, c.name AS category_name, a.name AS audience_name, COALESCE(vs.total_stock, 0) AS stock
      FROM product p
      LEFT JOIN category c ON p.category_id = c.id
      LEFT JOIN audiences a ON p.audience = a.id
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
      audience,
      overview = {},
      inclusions = {},
      how_to_use = {},
      spec_description = '',
      spec_video_url = '',
      spec_image = ''
    } = req.body;

    // Validate audience_id exists
    if (audience) {
      const audienceResult = await client.query('SELECT id FROM audiences WHERE id = $1', [audience]);
      if (audienceResult.rowCount === 0) {
        return res.status(400).json({ error: 'Invalid audience ID' });
      }
    }

    await client.query('BEGIN');
    // Insert product
    const productResult = await client.query(
      `INSERT INTO product (name, slug, brand, description, category_id, main_image, video_url, images, specifications, audience, overview, inclusions, how_to_use, spec_description, spec_video_url, spec_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING id` ,
      [name, slug, brand, description, category_id, main_image, video_url, images, specifications, audience, overview, inclusions, how_to_use, spec_description, spec_video_url, spec_image]
    );
    const productId = productResult.rows[0].id;

    // Insert variants
    for (const v of variants) {
      const normalized = normalizeVariantForDb(v);
      await client.query(
        `INSERT INTO product_variant (product_id, size, size_value, size_unit, size_info, variety, sub_size, sub_size_unit, color, price, stock, sku, image, use_separate_gallery, override_discount, discount_type, discount_value)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)` ,
        [
          productId,
          normalized.size,
          normalized.size_value,
          normalized.size_unit,
          normalized.size_info,
          normalized.variety,
          normalized.sub_size,
          normalized.sub_size_unit,
          normalized.color,
          normalized.price,
          normalized.stock,
          normalized.sku,
          normalized.image,
          normalized.use_separate_gallery,
          normalized.override_discount,
          normalized.discount_type,
          normalized.discount_value
        ]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Product created', product_id: productId });
  } catch (err) {
    await client.query('ROLLBACK');
    if (isDuplicateSkuError(err)) {
      return res.status(409).json({ error: 'SKU already exists', sku: extractDuplicateSku(err) });
    }
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
      `SELECT p.*, c.name AS category_name, a.name AS audience_name, p.inclusions FROM product p LEFT JOIN category c ON p.category_id = c.id LEFT JOIN audiences a ON p.audience = a.id WHERE p.id = $1`,
      [id]
    );
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const product = productResult.rows[0];
    const variantsResult = await pool.query(
      `SELECT * FROM product_variant WHERE product_id = $1 ORDER BY created_at ASC`,
      [id]
    );
    res.json({
      product: {
        ...product,
        created_at: product.created_at ? new Date(product.created_at).toISOString() : null,
        video_url: product.video_url || ''
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
      video_url = '',
      images = [],
      specifications = {},
      audience,
      variants = [],
      overview = {},
      inclusions = {},
      how_to_use = {},
      spec_description = '',
      spec_video_url = '',
      spec_image = ''
    } = req.body;

    // Validate audience_id exists
    if (audience) {
      const audienceResult = await client.query('SELECT id FROM audiences WHERE id = $1', [audience]);
      if (audienceResult.rowCount === 0) {
        return res.status(400).json({ error: 'Invalid audience ID' });
      }
    }

    await client.query('BEGIN');
    
    // Update product
    const productResult = await client.query(
      `UPDATE product 
       SET name = $1, slug = $2, brand = $3, description = $4, category_id = $5, main_image = $6, video_url = $7, images = $8, specifications = $9, audience = $10, overview = $11, inclusions = $12, how_to_use = $13, spec_description = $14, spec_video_url = $15, spec_image = $16
       WHERE id = $17 RETURNING id`,
      [name, slug, brand, description, category_id, main_image, video_url, images, specifications, audience, overview, inclusions, how_to_use, spec_description, spec_video_url, spec_image, id]
    );

    if (productResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Product not found' });
    }

    const existingVariantsResult = await client.query(
      `SELECT id FROM product_variant WHERE product_id = $1`,
      [id]
    );
    const existingVariantIds = new Set(existingVariantsResult.rows.map((row) => row.id));
    const incomingVariantIds = new Set();

    for (const v of variants) {
      const variantId = normalizeUuidOrNull(v.id);
      const normalized = normalizeVariantUpdatePayload(v);

      if (variantId && existingVariantIds.has(variantId)) {
        incomingVariantIds.add(variantId);
        await client.query(
          `UPDATE product_variant
           SET size = $1, size_value = $2, size_unit = $3, size_info = $4, variety = $5, sub_size = $6, sub_size_unit = $7, color = $8, price = $9, stock = $10, sku = $11, image = $12, use_separate_gallery = $13, override_discount = $14, discount_type = $15, discount_value = $16
           WHERE id = $17 AND product_id = $18`,
          [
            normalized.size,
            normalized.size_value,
            normalized.size_unit,
            normalized.size_info,
            normalized.variety,
            normalized.sub_size,
            normalized.sub_size_unit,
            normalized.color,
            normalized.price,
            normalized.stock,
            normalized.sku,
            normalized.image,
            normalized.use_separate_gallery,
            normalized.override_discount,
            normalized.discount_type,
            normalized.discount_value,
            variantId,
            id
          ]
        );
      } else {
        const insertedVariant = await client.query(
          `INSERT INTO product_variant (product_id, size, size_value, size_unit, size_info, variety, sub_size, sub_size_unit, color, price, stock, sku, image, use_separate_gallery, override_discount, discount_type, discount_value)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
           RETURNING id`,
          [
            id,
            normalized.size,
            normalized.size_value,
            normalized.size_unit,
            normalized.size_info,
            normalized.variety,
            normalized.sub_size,
            normalized.sub_size_unit,
            normalized.color,
            normalized.price,
            normalized.stock,
            normalized.sku,
            normalized.image,
            normalized.use_separate_gallery,
            normalized.override_discount,
            normalized.discount_type,
            normalized.discount_value
          ]
        );
        incomingVariantIds.add(insertedVariant.rows[0].id);
      }
    }

    const variantIdsToDelete = [...existingVariantIds].filter((variantId) => !incomingVariantIds.has(variantId));
    if (variantIdsToDelete.length > 0) {
      await client.query(
        `DELETE FROM product_variant WHERE id = ANY($1::uuid[]) AND product_id = $2`,
        [variantIdsToDelete, id]
      );
    }

    await client.query('COMMIT');

    // Fetch updated product and variants to return to client
    const productResult2 = await pool.query(
      `SELECT p.*, c.name AS category_name, a.name AS audience_name FROM product p LEFT JOIN category c ON p.category_id = c.id LEFT JOIN audiences a ON p.audience = a.id WHERE p.id = $1`,
      [id]
    );
    const variantsResult2 = await pool.query(
      `SELECT * FROM product_variant WHERE product_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    res.json({
      message: 'Product updated',
      product: productResult2.rows[0] || null,
      variants: variantsResult2.rows
    });
  } catch (err) {
    await client.query('ROLLBACK');
    if (isDuplicateSkuError(err)) {
      return res.status(409).json({ error: 'SKU already exists', sku: extractDuplicateSku(err) });
    }
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

exports.updateVariantDiscount = async (req, res) => {
  const { id } = req.params; // Actually variantId
  const { override_discount, discount_type, discount_value } = req.body;
  try {
    const result = await pool.query(
      `UPDATE product_variant 
       SET override_discount = $1, discount_type = $2, discount_value = $3, updated_at = now() 
       WHERE id = $4 RETURNING id`,
      [override_discount, discount_type, discount_value, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Variant not found' });
    }
    res.json({ message: 'Discount updated successfully', variant_id: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


