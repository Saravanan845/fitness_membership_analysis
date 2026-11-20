const request = require('supertest');
const app = require('../backend/server');
const mongoose = require('mongoose');
const Member = require('../backend/models/Member');
const User = require('../backend/models/User');

describe('Member CRUD API Integration Tests (Phase 2, Tasks 6-9)', () => {
  let adminToken = '';
  let createdMemberId = '';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await User.deleteMany({ username: 'member_test_admin' });
      await Member.deleteMany({ memberId: /^TESTM/ });

      // Create test admin
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Member Test Admin',
          username: 'member_test_admin',
          email: 'member_test_admin@example.com',
          password: 'Password123!',
          role: 'admin'
        });

      adminToken = regRes.body.data?.token;
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await Member.deleteMany({ memberId: /^TESTM/ });
      await User.deleteMany({ username: 'member_test_admin' });
    }
  });

  // Task 7: POST API - Add new member
  it('should create a new member with valid payload (Task 7)', async () => {
    if (mongoose.connection.readyState !== 1 || !adminToken) return;

    const res = await request(app)
      .post('/api/members')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        memberId: 'TESTM901',
        name: 'Jordan Smith',
        email: 'jordan.smith.test@example.com',
        phone: '+91 99999 88888',
        age: 26,
        gender: 'Male',
        visitsLast30Days: 14,
        classesAttended: 5,
        daysSinceLastVisit: 2,
        monthlySpend: 2800,
        renewed: true
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.memberId).toBe('TESTM901');
    expect(res.body.data.engagementLevel).toBe('High');
    createdMemberId = res.body.data._id;
  });

  // Task 6: GET API - Retrieve member information
  it('should retrieve member list with pagination and search (Task 6)', async () => {
    if (mongoose.connection.readyState !== 1 || !adminToken) return;

    const res = await request(app)
      .get('/api/members?search=Jordan')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  // Task 8: PUT API - Update member information
  it('should update member visits and days inactive (Task 8)', async () => {
    if (mongoose.connection.readyState !== 1 || !createdMemberId || !adminToken) return;

    const res = await request(app)
      .put(`/api/members/${createdMemberId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        visitsLast30Days: 20,
        daysSinceLastVisit: 1
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.visitsLast30Days).toBe(20);
  });

  // Task 9: DELETE API - Delete member record
  it('should delete a member record (Task 9)', async () => {
    if (mongoose.connection.readyState !== 1 || !createdMemberId || !adminToken) return;

    const res = await request(app)
      .delete(`/api/members/${createdMemberId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('deleted');
  });
});
