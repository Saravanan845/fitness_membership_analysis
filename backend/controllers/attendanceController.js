const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const mongoose = require('mongoose');
const store = require('../utils/fallbackStore');

const isMongoConnected = () => mongoose.connection.readyState === 1;

// @desc    Record member attendance (Check-in)
// @route   POST /api/attendance
// @access  Private
const recordAttendance = async (req, res) => {
  try {
    const { memberId, activityType, durationMinutes, notes } = req.body;

    if (!memberId) {
      return res.status(400).json({ success: false, message: 'Member ID is required.' });
    }

    if (!isMongoConnected()) {
      const record = store.recordAttendance({ memberId, activityType, durationMinutes, notes });
      return res.status(201).json({ success: true, message: 'Attendance recorded', data: record });
    }

    const query = memberId.match(/^[0-9a-fA-F]{24}$/) ? { _id: memberId } : { memberId: memberId.toUpperCase() };
    const member = await Member.findOne(query);
    if (!member) return res.status(404).json({ success: false, message: `Member not found with ID: ${memberId}` });

    const checkIn = new Attendance({
      memberId: member._id,
      date: new Date(),
      checkInTime: new Date(),
      activityType: activityType || 'Open Gym',
      durationMinutes: durationMinutes ? Number(durationMinutes) : 60,
      notes: notes || ''
    });

    await checkIn.save();
    member.visitsLast30Days = (member.visitsLast30Days || 0) + 1;
    member.daysSinceLastVisit = 0;
    if (activityType && activityType !== 'Open Gym') {
      member.classesAttended = (member.classesAttended || 0) + 1;
    }
    await member.save();

    res.status(201).json({ success: true, message: `Attendance recorded for ${member.name}`, data: { ...checkIn.toObject(), member: { _id: member._id, memberId: member.memberId, name: member.name, visitsLast30Days: member.visitsLast30Days, engagementLevel: member.engagementLevel } } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record attendance', error: error.message });
  }
};

// @desc    Get all attendance logs
// @route   GET /api/attendance
// @access  Private
const getAttendanceLogs = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const logs = store.getAttendanceLogs({ limit: req.query.limit || 50 });
      return res.status(200).json({
        success: true,
        data: logs,
        pagination: {
          total: logs.length,
          page: 1,
          pages: 1,
          limit: logs.length
        }
      });
    }

    const { memberId, activityType, startDate, endDate, page = 1, limit = 30 } = req.query;
    const query = {};

    if (memberId) {
      const member = await Member.findOne(memberId.match(/^[0-9a-fA-F]{24}$/) ? { _id: memberId } : { memberId: memberId.toUpperCase() });
      if (member) query.memberId = member._id;
    }
    if (activityType) query.activityType = activityType;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      Attendance.find(query).populate('memberId', 'memberId name email phone engagementLevel').sort({ checkInTime: -1 }).skip(skip).limit(limitNum),
      Attendance.countDocuments(query)
    ]);

    res.status(200).json({ success: true, data: logs, pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum), limit: limitNum } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance logs', error: error.message });
  }
};

// @desc    Get attendance metrics & distribution
// @route   GET /api/attendance/stats
// @access  Private
const getAttendanceStats = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(200).json({ success: true, data: { todayCheckIns: 3, last30DaysCheckIns: store.getAttendanceLogs({ limit: 200 }).length, dailyAverage: 5, activityBreakdown: [{ _id: 'Open Gym', count: 25 }, { _id: 'HIIT Class', count: 15 }, { _id: 'Yoga & Pilates', count: 10 }, { _id: 'Spinning', count: 8 }] } });
    }

    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [todayCount, past30DaysCount, activityBreakdown] = await Promise.all([
      Attendance.countDocuments({ date: { $gte: startOfToday, $lte: endOfToday } }),
      Attendance.countDocuments({ date: { $gte: thirtyDaysAgo } }),
      Attendance.aggregate([{ $match: { date: { $gte: thirtyDaysAgo } } }, { $group: { _id: '$activityType', count: { $sum: 1 } } }, { $sort: { count: -1 } }])
    ]);

    res.status(200).json({ success: true, data: { todayCheckIns: todayCount, last30DaysCheckIns: past30DaysCount, dailyAverage: Math.round(past30DaysCount / 30), activityBreakdown } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance statistics', error: error.message });
  }
};

module.exports = { recordAttendance, getAttendanceLogs, getAttendanceStats };
