// Contribution Service - Contribution management API calls
import api from './api';

export const contributionService = {
  // Create new contribution
  create: async (contributionData) => {
    const response = await api.post('/contributions', contributionData);
    return response.data;
  },
  
  // Get my contributions
  getMy: async () => {
    const response = await api.get('/contributions/my');
    return response.data;
  },
  
  // Get festival contributions
  getByFestival: async (festivalId) => {
    const response = await api.get(`/contributions/festival/${festivalId}`);
    return response.data;
  },
  
  // Get verified contributions for a festival
  getVerifiedByFestival: async (festivalId) => {
    const response = await api.get(`/contributions/festival/${festivalId}/verified`);
    return response.data;
  },
  
  // Get recent contributions
  getRecent: async () => {
    const response = await api.get('/contributions/recent');
    return response.data;
  },
  
  // Get pending contributions (admin)
  getPending: async () => {
    const response = await api.get('/contributions/pending');
    return response.data;
  },
  
  // Verify contribution (admin)
  verify: async (contributionId) => {
    const response = await api.post(`/contributions/${contributionId}/verify`);
    return response.data;
  },
  
  // Reject contribution (admin)
  reject: async (contributionId, reason = '') => {
    const response = await api.post(`/contributions/${contributionId}/reject?reason=${encodeURIComponent(reason)}`);
    return response.data;
  },
};

export default contributionService;


