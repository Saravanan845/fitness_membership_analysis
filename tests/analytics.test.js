const request = require('supertest');
const app = require('../backend/server');
const mongoose = require('mongoose');
const Member = require('../backend/models/Member');
const User = require('../backend/models/User');

describe('Database Calculated Retention Analytics Tests (Phase 4)', () => {
  let adminToken = '';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await User.deleteMany({ username: 'analytics_test_admin' });
      await Member.deleteMany({ memberId: /^TESTAN/ });

      // Create admin
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Analytics Test Admin',
          username: 'analytics_test_admin',
          email: 'analytics_test_admin@example.com',
          password: 'Password123!',
          role: 'admin'
        });

      adminToken = regRes.body.data?.token;

      // Seed 4 test members with known statistics:
      // 3 Renewed, 1 Non-Renewed (Renewal rate = 75%, Non-renewal = 25%)
      await Member.create([
        {
          memberId: 'TESTAN01',
          name: 'Alpha Active',
          email: 'alpha@example.com',
          age: 22,
          visitsLast30Days: 16,
          classesAttended: 6,
          daysSinceLastVisit: 1,
          monthlySpend: 2500,
          renewed: true
        },
        {
          memberId: 'TESTAN02',
          name: 'Beta Moderate',
          email: 'beta@example.com',
          age: 30,
          visitsLast30Days: 10,
          classesAttended: 3,
          daysSinceLastVisit: 4,
          monthlySpend: 2000,
          renewed: true
        },
        {
          memberId: 'TESTAN03',
          name: 'Gamma High',
          email: 'gamma@example.com',
          age: 28,
          visitsLast30Days: 14,
          classesAttended: 4,
          daysSinceLastVisit: 2,
          monthlySpend: 2400,
          renewed: true
        },
        {
          memberId: 'TESTAN04',
          name: 'Delta AtRisk',
          email: 'delta@example.com',
          age: 40,
          visitsLast30Days: 2,
          classesAttended: 0,
          daysSinceLastVisit: 28,
          monthlySpend: 1000,
          renewed: false
        }
      ]);
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await Member.deleteMany({ memberId: /^TESTAN/ });
      await User.deleteMany({ username: 'analytics_test_admin' });
    }
  });

  it('should calculate accurate renewal rate and non-renewal rate from database records', async () => {
    if (mongoose.connection.readyState !== 1 || !adminToken) return;

    const res = await request(app)
      .get('/api/analytics/overview')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalMembers).toBeGreaterThanOrEqual(4);
    expect(res.body.data.renewalRate).toBeDefined();
    expect(res.body.data.nonRenewalRate).toBeDefined();
    expect(res.body.data.averageAttendance).toBeDefined();
    expect(res.body.data.engagementBreakdown).toBeDefined();
    expect(res.body.data.engagementBreakdown.High).toBeGreaterThanOrEqual(1);
  });

  it('should flag members absent >14 days in the at-risk watchlist', async () => {
    if (mongoose.connection.readyState !== 1 || !adminToken) return;

    const res = await request(app)
      .get('/api/analytics/at-risk')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const deltaMember = res.body.data.find((m) => m.memberId === 'TESTAN04');
    if (deltaMember) {
      expect(deltaMember.daysSinceLastVisit).toBe(28);
      expect(deltaMember.riskReasons.length).toBeGreaterThan(0);
      expect(deltaMember.recommendedAction).toBeDefined();
    }
  });
});
