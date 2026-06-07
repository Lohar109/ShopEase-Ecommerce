require('dotenv').config();
const nodemailer = require('nodemailer');
const dns = require('dns');

// Force Node to prioritize IPv4 DNS results globally
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

async function testSMTP() {
  const targetHost = 'smtp.gmail.com';
  console.log(`Connecting to ${targetHost} on port 587 with ipv4first priority...`);

  const transporter = nodemailer.createTransport({
    host: targetHost,
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS
    }
  });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const mailOptions = {
    from: `"ShopEase Support" <${process.env.GMAIL_USER}>`,
    to: 'vaibhavlohar109@gmail.com',
    subject: `ShopEase Domain Verification Test - ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
        <h3>ShopEase Domain Verification Test</h3>
        <p>Testing connection using domain name with ipv4first result order.</p>
        <h2 style="color: #db2777; font-size: 28px;">${otp}</h2>
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

testSMTP();
