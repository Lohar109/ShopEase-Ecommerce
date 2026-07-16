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

// POST /api/payment/create-order
router.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    // TODO: Before going live, recalculate `amount` server-side from the
    // database (products, quantities, discounts, fees) instead of trusting
    // the value sent by the client, to prevent price tampering.

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
