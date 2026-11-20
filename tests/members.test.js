const request = require('supertest');
const app = require('../backend/server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

describe('Members CRUD APIs & Entity Relationships (Phases 1 & 2)', () => {
  let mockToken;

  beforeAll(() => {
    mockToken = jwt.sign(
      { id: new mongoose.Types.ObjectId() },
      process.env.JWT_SECRET || 'fittrack_secret_key_123456789',
      { expiresIn: '1h' }
    );
  });

  it('should reject unauthenticated request to /api/members with 401', async () => {
    const res = await request(app).get('/api/members');
    expect(res.statusCode).toBe(401);
  });

  it('should return healthcheck status 200 without auth', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});
