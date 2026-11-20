import api from './api';

export const getMemberAiInsights = async (memberId, customPrompt = '') => {
  const response = await api.post('/ai/member-insights', { memberId, customPrompt });
  return response.data;
};

export const getClubRetentionStrategy = async () => {
  const response = await api.get('/ai/club-strategy');
  return response.data;
};
