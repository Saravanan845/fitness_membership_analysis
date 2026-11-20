import api from './api';

export const getRetentionReport = async (format = 'json') => {
  if (format === 'csv') {
    const response = await api.get('/reports/retention?format=csv', {
      responseType: 'blob'
    });
    return response.data;
  }
  const response = await api.get('/reports/retention?format=json');
  return response.data;
};

export const downloadMembersCSV = async () => {
  const response = await api.get('/reports/members/csv', {
    responseType: 'blob'
  });
  return response.data;
};
