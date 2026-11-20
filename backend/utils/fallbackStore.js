// In-memory resilient data store when MongoDB is not running locally
// Pre-seeded with exact data from sample_members.csv & default admin account

const initialMembers = [
  { _id: '673d00000000000000000101', memberId: 'M1001', name: 'Aarav Sharma', email: 'aarav.sharma@example.com', phone: '+91 98765 43210', age: 21, gender: 'Male', visitsLast30Days: 18, classesAttended: 6, daysSinceLastVisit: 2, monthlySpend: 2500, renewed: true, status: 'Active', engagementLevel: 'High', riskLevel: 'Low', createdAt: new Date() },
  { _id: '673d00000000000000000102', memberId: 'M1002', name: 'Priya Patel', email: 'priya.patel@example.com', phone: '+91 98765 43211', age: 28, gender: 'Female', visitsLast30Days: 13, classesAttended: 4, daysSinceLastVisit: 4, monthlySpend: 2200, renewed: true, status: 'Active', engagementLevel: 'High', riskLevel: 'Low', createdAt: new Date() },
  { _id: '673d00000000000000000103', memberId: 'M1003', name: 'Rohan Verma', email: 'rohan.verma@example.com', phone: '+91 98765 43212', age: 34, gender: 'Male', visitsLast30Days: 4, classesAttended: 1, daysSinceLastVisit: 19, monthlySpend: 1500, renewed: false, status: 'Inactive', engagementLevel: 'Low', riskLevel: 'Moderate', createdAt: new Date() },
  { _id: '673d00000000000000000104', memberId: 'M1004', name: 'Ananya Iyer', email: 'ananya.iyer@example.com', phone: '+91 98765 43213', age: 42, gender: 'Female', visitsLast30Days: 2, classesAttended: 0, daysSinceLastVisit: 32, monthlySpend: 1200, renewed: false, status: 'Expired', engagementLevel: 'Low', riskLevel: 'High', createdAt: new Date() },
  { _id: '673d00000000000000000105', memberId: 'M1005', name: 'Vikram Singh', email: 'vikram.singh@example.com', phone: '+91 98765 43214', age: 25, gender: 'Male', visitsLast30Days: 21, classesAttended: 8, daysSinceLastVisit: 1, monthlySpend: 3000, renewed: true, status: 'Active', engagementLevel: 'High', riskLevel: 'Low', createdAt: new Date() },
  { _id: '673d00000000000000000106', memberId: 'M1006', name: 'Sneha Rao', email: 'sneha.rao@example.com', phone: '+91 98765 43215', age: 31, gender: 'Female', visitsLast30Days: 7, classesAttended: 2, daysSinceLastVisit: 11, monthlySpend: 1800, renewed: false, status: 'Inactive', engagementLevel: 'Moderate', riskLevel: 'Moderate', createdAt: new Date() },
  { _id: '673d00000000000000000107', memberId: 'M1007', name: 'Kabir Mehta', email: 'kabir.mehta@example.com', phone: '+91 98765 43216', age: 38, gender: 'Male', visitsLast30Days: 5, classesAttended: 1, daysSinceLastVisit: 17, monthlySpend: 1600, renewed: false, status: 'Inactive', engagementLevel: 'Moderate', riskLevel: 'Moderate', createdAt: new Date() },
  { _id: '673d00000000000000000108', memberId: 'M1008', name: 'Diya Nair', email: 'diya.nair@example.com', phone: '+91 98765 43217', age: 23, gender: 'Female', visitsLast30Days: 16, classesAttended: 5, daysSinceLastVisit: 3, monthlySpend: 2600, renewed: true, status: 'Active', engagementLevel: 'High', riskLevel: 'Low', createdAt: new Date() },
  { _id: '673d00000000000000000109', memberId: 'M1009', name: 'Suresh Menon', email: 'suresh.menon@example.com', phone: '+91 98765 43218', age: 45, gender: 'Male', visitsLast30Days: 1, classesAttended: 0, daysSinceLastVisit: 40, monthlySpend: 1000, renewed: false, status: 'Expired', engagementLevel: 'Low', riskLevel: 'High', createdAt: new Date() },
  { _id: '673d00000000000000000110', memberId: 'M1010', name: 'Kavita Joshi', email: 'kavita.joshi@example.com', phone: '+91 98765 43219', age: 29, gender: 'Female', visitsLast30Days: 9, classesAttended: 3, daysSinceLastVisit: 8, monthlySpend: 1900, renewed: true, status: 'Active', engagementLevel: 'Moderate', riskLevel: 'Low', createdAt: new Date() },
  { _id: '673d00000000000000000111', memberId: 'M1011', name: 'Arjun Das', email: 'arjun.das@example.com', phone: '+91 98765 43220', age: 36, gender: 'Male', visitsLast30Days: 12, classesAttended: 4, daysSinceLastVisit: 5, monthlySpend: 2300, renewed: true, status: 'Active', engagementLevel: 'High', riskLevel: 'Low', createdAt: new Date() },
  { _id: '673d00000000000000000112', memberId: 'M1012', name: 'Ritu Kapoor', email: 'ritu.kapoor@example.com', phone: '+91 98765 43221', age: 24, gender: 'Female', visitsLast30Days: 3, classesAttended: 0, daysSinceLastVisit: 25, monthlySpend: 1100, renewed: false, status: 'Expired', engagementLevel: 'Low', riskLevel: 'High', createdAt: new Date() },
  { _id: '673d00000000000000000113', memberId: 'M1013', name: 'Manish Reddy', email: 'manish.reddy@example.com', phone: '+91 98765 43222', age: 40, gender: 'Male', visitsLast30Days: 6, classesAttended: 2, daysSinceLastVisit: 16, monthlySpend: 1700, renewed: false, status: 'Inactive', engagementLevel: 'Moderate', riskLevel: 'Moderate', createdAt: new Date() },
  { _id: '673d00000000000000000114', memberId: 'M1014', name: 'Tanvi Shah', email: 'tanvi.shah@example.com', phone: '+91 98765 43223', age: 27, gender: 'Female', visitsLast30Days: 19, classesAttended: 7, daysSinceLastVisit: 2, monthlySpend: 2800, renewed: true, status: 'Active', engagementLevel: 'High', riskLevel: 'Low', createdAt: new Date() },
  { _id: '673d00000000000000000115', memberId: 'M1015', name: 'Aditya Kulkarni', email: 'aditya.kulkarni@example.com', phone: '+91 98765 43224', age: 33, gender: 'Male', visitsLast30Days: 8, classesAttended: 2, daysSinceLastVisit: 10, monthlySpend: 1900, renewed: false, status: 'Inactive', engagementLevel: 'Moderate', riskLevel: 'Moderate', createdAt: new Date() }
];

