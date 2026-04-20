const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'nexus-venue-dev-secret';

// In-memory user store (swap for a real DB in production)
const users = new Map();

/**
 * POST /api/auth/login
 * Accepts mock OAuth user data, creates/retrieves user, returns JWT.
 */
router.post('/login', (req, res) => {
  const { provider, name, email, id } = req.body;

  if (!provider || !email) {
    return res.status(400).json({ error: 'provider and email are required' });
  }

  // Upsert user
  let user = users.get(email);
  if (!user) {
    user = {
      id: id || `${provider}-${Date.now()}`,
      name: name || 'Nexus User',
      email,
      provider,
      createdAt: new Date().toISOString(),
      bookings: [
        { id: 1, venue: 'National Stadium', gate: 'Gate 3', date: 'Apr 25, 2026', status: 'Confirmed' },
        { id: 2, venue: 'City Arena', gate: 'Gate 1', date: 'May 02, 2026', status: 'Pending' },
        { id: 3, venue: 'Mega Dome', gate: 'VIP Entrance', date: 'May 15, 2026', status: 'Confirmed' },
      ],
    };
    users.set(email, user);
  }

  const token = jwt.sign({ email: user.email, provider: user.provider }, JWT_SECRET, { expiresIn: '24h' });

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, provider: user.provider },
    bookings: user.bookings,
  });
});

/**
 * GET /api/auth/me
 * Returns the authenticated user from the JWT.
 */
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.get(decoded.email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user: { id: user.id, name: user.name, email: user.email, provider: user.provider }, bookings: user.bookings });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

/**
 * POST /api/auth/logout
 * Placeholder — JWT is stateless, client clears the token.
 */
router.post('/logout', (req, res) => {
  res.json({ success: true });
});

module.exports = router;
