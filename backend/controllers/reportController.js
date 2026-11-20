const Member = require('../models/Member');
const mongoose = require('mongoose');
const store = require('../utils/fallbackStore');

const isMongoConnected = () => mongoose.connection.readyState === 1;

// @desc    Download retention analytics summary report
// @route   GET /api/reports/retention
// @access  Private
const getRetentionReport = async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    let summary;
    if (!isMongoConnected()) {
      summary = store.getAnalyticsOverview();
      const atRiskList = store.getAtRiskMembers();
      summary.atRiskCount = atRiskList.length;

      if (format === 'csv') {
        const headers = ['Metric', 'Value'];
        const rows = [
          ['Total Registered Members', summary.totalMembers],
          ['Renewed Members', summary.renewedCount],
          ['Non-Renewed Members', summary.nonRenewedCount],
          ['Renewal Rate (%)', `${summary.renewalRate}%`],
          ['Non-Renewal Rate (%)', `${summary.nonRenewalRate}%`],
          ['High Engagement Members', summary.engagementBreakdown.High],
          ['Moderate Engagement Members', summary.engagementBreakdown.Moderate],
          ['Low Engagement Members', summary.engagementBreakdown.Low],
          ['Potentially At-Risk Members', summary.atRiskCount],
          ['Report Generated At', new Date().toISOString()]
        ];
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="fittrack_retention_report.csv"');
        return res.status(200).send(csvContent);
      }

      return res.status(200).json({ success: true, reportTitle: 'FitTrack Retention Analytics Report', generatedAt: new Date().toISOString(), summary });
    }

    const totalMembers = await Member.countDocuments();
    const renewedCount = await Member.countDocuments({ renewed: true });
    const nonRenewedCount = totalMembers - renewedCount;
    const renewalRate = totalMembers > 0 ? Number(((renewedCount / totalMembers) * 100).toFixed(1)) : 0;
    const nonRenewalRate = totalMembers > 0 ? Number((100 - renewalRate).toFixed(1)) : 0;

    const atRiskMembers = await Member.find({ $or: [{ riskLevel: 'High' }, { renewed: false }, { daysSinceLastVisit: { $gt: 14 } }] }).sort({ daysSinceLastVisit: -1 });

    if (format === 'csv') {
      const headers = ['Metric', 'Value'];
      const rows = [
        ['Total Registered Members', totalMembers],
        ['Renewed Members', renewedCount],
        ['Non-Renewed Members', nonRenewedCount],
        ['Renewal Rate (%)', `${renewalRate}%`],
        ['Non-Renewal Rate (%)', `${nonRenewalRate}%`],
        ['Potentially At-Risk Members Count', atRiskMembers.length],
        ['Report Generated At', new Date().toISOString()]
      ];
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="fittrack_retention_report.csv"');
      return res.status(200).send(csvContent);
    }

    return res.status(200).json({
      success: true,
      reportTitle: 'FitTrack Retention Analytics Report',
      generatedAt: new Date().toISOString(),
      summary: { totalMembers, renewedCount, nonRenewedCount, renewalRate, nonRenewalRate, atRiskCount: atRiskMembers.length },
      atRiskMemberList: atRiskMembers.map(m => ({ memberId: m.memberId, name: m.name, age: m.age, visitsLast30Days: m.visitsLast30Days, daysSinceLastVisit: m.daysSinceLastVisit, classesAttended: m.classesAttended, renewed: m.renewed, riskLevel: m.riskLevel }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate retention report', error: error.message });
  }
};

// @desc    Download full members list as CSV
// @route   GET /api/reports/members/csv
// @access  Private
const exportMembersCSV = async (req, res) => {
  try {
    let membersList;

    if (!isMongoConnected()) {
      const result = store.getMembers({ page: 1, limit: 1000 });
      membersList = result.data;
    } else {
      membersList = await Member.find().sort({ memberId: 1 });
    }

    const headers = ['Member_ID', 'Name', 'Email', 'Age', 'Gender', 'Visits_Last_30_Days', 'Classes_Attended', 'Days_Since_Last_Visit', 'Monthly_Spend', 'Renewed', 'Engagement_Level', 'Risk_Level', 'Status'];
    const rows = membersList.map(m => [m.memberId, `"${m.name}"`, m.email, m.age, m.gender, m.visitsLast30Days, m.classesAttended, m.daysSinceLastVisit, m.monthlySpend, m.renewed ? 1 : 0, m.engagementLevel, m.riskLevel, m.status]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="fittrack_members_export.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to export members CSV', error: error.message });
  }
};

module.exports = { getRetentionReport, exportMembersCSV };
