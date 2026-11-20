const Membership = require('../models/Membership');
const Member = require('../models/Member');
const mongoose = require('mongoose');
const store = require('../utils/fallbackStore');

const isMongoConnected = () => mongoose.connection.readyState === 1;

const PLAN_TIERS = {
  'Basic Pass': { price: 1500, features: ['Gym Floor Access', 'Locker Room'] },
  'Standard Fit': { price: 2200, features: ['Gym Floor Access', 'Locker Room', 'Group Classes'] },
  'Pro Performance': { price: 2800, features: ['All Classes', 'Sauna Access', '1 Monthly Trainer Session'] },
  'Elite VIP': { price: 3500, features: ['All-Access 24/7', 'Unlimited Classes', 'Weekly Trainer', 'Nutrition Plan'] }
};

// @desc    Get all memberships
// @route   GET /api/memberships
// @access  Private
const getMemberships = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const list = store.getMemberships(req.query.status);
      return res.status(200).json({ success: true, data: list, plans: PLAN_TIERS });
    }

    const { status, planName, page = 1, limit = 25 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (planName) query.planName = planName;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const memberships = await Membership.find(query)
      .populate('memberId', 'memberId name email phone status renewed visitsLast30Days')
      .sort({ endDate: 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Membership.countDocuments(query);
    res.status(200).json({ success: true, data: memberships, plans: PLAN_TIERS, pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum), limit: limitNum } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch memberships', error: error.message });
  }
};

// @desc    Renew a Membership for a member
// @route   POST /api/memberships/renew
// @access  Private
const renewMembership = async (req, res) => {
  try {
    const { memberId, planName, durationMonths = 1, autoRenew = true } = req.body;

    if (!memberId) return res.status(400).json({ success: false, message: 'Member ID is required.' });

    if (!isMongoConnected()) {
      const updated = store.renewMembership({ memberId, planName, durationMonths, autoRenew });
      return res.status(201).json({ success: true, message: 'Membership renewed successfully', data: updated });
    }

    const member = await Member.findOne(memberId.match(/^[0-9a-fA-F]{24}$/) ? { _id: memberId } : { memberId: memberId.toUpperCase() });
    if (!member) return res.status(404).json({ success: false, message: `Member not found with ID: ${memberId}` });

    const selectedPlan = planName || 'Standard Fit';
    const planInfo = PLAN_TIERS[selectedPlan] || PLAN_TIERS['Standard Fit'];
    const price = planInfo.price * Number(durationMonths);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + Number(durationMonths));

    await Membership.updateMany({ memberId: member._id, status: { $in: ['Active', 'Expiring Soon'] } }, { status: 'Expired' });

    const newMembership = await Membership.create({
      memberId: member._id,
      planName: selectedPlan,
      billingCycle: durationMonths === 12 ? 'Annual' : durationMonths === 3 ? 'Quarterly' : 'Monthly',
      price,
      startDate,
      endDate,
      status: 'Active',
      autoRenew: Boolean(autoRenew),
      paymentStatus: 'Paid'
    });

    member.renewed = true;
    member.status = 'Active';
    member.monthlySpend = planInfo.price;
    await member.save();

    res.status(201).json({ success: true, message: `Membership renewed for ${member.name} under ${selectedPlan}`, data: newMembership });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to renew membership', error: error.message });
  }
};

// @desc    Get membership status overview & financial metrics
// @route   GET /api/memberships/stats
// @access  Private
const getMembershipStats = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const list = store.getMemberships();
      return res.status(200).json({ success: true, data: { activeMemberships: list.filter(m => m.status === 'Active').length, expiringSoonMemberships: list.filter(m => m.status === 'Expiring Soon').length, expiredMemberships: list.filter(m => m.status === 'Expired').length, totalRevenue: list.reduce((s, m) => s + (m.price || 0), 0), planTiers: PLAN_TIERS } });
    }

    const [totalActive, expiringSoon, expired, revenueAgg] = await Promise.all([
      Membership.countDocuments({ status: 'Active' }),
      Membership.countDocuments({ status: 'Expiring Soon' }),
      Membership.countDocuments({ status: 'Expired' }),
      Membership.aggregate([{ $match: { paymentStatus: 'Paid' } }, { $group: { _id: null, totalRevenue: { $sum: '$price' } } }])
    ]);

    res.status(200).json({ success: true, data: { activeMemberships: totalActive, expiringSoonMemberships: expiringSoon, expiredMemberships: expired, totalRevenue: revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0, planTiers: PLAN_TIERS } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch membership statistics', error: error.message });
  }
};

module.exports = { getMemberships, renewMembership, getMembershipStats, PLAN_TIERS };
