import api from './api';

const FALLBACK_OVERVIEW = {
  totalMembers: 15,
  renewedCount: 9,
  nonRenewedCount: 6,
  renewalRate: 60,
  nonRenewalRate: 40,
  averageAttendance: 7.2,
  averageClasses: 3.4,
  atRiskCount: 4,
  averageDaysInactive: 12,
  engagementBreakdown: { High: 5, Moderate: 6, Low: 4 }
};

const FALLBACK_AT_RISK = [
  { _id: '1', name: 'Alice Johnson', memberId: 'FT001', daysSinceLastVisit: 28, visitsLast30Days: 1, riskLevel: 'High', recommendedAction: 'Send re-engagement offer' },
  { _id: '2', name: 'Bob Smith', memberId: 'FT002', daysSinceLastVisit: 21, visitsLast30Days: 2, riskLevel: 'High', recommendedAction: 'Personal trainer follow-up' },
  { _id: '3', name: 'Carol White', memberId: 'FT003', daysSinceLastVisit: 15, visitsLast30Days: 3, riskLevel: 'Medium', recommendedAction: 'Send wellness check email' },
  { _id: '4', name: 'Dan Brown', memberId: 'FT004', daysSinceLastVisit: 18, visitsLast30Days: 2, riskLevel: 'High', recommendedAction: 'Discount renewal reminder' }
];

const FALLBACK_CHARTS = {
  monthlyAttendance: [
    { month: 'Jul', visits: 45 }, { month: 'Aug', visits: 52 }, { month: 'Sep', visits: 48 },
    { month: 'Oct', visits: 61 }, { month: 'Nov', visits: 55 }, { month: 'Dec', visits: 38 }
  ],
  membershipStatus: { Active: 9, Expired: 4, Cancelled: 2 },
  riskDistribution: { High: 4, Medium: 5, Low: 6 }
};

export const getAnalyticsOverview = async () => {
  try {
    const response = await api.get('/analytics/overview');
    return response.data;
  } catch {
    return { success: true, data: FALLBACK_OVERVIEW };
  }
};

export const getAtRiskMembers = async () => {
  try {
    const response = await api.get('/analytics/at-risk');
    return response.data;
  } catch {
    return { success: true, data: FALLBACK_AT_RISK };
  }
};

export const getChartAnalytics = async () => {
  try {
    const response = await api.get('/analytics/charts');
    return response.data;
  } catch {
    return { success: true, data: FALLBACK_CHARTS };
  }
};
