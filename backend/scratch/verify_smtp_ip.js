require('dotenv').config();
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const dns = require('dns');

async function testSMTP() {
  console.log('Resolving smtp.gmail.com to IPv4...');
  
  const targetIp = await new Promise((resolve, reject) => {
    dns.lookup('smtp.gmail.com', { family: 4 }, (err, address) => {
      if (err) return reject(err);
      resolve(address);
    });
  });

  console.log(`Connecting directly to IPv4: ${targetIp} with servername: smtp.gmail.com`);

  const transporter = nodemailer.createTransport({
    host: targetIp,
    port: 587,
    secure: false,
    tls: {
      servername: 'smtp.gmail.com', // Verifies SSL certificate against the domain, not the IP
      rejectUnauthorized: true
    },
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS
    }
  });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const mailOptions = {
    from: `"ShopEase Support" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER, // Send to self
    subject: `ShopEase IP Verification Test Code - ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
        <h3>ShopEase Direct IP Verification Test</h3>
        <p>This is a real-time verification test from ShopEase server script using direct IPv4 address.</p>
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
