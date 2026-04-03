const express = require('express');
const router = express.Router();

const ADMIN_EMAIL = 'admin@example.com'; // Change to your desired admin email
const ADMIN_PASSWORD = 'admin123'; // Change to your desired admin password

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    // Optionally generate a token here
    return res.json({ message: 'Login successful', token: 'yourToken' });
  }
  return res.status(401).json({ message: 'Invalid credentials' });
});

module.exports = router;
