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
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    family: 4, // Force IPv4 to prevent IPv6 ENETUNREACH errors on deployed environments
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
          <p style="color: #ef4444; font-size: 12px; margin-top: 16px; margin-bottom: 0; font-weight: 500;">This verification code is valid for 5 minutes.</p>
        </div>
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