let members = [...initialMembers];

let memberships = members.map((m, idx) => {
  const plans = ['Basic Pass', 'Standard Fit', 'Pro Performance', 'Elite VIP'];
  const plan = plans[idx % plans.length];
  const prices = { 'Basic Pass': 1500, 'Standard Fit': 2200, 'Pro Performance': 2800, 'Elite VIP': 3500 };
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 45);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + (m.renewed ? 25 : -10));

  return {
    _id: `673d0000000000000000020${idx + 1}`,
    memberId: m,
    planName: plan,
    billingCycle: 'Monthly',
    price: prices[plan],
    startDate,
    endDate,
    status: m.renewed ? (endDate - new Date() < 7 * 86400000 ? 'Expiring Soon' : 'Active') : 'Expired',
    autoRenew: m.renewed,
    paymentStatus: 'Paid',
    createdAt: startDate
  };
});

let attendances = [];
const activities = ['Open Gym', 'HIIT Class', 'Yoga & Pilates', 'Spinning', 'Strength Training', 'Zumba'];
members.forEach((m, idx) => {
  for (let i = 0; i < Math.min(3, m.visitsLast30Days); i++) {
    const d = new Date();
    d.setDate(d.getDate() - (m.daysSinceLastVisit + i * 3));
    attendances.push({
      _id: `673d000000000000000003${idx}${i}`,
      memberId: m,
      date: d,
      checkInTime: d,
      activityType: activities[(idx + i) % activities.length],
      durationMinutes: 45 + (i * 15),
      createdAt: d
    });
  }
});

const calculateEngagement = (visits) => {
  if (visits >= 12) return 'High';
  if (visits >= 5) return 'Moderate';
  return 'Low';
};

const calculateRisk = (daysInactive, visits, renewed) => {
  if (daysInactive > 20 || (visits <= 3 && !renewed)) return 'High';
  if ((daysInactive > 10 && daysInactive <= 20) || (visits >= 4 && visits <= 7 && !renewed)) return 'Moderate';
  return 'Low';
};

