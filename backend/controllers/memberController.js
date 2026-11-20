const Member = require('../models/Member');
const Membership = require('../models/Membership');
const Attendance = require('../models/Attendance');
const mongoose = require('mongoose');
const store = require('../utils/fallbackStore');

const isMongoConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all members with filtering, search, and pagination
// @route   GET /api/members
// @access  Private
const getMembers = async (req, res) => {
  try {
    const { search, status, riskLevel, engagementLevel, renewed, page = 1, limit = 25, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    if (!isMongoConnected()) {
      const result = store.getMembers({ search, status, riskLevel, engagementLevel, renewed, page, limit });
      return res.status(200).json({ success: true, data: result.data, total: result.total });
    }

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { memberId: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (riskLevel) query.riskLevel = riskLevel;
    if (engagementLevel) query.engagementLevel = engagementLevel;
    if (renewed !== undefined && renewed !== '') {
      query.renewed = renewed === 'true' || renewed === true || renewed === '1' || renewed === 1;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [members, total] = await Promise.all([
      Member.find(query).sort(sort).skip(skip).limit(limitNum),
      Member.countDocuments(query)
    ]);

    res.status(200).json({ success: true, data: members, total, pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum), limit: limitNum } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve members', error: error.message });
  }
};

// @desc    Get single member by ID
// @route   GET /api/members/:id
// @access  Private
const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isMongoConnected()) {
      const member = store.getMemberById(id);
      if (!member) return res.status(404).json({ success: false, message: `Member not found: ${id}` });
      return res.status(200).json({ success: true, data: member });
    }

    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { memberId: id.toUpperCase() };
    const member = await Member.findOne(query);
    if (!member) return res.status(404).json({ success: false, message: `Member not found with ID: ${id}` });

    const [memberships, attendances] = await Promise.all([
      Membership.find({ memberId: member._id }).sort({ createdAt: -1 }),
      Attendance.find({ memberId: member._id }).sort({ date: -1 }).limit(30)
    ]);

    res.status(200).json({ success: true, data: { ...member.toObject(), memberships, attendances } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch member details', error: error.message });
  }
};

// @desc    Create a new member
// @route   POST /api/members
// @access  Private
const createMember = async (req, res) => {
  try {
    const { memberId, name, email, phone, age, gender, monthlySpend, renewed, visitsLast30Days, classesAttended, daysSinceLastVisit, notes, planName } = req.body;

    if (!name || !email || !age) {
      return res.status(400).json({ success: false, message: 'Name, email, and age are required fields.' });
    }

    if (!isMongoConnected()) {
      const newMember = store.createMember(req.body);
      return res.status(201).json({ success: true, message: 'Member created successfully', data: newMember });
    }

    let finalMemberId = memberId ? memberId.toUpperCase() : null;
    if (!finalMemberId) {
      const count = await Member.countDocuments();
      finalMemberId = `M${1000 + count + 1}`;
    }

    const existing = await Member.findOne({ $or: [{ memberId: finalMemberId }, { email: email.toLowerCase() }] });
    if (existing) return res.status(400).json({ success: false, message: 'A member with this Member ID or Email already exists.' });

    const member = new Member({
      memberId: finalMemberId,
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      age,
      gender: gender || 'Prefer not to say',
      monthlySpend: monthlySpend !== undefined ? Number(monthlySpend) : 2000,
      renewed: renewed !== undefined ? Boolean(renewed) : true,
      visitsLast30Days: visitsLast30Days !== undefined ? Number(visitsLast30Days) : 10,
      classesAttended: classesAttended !== undefined ? Number(classesAttended) : 3,
      daysSinceLastVisit: daysSinceLastVisit !== undefined ? Number(daysSinceLastVisit) : 2,
      notes: notes || ''
    });

    await member.save();

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const membership = await Membership.create({
      memberId: member._id,
      planName: planName || 'Standard Fit',
      billingCycle: 'Monthly',
      price: member.monthlySpend || 2000,
      startDate,
      endDate,
      status: 'Active',
      autoRenew: member.renewed
    });

    res.status(201).json({ success: true, message: 'Member created successfully', data: { ...member.toObject(), membership } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create member', error: error.message });
  }
};

// @desc    Update an existing member
// @route   PUT /api/members/:id
// @access  Private
const updateMember = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isMongoConnected()) {
      const updated = store.updateMember(id, req.body);
      if (!updated) return res.status(404).json({ success: false, message: `Member not found: ${id}` });
      return res.status(200).json({ success: true, message: 'Member updated successfully', data: updated });
    }

    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { memberId: id.toUpperCase() };
    const member = await Member.findOne(query);
    if (!member) return res.status(404).json({ success: false, message: `Member not found with ID: ${id}` });

    const allowedUpdates = ['name', 'email', 'phone', 'age', 'gender', 'status', 'monthlySpend', 'renewed', 'visitsLast30Days', 'classesAttended', 'daysSinceLastVisit', 'notes'];
    allowedUpdates.forEach((field) => { if (req.body[field] !== undefined) member[field] = req.body[field]; });
    await member.save();

    res.status(200).json({ success: true, message: 'Member updated successfully', data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update member', error: error.message });
  }
};

// @desc    Delete a member and cascade delete associated records
// @route   DELETE /api/members/:id
// @access  Private
const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isMongoConnected()) {
      const deleted = store.deleteMember(id);
      if (!deleted) return res.status(404).json({ success: false, message: `Member not found: ${id}` });
      return res.status(200).json({ success: true, message: `Member and all associated records deleted successfully.` });
    }

    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { memberId: id.toUpperCase() };
    const member = await Member.findOne(query);
    if (!member) return res.status(404).json({ success: false, message: `Member not found with ID: ${id}` });

    await Promise.all([
      Membership.deleteMany({ memberId: member._id }),
      Attendance.deleteMany({ memberId: member._id }),
      Member.deleteOne({ _id: member._id })
    ]);

    res.status(200).json({ success: true, message: `Member ${member.name} (${member.memberId}) and all associated records deleted successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete member', error: error.message });
  }
};

module.exports = { getMembers, getMemberById, createMember, updateMember, deleteMember };
