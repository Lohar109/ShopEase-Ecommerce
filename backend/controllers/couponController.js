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

let isTableReady = false;

const ensureCouponsTable = async () => {
  if (isTableReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS coupon (
      id BIGSERIAL PRIMARY KEY,
      code VARCHAR(64) NOT NULL,
      discount_type VARCHAR(16) NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
      discount_value NUMERIC(12, 2) NOT NULL CHECK (discount_value > 0),
      min_order_value NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (min_order_value >= 0),
      expiry_date TIMESTAMPTZ NOT NULL,
      description TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_coupon_code_unique ON coupon (LOWER(code))');

  isTableReady = true;
};

const normalizeDiscountType = (value) => {
  const normalized = String(value || '').toLowerCase().trim();
  return normalized === 'flat' ? 'flat' : normalized === 'percentage' ? 'percentage' : null;
};

const validateCouponPayload = (payload) => {
  const code = String(payload.code || '').trim().toUpperCase();
  const discountType = normalizeDiscountType(payload.discount_type);
  const discountValue = Number(payload.discount_value);
  const minOrderValue = Number(payload.min_order_value || 0);
  const expiryDate = payload.expiry_date;
  const description = String(payload.description || '').trim();

  if (!code) return { error: 'Coupon code is required' };
  if (!discountType) return { error: 'Discount type must be percentage or flat' };
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    return { error: 'Discount value must be greater than 0' };
  }
  if (!Number.isFinite(minOrderValue) || minOrderValue < 0) {
    return { error: 'Minimum order value cannot be negative' };
  }
  if (!expiryDate || Number.isNaN(Date.parse(expiryDate))) {
    return { error: 'Expiry date is invalid' };
  }

  return {
    value: {
      code,
      discountType,
      discountValue,
      minOrderValue,
      expiryDate,
      description
    }
  };
};

exports.getAllCoupons = async (req, res) => {
  try {
    await ensureCouponsTable();

    const result = await pool.query(
      `SELECT id, code, discount_type, discount_value, min_order_value, expiry_date, description, is_active, created_at, updated_at
       FROM coupon
       ORDER BY expiry_date ASC, created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCouponById = async (req, res) => {
  try {
    await ensureCouponsTable();

    const result = await pool.query(
      `SELECT id, code, discount_type, discount_value, min_order_value, expiry_date, description, is_active, created_at, updated_at
       FROM coupon WHERE id = $1`,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    await ensureCouponsTable();

    const validation = validateCouponPayload(req.body);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const { code, discountType, discountValue, minOrderValue, expiryDate, description } = validation.value;

    const result = await pool.query(
      `INSERT INTO coupon (code, discount_type, discount_value, min_order_value, expiry_date, description, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, code, discount_type, discount_value, min_order_value, expiry_date, description, is_active, created_at, updated_at`,
      [code, discountType, discountValue, minOrderValue, expiryDate, description, true]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err?.code === '23505') {
      return res.status(409).json({ error: 'Coupon code already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    await ensureCouponsTable();

    const validation = validateCouponPayload(req.body);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const { code, discountType, discountValue, minOrderValue, expiryDate, description } = validation.value;

    const result = await pool.query(
      `UPDATE coupon
       SET code = $1,
           discount_type = $2,
           discount_value = $3,
           min_order_value = $4,
           expiry_date = $5,
           description = $6,
           updated_at = now()
       WHERE id = $7
       RETURNING id, code, discount_type, discount_value, min_order_value, expiry_date, description, is_active, created_at, updated_at`,
      [code, discountType, discountValue, minOrderValue, expiryDate, description, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    if (err?.code === '23505') {
      return res.status(409).json({ error: 'Coupon code already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.updateCouponStatus = async (req, res) => {
  try {
    await ensureCouponsTable();

    const isActive = req.body?.is_active;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'is_active must be a boolean' });
    }

    const result = await pool.query(
      `UPDATE coupon
       SET is_active = $1,
           updated_at = now()
       WHERE id = $2
       RETURNING id, code, discount_type, discount_value, min_order_value, expiry_date, description, is_active, created_at, updated_at`,
      [isActive, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    await ensureCouponsTable();

    const result = await pool.query('DELETE FROM coupon WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    res.json({ message: 'Coupon deleted', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
