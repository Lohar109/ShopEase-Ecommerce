require('dotenv').config();
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

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

async function testDatabase() {
  console.log('Testing database connection...');
  try {
    const res = await pool.query(`
      CREATE TABLE IF NOT EXISTS user_otps (
        email VARCHAR(255) PRIMARY KEY,
        otp VARCHAR(6) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    console.log('Database user_otps table checked/created successfully.', res.rowCount);
  } catch (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
}

async function testSMTP() {
  console.log('Testing SMTP connection with credentials:', {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS ? '********' : 'undefined'
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS
    }
  });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const mailOptions = {
    from: `"ShopEase Support" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER, // Send to self
    subject: `ShopEase SMTP Verification Test Code - ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
        <h3>ShopEase SMTP Verification Test</h3>
        <p>This is a real-time verification test from ShopEase server script.</p>
        <h2 style="color: #db2777; font-size: 28px;">${otp}</h2>
        <p>If you received this, the nodemailer credentials are set up and working perfectly!</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully. Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (err) {
    console.error('SMTP sending failed:', err);
    throw err;
  }
}

async function run() {
  try {
    await testDatabase();
    await testSMTP();
    console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Verification failed during execution.');
  } finally {
    await pool.end();
  }
}

run();
