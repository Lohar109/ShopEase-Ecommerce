const express = require('express');
const { Pool } = require('pg');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

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

const PAID_STATUSES = ['paid', 'captured'];

// GET /api/admin/stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [
      totalUsersResult,
      totalProductsResult,
      totalOrdersResult,
      totalRevenueResult,
      recentSignupsResult,
      recentOrdersResult,
      signupsLast7DaysResult,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM product'),
      pool.query('SELECT COUNT(*) FROM orders WHERE status = ANY($1)', [PAID_STATUSES]),
      pool.query('SELECT COALESCE(SUM(amount), 0) AS total FROM orders WHERE status = ANY($1)', [PAID_STATUSES]),
      pool.query(
        `SELECT id, email, first_name, last_name, created_at
         FROM users
         ORDER BY created_at DESC
         LIMIT 10`
      ),
      pool.query(
        `SELECT id, razorpay_order_id, amount, status, created_at
         FROM orders
         ORDER BY created_at DESC
         LIMIT 10`
      ),
      pool.query(`SELECT COUNT(*) FROM users WHERE created_at >= now() - interval '7 days'`),
    ]);

    res.json({
      totalUsers: Number(totalUsersResult.rows[0].count),
      totalProducts: Number(totalProductsResult.rows[0].count),
      totalOrders: Number(totalOrdersResult.rows[0].count),
      totalRevenue: Number(totalRevenueResult.rows[0].total),
      recentSignups: recentSignupsResult.rows,
      recentOrders: recentOrdersResult.rows,
      signupsLast7Days: Number(signupsLast7DaysResult.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
