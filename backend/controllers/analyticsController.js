const Member = require('../models/Member');
const Attendance = require('../models/Attendance');
const Membership = require('../models/Membership');
const mongoose = require('mongoose');
const store = require('../utils/fallbackStore');

const isMongoConnected = () => mongoose.connection.readyState === 1;

// @desc    Get comprehensive retention & engagement analytics calculated from DB
// @route   GET /api/analytics/overview
// @access  Private
const getAnalyticsOverview = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(200).json({ success: true, data: store.getAnalyticsOverview() });
    }

    const totalMembers = await Member.countDocuments();

    if (totalMembers === 0) {
      return res.status(200).json({ success: true, data: { totalMembers: 0, renewedCount: 0, nonRenewedCount: 0, renewalRate: 0, nonRenewalRate: 0, averageAttendance: 0, averageClasses: 0, averageDaysInactive: 0, engagementBreakdown: { High: 0, Moderate: 0, Low: 0 }, riskBreakdown: { High: 0, Moderate: 0, Low: 0 }, atRiskCount: 0, healthScore: 0 } });
    }

    const [statsAgg, engagementAgg, riskAgg] = await Promise.all([
      Member.aggregate([{ $group: { _id: null, total: { $sum: 1 }, renewedCount: { $sum: { $cond: [{ $eq: ['$renewed', true] }, 1, 0] } }, nonRenewedCount: { $sum: { $cond: [{ $eq: ['$renewed', false] }, 1, 0] } }, avgVisits: { $avg: '$visitsLast30Days' }, avgClasses: { $avg: '$classesAttended' }, avgDaysInactive: { $avg: '$daysSinceLastVisit' }, totalMonthlySpend: { $sum: '$monthlySpend' } } }]),
      Member.aggregate([{ $group: { _id: '$engagementLevel', count: { $sum: 1 } } }]),
      Member.aggregate([{ $group: { _id: '$riskLevel', count: { $sum: 1 } } }])
    ]);

    const stats = statsAgg[0] || { total: totalMembers, renewedCount: 0, nonRenewedCount: 0, avgVisits: 0, avgClasses: 0, avgDaysInactive: 0, totalMonthlySpend: 0 };
    const renewalRate = Number(((stats.renewedCount / totalMembers) * 100).toFixed(1));
    const nonRenewalRate = Number((100 - renewalRate).toFixed(1));
    const averageAttendance = Number((stats.avgVisits || 0).toFixed(1));
    const averageClasses = Number((stats.avgClasses || 0).toFixed(1));

    const engagementBreakdown = { High: 0, Moderate: 0, Low: 0 };
    engagementAgg.forEach((item) => { if (item._id && engagementBreakdown[item._id] !== undefined) engagementBreakdown[item._id] = item.count; });

    const riskBreakdown = { High: 0, Moderate: 0, Low: 0 };
    riskAgg.forEach((item) => { if (item._id && riskBreakdown[item._id] !== undefined) riskBreakdown[item._id] = item.count; });

    const lowRiskRatio = (riskBreakdown.Low / totalMembers) * 100;
    const visitFrequencyScore = Math.min(100, (averageAttendance / 15) * 100);
    const healthScore = Math.round(renewalRate * 0.5 + visitFrequencyScore * 0.3 + lowRiskRatio * 0.2);

    res.status(200).json({ success: true, data: { totalMembers, renewedCount: stats.renewedCount, nonRenewedCount: stats.nonRenewedCount, renewalRate, nonRenewalRate, averageAttendance, averageClasses, totalMonthlyRevenue: stats.totalMonthlySpend, engagementBreakdown, riskBreakdown, atRiskCount: riskBreakdown.High, healthScore } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to compute analytics overview', error: error.message });
  }
};

// @desc    Get detailed list of potentially at-risk members
// @route   GET /api/analytics/at-risk
// @access  Private
const getAtRiskMembers = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const list = store.getAtRiskMembers();
      return res.status(200).json({ success: true, count: list.length, data: list });
    }

    const atRiskMembers = await Member.find({ $or: [{ riskLevel: 'High' }, { riskLevel: 'Moderate' }, { renewed: false }, { daysSinceLastVisit: { $gt: 14 } }] }).sort({ daysSinceLastVisit: -1 }).limit(50);

    const enrichedList = atRiskMembers.map((member) => {
      const riskReasons = [];
      if (member.daysSinceLastVisit > 20) riskReasons.push(`Critically inactive: ${member.daysSinceLastVisit} days absent`);
      else if (member.daysSinceLastVisit > 10) riskReasons.push(`Low recent activity: ${member.daysSinceLastVisit} days absent`);
      if (member.visitsLast30Days <= 3) riskReasons.push(`Very low visit frequency: ${member.visitsLast30Days} visits/month`);
      if (!member.renewed) riskReasons.push('Membership unrenewed / lapsed');
      if (member.classesAttended === 0) riskReasons.push('No group class participation');

      return {
        ...member.toObject(),
        riskReasons,
        recommendedAction: member.daysSinceLastVisit > 20 ? 'Urgent Re-engagement Phone Call or VIP Pass Incentive' : !member.renewed ? 'Personalized Renewal Discount & Plan Consultation' : 'Complimentary Personal Training Check-in Session'
      };
    });

    res.status(200).json({ success: true, count: enrichedList.length, data: enrichedList });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch at-risk members', error: error.message });
  }
};

// @desc    Get chart analytics
// @route   GET /api/analytics/charts
// @access  Private
const getChartAnalytics = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const overview = store.getAnalyticsOverview();
      return res.status(200).json({ success: true, data: { engagementByAge: Object.entries(overview.engagementBreakdown).map(([k, v]) => ({ _id: k, count: v })), spendByRisk: Object.entries(overview.riskBreakdown).map(([k, v]) => ({ _id: k, memberCount: v })), ageDistribution: [] } });
    }

    const [ageDistribution, spendByRisk, engagementByAge] = await Promise.all([
      Member.aggregate([{ $bucket: { groupBy: '$age', boundaries: [18, 25, 35, 50, 65, 100], default: 'Other', output: { count: { $sum: 1 }, avgVisits: { $avg: '$visitsLast30Days' }, renewedCount: { $sum: { $cond: ['$renewed', 1, 0] } } } } }]),
      Member.aggregate([{ $group: { _id: '$riskLevel', avgSpend: { $avg: '$monthlySpend' }, memberCount: { $sum: 1 } } }]),
      Member.aggregate([{ $group: { _id: '$engagementLevel', avgVisits: { $avg: '$visitsLast30Days' }, avgClasses: { $avg: '$classesAttended' }, count: { $sum: 1 } } }])
    ]);

    res.status(200).json({ success: true, data: { ageDistribution, spendByRisk, engagementByAge } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate chart analytics', error: error.message });
  }
};

module.exports = { getAnalyticsOverview, getAtRiskMembers, getChartAnalytics };
