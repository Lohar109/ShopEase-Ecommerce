require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;
const dbUrl = process.env.DATABASE_URL || '';
const useManagedSsl = dbUrl.includes('supabase.com') || dbUrl.includes('pooler.supabase.com');

app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: dbUrl,
  ssl: useManagedSsl ? { rejectUnauthorized: false } : undefined,
});

// Test route
app.get('/', (req, res) => {
  res.send('ShopEase backend is running!');
});

// Test DB connection route
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Registration route

const usersRoute = require('./routes/users');
app.use('/api', usersRoute);



const productsRoute = require('./routes/products');
app.use('/api/products', productsRoute);

// Categories route
const categoriesRoute = require('./routes/categories');
app.use('/api/categories', categoriesRoute);

// Admin route
const adminRoute = require('./routes/admin');
app.use('/api/admin', adminRoute);

// Wishlist route
const wishlistRoute = require('./routes/wishlistRoutes');
app.use('/api/wishlist', wishlistRoute);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
