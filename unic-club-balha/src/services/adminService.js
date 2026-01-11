// Admin Service - Admin dashboard API calls
import api from './api';

export const adminService = {
  // Get dashboard statistics
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  
  // Get all members
  getMembers: async () => {
    const response = await api.get('/admin/members');
    return response.data;
  },
  
  // Update member role (super admin)
  updateMemberRole: async (userId, role) => {
    const response = await api.put(`/admin/members/${userId}/role?role=${role}`);
    return response.data;
  },
};

export default adminService;


