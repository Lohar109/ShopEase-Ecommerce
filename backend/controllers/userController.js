const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_startup');

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

exports.registerUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2)',
      [email, hashedPassword]
    );
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Debug log to verify process.env configuration
  console.log('[DEBUG] Incoming userController login. Current ENV admin credentials:', {
    envEmail: process.env.ADMIN_EMAIL,
    envPassword: process.env.ADMIN_PASSWORD
  });

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Compare against Admin Credentials from process.env
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign(
      { userId: 'admin', email: email, role: 'admin' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );
    return res.json({ token, message: 'Admin Login Successful' });
  }

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crypto = require('crypto');

let isOtpTableReady = false;

const ensureOtpTable = async () => {
  if (isOtpTableReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_otps (
      email VARCHAR(255) PRIMARY KEY,
      otp VARCHAR(6) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  isOtpTableReady = true;
};

exports.sendOtp = async (req, res) => {
  const { email, mode } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }
  if (mode !== 'login' && mode !== 'register') {
    return res.status(400).json({ error: 'Invalid mode specified.' });
  }

  try {
    await ensureOtpTable();

    // Check user existence based on mode
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    const userExists = userResult.rows.length > 0;

    if (mode === 'register' && userExists) {
      return res.status(409).json({ error: 'User already exists. Please login.' });
    }
    if (mode === 'login' && !userExists) {
      return res.status(404).json({ error: 'Email not registered. Please sign up.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // Upsert into user_otps
    await pool.query(
      `INSERT INTO user_otps (email, otp, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (email)
       DO UPDATE SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at, created_at = now()`,
      [email, otp, expiresAt]
    );

    try {
      const result = await resend.emails.send({
        from: 'ShopEase <onboarding@resend.dev>',
        to: email,
        subject: `Your ShopEase OTP is ${otp}`,
        html: `<p>Your OTP is <strong>${otp}</strong>. Valid for 10 minutes.</p>`
      });
      console.log('Resend success:', JSON.stringify(result));
    } catch (err) {
      console.error('Resend error:', JSON.stringify(err));
      return res.status(500).json({ message: 'Email send failed', error: err.message });
    }
    res.json({ message: 'OTP sent successfully.' });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp, mode } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required.' });
  }
  if (mode !== 'login' && mode !== 'register') {
    return res.status(400).json({ error: 'Invalid mode specified.' });
  }

  try {
    await ensureOtpTable();

    // Retrieve OTP record
    const otpResult = await pool.query('SELECT * FROM user_otps WHERE email = $1', [email]);
    if (otpResult.rows.length === 0) {
      return res.status(400).json({ error: 'No OTP requested for this email.' });
    }

    const { otp: storedOtp, expires_at: expiresAt } = otpResult.rows[0];

    // Check expiration
    if (new Date() > new Date(expiresAt)) {
      await pool.query('DELETE FROM user_otps WHERE email = $1', [email]);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Check match
    if (storedOtp !== otp) {
      return res.status(400).json({ error: 'Incorrect OTP. Please check and try again.' });
    }

    // Delete verification record upon success
    await pool.query('DELETE FROM user_otps WHERE email = $1', [email]);

    let userId;
    if (mode === 'register') {
      // Create user
      // Generate a secure random password to satisfy column NOT NULL constraint
      const randomPassword = crypto.randomUUID();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      const insertResult = await pool.query(
        'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
        [email, hashedPassword]
      );
      userId = insertResult.rows[0].id;
    } else {
      // Get existing user ID
      const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      userId = userResult.rows[0].id;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.json({ token, message: mode === 'register' ? 'Registration successful!' : 'Login successful!' });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ error: err.message });
  }
};