module.exports = {
  // Members
  getMembers: ({ search, status, riskLevel, engagementLevel, renewed, page = 1, limit = 25 }) => {
    let result = [...members];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(m => m.name.toLowerCase().includes(s) || m.email.toLowerCase().includes(s) || m.memberId.toLowerCase().includes(s));
    }
    if (status) result = result.filter(m => m.status === status);
    if (riskLevel) result = result.filter(m => m.riskLevel === riskLevel);
    if (engagementLevel) result = result.filter(m => m.engagementLevel === engagementLevel);
    if (renewed !== undefined && renewed !== '') {
      const boolVal = renewed === 'true' || renewed === true || renewed === '1' || renewed === 1;
      result = result.filter(m => m.renewed === boolVal);
    }

    const total = result.length;
    const p = parseInt(page, 10);
    const l = parseInt(limit, 10);
    const start = (p - 1) * l;
    const paginated = result.slice(start, start + l);

    return { data: paginated, total };
  },

  getMemberById: (id) => {
    return members.find(m => m._id === id || m.memberId === id);
  },

  createMember: (data) => {
    const visits = Number(data.visitsLast30Days || 0);
    const daysInactive = Number(data.daysSinceLastVisit || 0);
    const renewed = data.renewed === true || data.renewed === 'true' || data.renewed === 1;

    const newMember = {
      _id: `673d000000000000000001${Date.now().toString().slice(-4)}`,
      memberId: (data.memberId || `M${1000 + members.length + 1}`).toUpperCase(),
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      age: Number(data.age || 25),
      gender: data.gender || 'Prefer not to say',
      visitsLast30Days: visits,
      classesAttended: Number(data.classesAttended || 0),
      daysSinceLastVisit: daysInactive,
      monthlySpend: Number(data.monthlySpend || 2200),
      renewed,
      status: data.status || (renewed ? 'Active' : 'Inactive'),
      engagementLevel: calculateEngagement(visits),
      riskLevel: calculateRisk(daysInactive, visits, renewed),
      createdAt: new Date()
    };

    members.unshift(newMember);
    return newMember;
  },

  updateMember: (id, data) => {
    const idx = members.findIndex(m => m._id === id || m.memberId === id);
    if (idx === -1) return null;

    const existing = members[idx];
    const visits = data.visitsLast30Days !== undefined ? Number(data.visitsLast30Days) : existing.visitsLast30Days;
    const daysInactive = data.daysSinceLastVisit !== undefined ? Number(data.daysSinceLastVisit) : existing.daysSinceLastVisit;
    const renewed = data.renewed !== undefined ? (data.renewed === true || data.renewed === 'true' || data.renewed === 1) : existing.renewed;

    const updated = {
      ...existing,
      ...data,
      visitsLast30Days: visits,
      daysSinceLastVisit: daysInactive,
      renewed,
      engagementLevel: calculateEngagement(visits),
      riskLevel: calculateRisk(daysInactive, visits, renewed)
    };

    members[idx] = updated;
    return updated;
  },

  deleteMember: (id) => {
    const idx = members.findIndex(m => m._id === id || m.memberId === id);
    if (idx === -1) return false;
    members.splice(idx, 1);
    memberships = memberships.filter(ms => ms.memberId._id !== id && ms.memberId.memberId !== id);
    attendances = attendances.filter(a => a.memberId._id !== id && a.memberId.memberId !== id);
    return true;
  },

  // Analytics Calculations
  getAnalyticsOverview: () => {
    const totalMembers = members.length;
    if (totalMembers === 0) {
      return { totalMembers: 0, renewedCount: 0, nonRenewedCount: 0, renewalRate: 0, nonRenewalRate: 0, averageAttendance: 0, averageClasses: 0, averageDaysInactive: 0, engagementBreakdown: { High: 0, Moderate: 0, Low: 0 }, riskBreakdown: { High: 0, Moderate: 0, Low: 0 }, atRiskCount: 0, healthScore: 0 };
    }

    const renewedCount = members.filter(m => m.renewed).length;
    const nonRenewedCount = totalMembers - renewedCount;
    const renewalRate = Number(((renewedCount / totalMembers) * 100).toFixed(1));
    const nonRenewalRate = Number((100 - renewalRate).toFixed(1));

    const totalVisits = members.reduce((sum, m) => sum + m.visitsLast30Days, 0);
    const totalClasses = members.reduce((sum, m) => sum + m.classesAttended, 0);
    const totalInactive = members.reduce((sum, m) => sum + m.daysSinceLastVisit, 0);
    const totalMonthlyRevenue = members.reduce((sum, m) => sum + m.monthlySpend, 0);

    const averageAttendance = Number((totalVisits / totalMembers).toFixed(1));
    const averageClasses = Number((totalClasses / totalMembers).toFixed(1));
    const averageDaysInactive = Number((totalInactive / totalMembers).toFixed(1));

    const engagementBreakdown = {
      High: members.filter(m => m.engagementLevel === 'High').length,
      Moderate: members.filter(m => m.engagementLevel === 'Moderate').length,
      Low: members.filter(m => m.engagementLevel === 'Low').length
    };

    const riskBreakdown = {
      High: members.filter(m => m.riskLevel === 'High').length,
      Moderate: members.filter(m => m.riskLevel === 'Moderate').length,
      Low: members.filter(m => m.riskLevel === 'Low').length
    };

    const lowRiskRatio = (riskBreakdown.Low / totalMembers) * 100;
    const visitFrequencyScore = Math.min(100, (averageAttendance / 15) * 100);
    const healthScore = Math.round(renewalRate * 0.5 + visitFrequencyScore * 0.3 + lowRiskRatio * 0.2);

    return {
      totalMembers,
      renewedCount,
      nonRenewedCount,
      renewalRate,
      nonRenewalRate,
      averageAttendance,
      averageClasses,
      averageDaysInactive,
      totalMonthlyRevenue,
      engagementBreakdown,
      riskBreakdown,
      atRiskCount: riskBreakdown.High,
      healthScore
    };
  },

  getAtRiskMembers: () => {
    const list = members.filter(m => m.riskLevel === 'High' || m.riskLevel === 'Moderate' || !m.renewed || m.daysSinceLastVisit > 14);
    list.sort((a, b) => b.daysSinceLastVisit - a.daysSinceLastVisit);

    return list.map(m => {
      const riskReasons = [];
      if (m.daysSinceLastVisit > 20) riskReasons.push(`Critically inactive: ${m.daysSinceLastVisit} days absent`);
      else if (m.daysSinceLastVisit > 10) riskReasons.push(`Low recent activity: ${m.daysSinceLastVisit} days absent`);
      if (m.visitsLast30Days <= 3) riskReasons.push(`Very low visit frequency: ${m.visitsLast30Days} visits/month`);
      if (!m.renewed) riskReasons.push('Membership unrenewed / lapsed');
      if (m.classesAttended === 0) riskReasons.push('No group class participation');

      return {
        ...m,
        riskReasons,
        recommendedAction: m.daysSinceLastVisit > 20
          ? 'Urgent Re-engagement Phone Call or VIP Pass Incentive'
          : !m.renewed
          ? 'Personalized Renewal Discount & Plan Consultation'
          : 'Complimentary Personal Training Check-in Session'
      };
    });
  },

  // Memberships
  getMemberships: (statusFilter) => {
    let result = [...memberships];
    if (statusFilter) result = result.filter(ms => ms.status === statusFilter);
    return result;
  },

  renewMembership: ({ memberId, planName = 'Standard Fit', durationMonths = 1, autoRenew = true }) => {
    const member = members.find(m => m._id === memberId || m.memberId === memberId);
    if (!member) throw new Error('Member not found');

    const prices = { 'Basic Pass': 1500, 'Standard Fit': 2200, 'Pro Performance': 2800, 'Elite VIP': 3500 };
    const price = (prices[planName] || 2200) * Number(durationMonths);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + Number(durationMonths));

    const updatedMs = {
      _id: `673d000000000000000002${Date.now().toString().slice(-4)}`,
      memberId: member,
      planName,
      billingCycle: Number(durationMonths) === 1 ? 'Monthly' : Number(durationMonths) === 3 ? 'Quarterly' : 'Annual',
      price,
      startDate,
      endDate,
      status: 'Active',
      autoRenew,
      paymentStatus: 'Paid',
      createdAt: new Date()
    };

    memberships.unshift(updatedMs);
    member.renewed = true;
    member.status = 'Active';
    member.riskLevel = calculateRisk(member.daysSinceLastVisit, member.visitsLast30Days, true);

    return updatedMs;
  },

  // Attendance
  recordAttendance: ({ memberId, activityType = 'Open Gym', durationMinutes = 60, notes = '' }) => {
    const member = members.find(m => m._id === memberId || m.memberId === memberId);
    if (!member) throw new Error('Member not found');

    const now = new Date();
    const record = {
      _id: `673d000000000000000003${Date.now().toString().slice(-4)}`,
      memberId: member,
      date: now,
      checkInTime: now,
      activityType,
      durationMinutes: Number(durationMinutes),
      notes,
      createdAt: now
    };

    attendances.unshift(record);
    member.visitsLast30Days += 1;
    member.daysSinceLastVisit = 0;
    if (activityType !== 'Open Gym') member.classesAttended += 1;
    member.engagementLevel = calculateEngagement(member.visitsLast30Days);
    member.riskLevel = calculateRisk(0, member.visitsLast30Days, member.renewed);

    return record;
  },

  getAttendanceLogs: ({ limit = 50 }) => {
    return attendances.slice(0, parseInt(limit, 10));
  }
};
