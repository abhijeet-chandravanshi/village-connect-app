import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '../services';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user, useBackend } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      if (useBackend) {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } else {
        // Fallback to mock data
        const { notifications: mockNotifs } = await import('../data/mockData');
        const count = mockNotifs.filter(n => !n.isRead).length;
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Fallback to mock data on error
      try {
        const { notifications: mockNotifs } = await import('../data/mockData');
        const count = mockNotifs.filter(n => !n.isRead).length;
        setUnreadCount(count);
      } catch {
        setUnreadCount(0);
      }
    }
  }, [user, useBackend]);

  // Fetch notifications list
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    try {
      if (useBackend) {
        const data = await notificationService.getMyNotifications();
        setNotifications(data || []);
      } else {
        const { notifications: mockNotifs } = await import('../data/mockData');
        setNotifications(mockNotifs);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      const { notifications: mockNotifs } = await import('../data/mockData');
      setNotifications(mockNotifs);
    }
  }, [user, useBackend]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));

    if (useBackend) {
      try {
        await notificationService.markAsRead(notificationId);
      } catch (error) {
        console.error('Error marking notification as read:', error);
        // Revert on error
        fetchNotifications();
        fetchUnreadCount();
      }
    }
  }, [useBackend, fetchNotifications, fetchUnreadCount]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);

    if (useBackend) {
      try {
        await notificationService.markAllAsRead();
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        // Revert on error
        fetchNotifications();
        fetchUnreadCount();
      }
    }
  }, [useBackend, fetchNotifications, fetchUnreadCount]);

  // Initial fetch and polling
  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount, fetchNotifications]);

  const value = {
    unreadCount,
    notifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
    refreshUnreadCount: fetchUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
