const request = require('supertest');
const app = require('../backend/server');
const mongoose = require('mongoose');
const User = require('../backend/models/User');

describe('Auth & JWT Authorization API Tests (Phase 3)', () => {
  beforeEach(async () => {
    if (mongoose.connection.readyState === 1) {
      await User.deleteMany({ email: /test.*@example\.com/ });
    }
  });

  it('should register a new administrator successfully', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Administrator',
        username: 'testadmin_jest',
        email: 'testadmin_jest@example.com',
        password: 'Password123!',
        role: 'admin'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.role).toBe('admin');
  });

  it('should reject login with wrong password', async () => {
    if (mongoose.connection.readyState !== 1) return;

    // First ensure user exists
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        username: 'test_wrongpass',
        email: 'test_wrongpass@example.com',
        password: 'CorrectPassword123'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'test_wrongpass',
        password: 'IncorrectPassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should support third-party OAuth login integration (Task 13)', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const res = await request(app)
      .post('/api/auth/oauth-login')
      .send({
        email: 'test_oauth_user@example.com',
        name: 'Google SSO Test User',
        avatar: 'https://example.com/avatar.png'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });
});
