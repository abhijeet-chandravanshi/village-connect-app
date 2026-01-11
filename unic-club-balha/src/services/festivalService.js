// Festival Service - Festival management API calls
import api from './api';

export const festivalService = {
  // Get all festivals
  getAll: async () => {
    const response = await api.get('/festivals');
    return response.data;
  },
  
  // Get active festivals (upcoming + ongoing)
  getActive: async () => {
    const response = await api.get('/festivals/active');
    return response.data;
  },
  
  // Get festival by ID
  getById: async (festivalId) => {
    const response = await api.get(`/festivals/${festivalId}`);
    return response.data;
  },
  
  // Get festivals by year
  getByYear: async (year) => {
    const response = await api.get(`/festivals/year/${year}`);
    return response.data;
  },
  
  // Get festivals by status
  getByStatus: async (status) => {
    const response = await api.get(`/festivals/status/${status}`);
    return response.data;
  },
  
  // Get distinct years
  getYears: async () => {
    const response = await api.get('/festivals/years');
    return response.data;
  },
  
  // Create festival (admin)
  create: async (festivalData) => {
    const response = await api.post('/festivals', festivalData);
    return response.data;
  },
  
  // Update festival (admin)
  update: async (festivalId, festivalData) => {
    const response = await api.put(`/festivals/${festivalId}`, festivalData);
    return response.data;
  },
  
  // Delete festival (super admin)
  delete: async (festivalId) => {
    const response = await api.delete(`/festivals/${festivalId}`);
    return response.success;
  },
};

export default festivalService;


