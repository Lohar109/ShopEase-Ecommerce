const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign(
      { role: 'admin', email: ADMIN_EMAIL },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    return res.json({ message: 'Login successful', token });
  }
  return res.status(401).json({ message: 'Invalid credentials' });
});

module.exports = router;
