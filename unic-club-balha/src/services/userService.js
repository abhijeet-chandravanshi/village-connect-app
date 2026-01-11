// User Service - User management API calls
import api from './api';

export const userService = {
  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  
  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/users/me', profileData);
    
    // Update local storage
    if (response.success && response.data) {
      localStorage.setItem('unicclub_user', JSON.stringify(response.data));
    }
    
    return response.data;
  },
  
  // Get all users (admin)
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  // Get user by ID
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  
  // Search users
  searchUsers: async (query) => {
    const response = await api.get(`/users/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },
};

export default userService;


