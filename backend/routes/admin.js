const express = require('express');
const router = express.Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    // Optionally generate a token here
    return res.json({ message: 'Login successful', token: 'yourToken' });
  }
  return res.status(401).json({ message: 'Invalid credentials' });
});

module.exports = router;
