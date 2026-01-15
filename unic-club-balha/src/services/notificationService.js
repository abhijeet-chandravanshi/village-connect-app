// Notification Service - Notification management API calls
import api from './api';

export const notificationService = {
  // Get notifications for current user
  getMyNotifications: async () => {
    const response = await api.get('/notifications/my');
    return response.data;
  },
  
  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data?.unreadCount || 0;
  },
  
  // Get notification by ID
  getById: async (notificationId) => {
    const response = await api.get(`/notifications/${notificationId}`);
    return response.data;
  },
  
  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },
  
  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
  
  // Send notification to all members (Admin only)
  sendToAll: async (notificationData) => {
    const response = await api.post('/notifications/send-all', notificationData);
    return response.data;
  },
  
  // Send notification to specific users (Admin only)
  sendToUsers: async (userIds, notificationData) => {
    const response = await api.post('/notifications/send', {
      userIds,
      ...notificationData
    });
    return response.data;
  },
};

export default notificationService;
