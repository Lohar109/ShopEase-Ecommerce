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
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

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
        from: 'ShopEase <noreply@shopease.sbs>',
        to: email,
        subject: 'OTP for ShopEase Login',
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
        },
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; background-color: #000000; padding: 12px 32px; border-radius: 10px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="position: relative; display: inline-block;">
                  <span style="color: #ffffff; font-family: 'Poppins', 'Segoe UI', Arial, sans-serif; font-size: 26px; font-weight: 600; letter-spacing: -0.5px; line-height: 1.2; display: block;">Shop<span style="color: #FF6B6B;">E</span>ase</span>
                  <div style="position: absolute; left: 54px; right: 2px; bottom: -4px; height: 6px; border-bottom: 2px solid #FF6B6B; border-radius: 50%;"></div>
                </div>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 8px; margin-bottom: 0;">Your ultimate shopping destination</p>
            </div>
            <div style="padding: 20px; background-color: #fdf2f8; border-radius: 8px; text-align: center; border: 1px solid #fbcfe8;">
              <p style="color: #374151; font-size: 16px; margin-top: 0; margin-bottom: 16px; font-weight: 500;">Please use the following verification code to complete your verification:</p>
              <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #db2777; margin: 20px 0; background: #ffffff; padding: 12px; display: inline-block; border-radius: 8px; border: 1px dashed #db2777; min-width: 160px; text-align: center;">
                ${otp}
              </div>
              <p style="color: #ef4444; font-size: 12px; margin-top: 16px; margin-bottom: 0; font-weight: 500;">This verification code is valid for 10 minutes.</p>
            </div>
            <div style="margin-top: 24px; color: #9ca3af; font-size: 12px; text-align: center; line-height: 1.5;">
              <p style="margin: 0 0 8px 0;">If you did not request this OTP, please ignore this email.</p>
              <p style="margin: 0;">© 2026 ShopEase. All rights reserved.</p>
            </div>
          </div>
        `
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
  const { email, otp, mode, firstName, lastName } = req.body;
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
    let firstNameVal = '';
    let lastNameVal = '';

    if (mode === 'register') {
      // Create user
      // Generate a secure random password to satisfy column NOT NULL constraint
      const randomPassword = crypto.randomUUID();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      const insertResult = await pool.query(
        'INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name',
        [email, hashedPassword, firstName || null, lastName || null]
      );
      userId = insertResult.rows[0].id;
      firstNameVal = insertResult.rows[0].first_name;
      lastNameVal = insertResult.rows[0].last_name;
    } else {
      // Get existing user ID and names
      const userResult = await pool.query('SELECT id, first_name, last_name FROM users WHERE email = $1', [email]);
      userId = userResult.rows[0].id;
      firstNameVal = userResult.rows[0].first_name;
      lastNameVal = userResult.rows[0].last_name;
    }

    // Generate JWT token including names
    const token = jwt.sign(
      { 
        userId, 
        email, 
        firstName: firstNameVal || '', 
        lastName: lastNameVal || '' 
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      firstName: firstNameVal || '',
      message: mode === 'register' ? 'Registration successful!' : 'Login successful!' 
    });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ error: err.message });
  }
};

