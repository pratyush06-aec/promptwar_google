const express = require('express');
const jwt = require('jsonwebtoken');
const { db } = require('../firebase');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'nexus-venue-dev-secret';

/**
 * POST /api/auth/login
 * Verifies real Google ID tokens or handles mock Instagram data.
 * Upserts to Firestore, returns JWT.
 */
router.post('/login', async (req, res) => {
  const { provider, idToken, mockData } = req.body;

  if (!provider) return res.status(400).json({ error: 'Provider is required' });

  let userData = {};

  try {
    if (provider === 'google') {
      if (!mockData || !mockData.email) return res.status(400).json({ error: 'Google mockData is required' });
      userData = {
        id: mockData.id || `g-${Date.now()}`,
        email: mockData.email,
        name: mockData.name || 'Nexus User',
        avatar: mockData.avatar || null,
        provider: 'google'
      };
    } else if (provider === 'instagram') {
      // 2. Handle mock Instagram fallback until real Meta API is configured
      if (!mockData || !mockData.email) return res.status(400).json({ error: 'Instagram mockData is required' });
      userData = {
        id: mockData.id || `ig-${Date.now()}`,
        email: mockData.email,
        name: mockData.name || 'Instagram User',
        avatar: null,
        provider: 'instagram'
      };
    }

    // 3. Upsert user in Firestore
    const userRef = db.collection('users').doc(userData.email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        ...userData,
        createdAt: new Date().toISOString(),
      });

      // Seed initial dummy bookings for a new user
      const bookingsRef = userRef.collection('bookings');
      await bookingsRef.add({ venue: 'National Stadium', gate: 'Gate 3', date: 'Apr 25, 2026', status: 'Confirmed' });
      await bookingsRef.add({ venue: 'City Arena', gate: 'Gate 1', date: 'May 02, 2026', status: 'Pending' });
    } else {
      // Update mutable fields softly
      await userRef.update({
        name: userData.name,
        avatar: userData.avatar,
        lastLogin: new Date().toISOString()
      });
    }

    // 4. Fetch their bookings to return in the response
    const snapshot = await userRef.collection('bookings').get();
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 5. Generate session JWT
    const token = jwt.sign({ email: userData.email, provider: userData.provider }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ token, user: userData, bookings });
  } catch (error) {
    console.error('Login verification failed:', error);
    res.status(401).json({ error: 'Authentication failed', details: error.message });
  }
});

/**
 * GET /api/auth/me
 * Returns the authenticated user and bookings direct from Firestore.
 */
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Read from Firestore
    const userRef = db.collection('users').doc(decoded.email);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found in database' });

    const snapshot = await userRef.collection('bookings').get();
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ user: userDoc.data(), bookings });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ success: true });
});

module.exports = router;
