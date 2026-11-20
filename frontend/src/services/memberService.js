import api from './api';

const FALLBACK_MEMBERS = [
  { _id: '1', memberId: 'FT001', name: 'Alice Johnson', email: 'alice@example.com', phone: '9876543210', membershipType: 'Premium', status: 'Active', renewed: true, riskLevel: 'High', visitsLast30Days: 1, joinDate: '2024-01-15' },
  { _id: '2', memberId: 'FT002', name: 'Bob Smith', email: 'bob@example.com', phone: '9876543211', membershipType: 'Basic', status: 'Active', renewed: false, riskLevel: 'High', visitsLast30Days: 2, joinDate: '2024-02-10' },
  { _id: '3', memberId: 'FT003', name: 'Carol White', email: 'carol@example.com', phone: '9876543212', membershipType: 'Standard', status: 'Active', renewed: true, riskLevel: 'Medium', visitsLast30Days: 5, joinDate: '2024-03-05' },
  { _id: '4', memberId: 'FT004', name: 'Dan Brown', email: 'dan@example.com', phone: '9876543213', membershipType: 'Premium', status: 'Expired', renewed: false, riskLevel: 'High', visitsLast30Days: 2, joinDate: '2024-01-20' },
  { _id: '5', memberId: 'FT005', name: 'Eva Green', email: 'eva@example.com', phone: '9876543214', membershipType: 'Basic', status: 'Active', renewed: true, riskLevel: 'Low', visitsLast30Days: 12, joinDate: '2024-04-01' },
  { _id: '6', memberId: 'FT006', name: 'Frank Lee', email: 'frank@example.com', phone: '9876543215', membershipType: 'Standard', status: 'Active', renewed: true, riskLevel: 'Low', visitsLast30Days: 10, joinDate: '2024-02-28' },
  { _id: '7', memberId: 'FT007', name: 'Grace Kim', email: 'grace@example.com', phone: '9876543216', membershipType: 'Premium', status: 'Active', renewed: true, riskLevel: 'Low', visitsLast30Days: 15, joinDate: '2024-03-15' },
  { _id: '8', memberId: 'FT008', name: 'Henry Park', email: 'henry@example.com', phone: '9876543217', membershipType: 'Basic', status: 'Cancelled', renewed: false, riskLevel: 'High', visitsLast30Days: 0, joinDate: '2024-01-05' },
  { _id: '9', memberId: 'FT009', name: 'Iris Chen', email: 'iris@example.com', phone: '9876543218', membershipType: 'Standard', status: 'Active', renewed: true, riskLevel: 'Medium', visitsLast30Days: 6, joinDate: '2024-05-01' },
  { _id: '10', memberId: 'FT010', name: 'James Wilson', email: 'james@example.com', phone: '9876543219', membershipType: 'Premium', status: 'Active', renewed: false, riskLevel: 'Medium', visitsLast30Days: 4, joinDate: '2024-04-20' },
];

export const getMembers = async (params) => {
  try {
    const response = await api.get('/members', { params });
    return response.data;
  } catch {
    return { success: true, data: FALLBACK_MEMBERS, pagination: { page: 1, pages: 1, total: FALLBACK_MEMBERS.length } };
  }
};

export const getMemberById = async (id) => {
  try {
    const response = await api.get(`/members/${id}`);
    return response.data;
  } catch {
    return { success: true, data: FALLBACK_MEMBERS.find(m => m._id === id) || FALLBACK_MEMBERS[0] };
  }
};

export const createMember = async (memberData) => {
  try {
    const response = await api.post('/members', memberData);
    return response.data;
  } catch {
    return { success: true, data: { ...memberData, _id: Date.now().toString(), memberId: `FT${Date.now()}` } };
  }
};

export const updateMember = async (id, memberData) => {
  try {
    const response = await api.put(`/members/${id}`, memberData);
    return response.data;
  } catch {
    return { success: true, data: { ...memberData, _id: id } };
  }
};

export const deleteMember = async (id) => {
  try {
    const response = await api.delete(`/members/${id}`);
    return response.data;
  } catch {
    return { success: true, message: 'Member deleted (offline mode)' };
  }
};
