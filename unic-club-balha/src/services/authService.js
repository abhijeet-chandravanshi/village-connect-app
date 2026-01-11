// Authentication Service - Connects to Java Backend
import api from './api';

export const authService = {
  // Send OTP to phone number
  sendOtp: async (phone) => {
    try {
      const response = await api.post('/auth/send-otp', { phone });
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  
  // Verify OTP and get JWT token
  verifyOtp: async (phone, otp) => {
    try {
      const response = await api.post('/auth/verify-otp', { phone, otp });
      
      if (response.success && response.data) {
        // Store token and user data
        localStorage.setItem('unicclub_token', response.data.token);
        localStorage.setItem('unicclub_user', JSON.stringify(response.data.user));
        
        return {
          success: true,
          user: response.data.user,
          isNewUser: response.data.isNewUser,
        };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  
  // Get current user from storage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('unicclub_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  // Get current token
  getToken: () => localStorage.getItem('unicclub_token'),
  
  // Check if user is logged in
  isLoggedIn: () => !!localStorage.getItem('unicclub_token'),
  
  // Logout
  logout: () => {
    localStorage.removeItem('unicclub_token');
    localStorage.removeItem('unicclub_user');
  },
  
  // Refresh user data from server
  refreshUser: async () => {
    try {
      const response = await api.get('/users/me');
      if (response.success && response.data) {
        localStorage.setItem('unicclub_user', JSON.stringify(response.data));
        return response.data;
      }
      return null;
    } catch (error) {
      return null;
    }
  },
};

export default authService;


