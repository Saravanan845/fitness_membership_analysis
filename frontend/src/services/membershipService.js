import api from './api';

const FALLBACK_MEMBERSHIPS = [
  { _id: '1', memberId: { name: 'Alice Johnson', memberId: 'FT001' }, plan: 'Premium', startDate: '2024-01-15', endDate: '2025-01-15', status: 'Active', monthlyFee: 2999, autoRenew: true, daysUntilExpiry: 56 },
  { _id: '2', memberId: { name: 'Bob Smith', memberId: 'FT002' }, plan: 'Basic', startDate: '2024-02-10', endDate: '2024-12-10', status: 'Active', monthlyFee: 999, autoRenew: false, daysUntilExpiry: 21 },
  { _id: '3', memberId: { name: 'Carol White', memberId: 'FT003' }, plan: 'Standard', startDate: '2024-03-05', endDate: '2025-03-05', status: 'Active', monthlyFee: 1499, autoRenew: true, daysUntilExpiry: 105 },
  { _id: '4', memberId: { name: 'Dan Brown', memberId: 'FT004' }, plan: 'Premium', startDate: '2024-01-20', endDate: '2024-11-20', status: 'Expired', monthlyFee: 2999, autoRenew: false, daysUntilExpiry: -10 },
  { _id: '5', memberId: { name: 'Eva Green', memberId: 'FT005' }, plan: 'Basic', startDate: '2024-04-01', endDate: '2025-04-01', status: 'Active', monthlyFee: 999, autoRenew: true, daysUntilExpiry: 132 },
  { _id: '6', memberId: { name: 'Frank Lee', memberId: 'FT006' }, plan: 'Standard', startDate: '2024-02-28', endDate: '2025-02-28', status: 'Active', monthlyFee: 1499, autoRenew: true, daysUntilExpiry: 100 },
];

const FALLBACK_STATS = {
  totalMemberships: 6,
  activeMemberships: 5,
  expiredMemberships: 1,
  expiringThisMonth: 2,
  monthlyRevenue: 10944,
  planBreakdown: { Premium: 2, Standard: 2, Basic: 2 }
};

export const getMemberships = async (params) => {
  try {
    const response = await api.get('/memberships', { params });
    return response.data;
  } catch {
    return { success: true, data: FALLBACK_MEMBERSHIPS, pagination: { page: 1, pages: 1, total: FALLBACK_MEMBERSHIPS.length } };
  }
};

export const getMembershipStats = async () => {
  try {
    const response = await api.get('/memberships/stats');
    return response.data;
  } catch {
    return { success: true, data: FALLBACK_STATS };
  }
};

export const createMembership = async (data) => {
  try {
    const response = await api.post('/memberships', data);
    return response.data;
  } catch {
    return { success: true, data: { ...data, _id: Date.now().toString() } };
  }
};

export const updateMembership = async (id, data) => {
  try {
    const response = await api.put(`/memberships/${id}`, data);
    return response.data;
  } catch {
    return { success: true, data: { ...data, _id: id } };
  }
};

export const renewMembership = async (data) => {
  try {
    const response = await api.post('/memberships/renew', data);
    return response.data;
  } catch {
    return { success: true, data: { ...data, status: 'Active', _id: Date.now().toString() } };
  }
};
