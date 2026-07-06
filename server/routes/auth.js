const express = require('express');
const bcrypt = require('bcryptjs');
const { readDB, writeDB, genId } = require('../db');
const { validateRegistration, validateLogin } = require('../utils/validators');
const { signToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

const MAX_ATTEMPTS = 5;
const LOCK_MS = 60 * 1000; // 1 minute lockout, long enough to test, short enough to retry in a demo

router.post('/register', (req, res) => {
  const errors = validateRegistration(req.body);
  const db = readDB();

  const { username, email } = req.body || {};
  if (!errors.username && db.users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
    errors.username = 'Username is already taken';
  }
  if (!errors.email && db.users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
    errors.email = 'An account with this email already exists';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const user = {
    id: genId('user'),
    username: req.body.username.trim(),
    email: req.body.email.trim().toLowerCase(),
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    role: 'customer',
    failedAttempts: 0,
    lockUntil: null,
    createdAt: new Date().toISOString()
  };
  db.users.push(user);
  db.carts[user.id] = [];
  writeDB(db);

  const token = signToken(user);
  res.status(201).json({
    success: true,
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role }
  });
});

router.post('/login', (req, res) => {
  const errors = validateLogin(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const db = readDB();
  const { username, password } = req.body;
  const user = db.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());

  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid username or password' });
  }

  if (user.lockUntil && user.lockUntil > Date.now()) {
    const secondsLeft = Math.ceil((user.lockUntil - Date.now()) / 1000);
    return res.status(423).json({
      success: false,
      error: `Account temporarily locked due to failed login attempts. Try again in ${secondsLeft}s.`
    });
  }

  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) {
    user.failedAttempts = (user.failedAttempts || 0) + 1;
    if (user.failedAttempts >= MAX_ATTEMPTS) {
      user.lockUntil = Date.now() + LOCK_MS;
      user.failedAttempts = 0;
      writeDB(db);
      return res.status(423).json({
        success: false,
        error: 'Account locked for 60 seconds after too many failed attempts.'
      });
    }
    writeDB(db);
    return res.status(401).json({
      success: false,
      error: 'Invalid username or password',
      attemptsRemaining: MAX_ATTEMPTS - user.failedAttempts
    });
  }

  user.failedAttempts = 0;
  user.lockUntil = null;
  writeDB(db);

  const token = signToken(user);
  res.json({
    success: true,
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role }
  });
});

router.get('/me', requireAuth, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });
  res.json({ success: true, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
});

module.exports = router;
