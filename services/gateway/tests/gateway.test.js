const request = require('supertest');
const express = require('express');
const authRouter = require('../routes/auth');

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Node.js Gateway' }));

describe('Gateway API', () => {
  describe('GET /api/health', () => {
    it('should return 200 with service status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('Node.js Gateway');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return a JWT token for a valid Google login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ provider: 'google', name: 'Test User', email: 'test@gmail.com' });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.provider).toBe('google');
      expect(res.body.user.email).toBe('test@gmail.com');
      expect(res.body.bookings).toBeInstanceOf(Array);
    });

    it('should return a JWT token for a valid Instagram login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ provider: 'instagram', name: 'IG User', email: 'ig@instagram.com' });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.provider).toBe('instagram');
    });

    it('should return 400 if provider is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ provider: 'google' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user data with a valid token', async () => {
      // First login to get a token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ provider: 'google', name: 'Me User', email: 'me@gmail.com' });

      const token = loginRes.body.token;

      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.statusCode).toBe(200);
      expect(meRes.body.user.email).toBe('me@gmail.com');
      expect(meRes.body.bookings).toBeInstanceOf(Array);
    });

    it('should return 401 without a token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('should return 401 with an invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token-here');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return success', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
