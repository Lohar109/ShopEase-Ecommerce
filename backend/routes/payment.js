const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Pool } = require('pg');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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

// Compute a variant's effective unit price after its own discount, mirroring
// the calculation in frontend/src/pages/Payment.jsx. The DB has no separate
// "mrp" column - `price` is the base price that discounts are applied to.
const computeVariantUnitPrice = (variant) => {
  const basePrice = Number(variant.price || 0);
  const discountValue = Number(variant.discount_value || 0);
  const discountType = String(variant.discount_type || '').toLowerCase();

  let savings = 0;
  if (discountValue > 0 && discountType === 'percentage') {
    savings = (basePrice * discountValue) / 100;
  } else if (discountValue > 0 && discountType === 'fixed') {
    savings = discountValue;
  }

  return { basePrice, unitPrice: Math.max(0, basePrice - savings) };
};

// POST /api/payment/create-order
router.post('/create-order', async (req, res) => {
  try {
    const { items, deliveryMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items are required' });
    }

    let totalMRP = 0;
    let totalDiscount = 0;

    for (const item of items) {
      const quantity = Number(item?.quantity || 0);
      if (!item?.productId || !item?.variantId || quantity <= 0) {
        return res.status(400).json({ error: 'Each item requires productId, variantId and quantity' });
      }

      const variantResult = await pool.query(
        `SELECT price, discount_type, discount_value
         FROM product_variant
         WHERE id = $1 AND product_id = $2`,
        [item.variantId, item.productId]
      );

      if (variantResult.rowCount === 0) {
        return res.status(400).json({ error: `Variant ${item.variantId} not found for product ${item.productId}` });
      }

      const { basePrice, unitPrice } = computeVariantUnitPrice(variantResult.rows[0]);
      totalMRP += basePrice * quantity;
      totalDiscount += (basePrice - unitPrice) * quantity;
    }

    // Platform fee is currently zero across the checkout flow (see Cart/Shipping/
    // Checkout/Payment). Delivery fee is a fixed lookup, not price-derived, so it
    // is safe to trust from the client.
    const platformFee = 0;
    const deliveryFee = deliveryMethod === 'sameday' ? 249 : (deliveryMethod === 'express' ? 149 : 0);

    // TODO: Coupon/discount-code validation is not implemented server-side yet.
    // The frontend cart UI lets a user apply a coupon, but that reduction is
    // never sent to or verified by this endpoint. Add server-side coupon
    // lookup/validation here before relying on this for real discounts.
    const amount = Math.round((totalMRP - totalDiscount + platformFee + deliveryFee) * 100) / 100;

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payment/verify
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, shipping_address } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Fetch the authoritative order amount/currency from Razorpay rather than
      // trusting anything client-supplied.
      const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);

      await pool.query(
        `INSERT INTO orders
           (user_id, razorpay_order_id, razorpay_payment_id, amount, currency, status, details)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          null,
          razorpay_order_id,
          razorpay_payment_id,
          razorpayOrder.amount / 100,
          razorpayOrder.currency,
          'paid',
          JSON.stringify({ items: items || null, shipping_address: shipping_address || null }),
        ]
      );

      return res.json({ verified: true });
    }

    res.status(400).json({ verified: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
