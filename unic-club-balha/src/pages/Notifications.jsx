import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Card, Badge, Button } from '../components/ui';
import { 
  Bell, 
  Calendar, 
  Gift, 
  IndianRupee, 
  Megaphone,
  CheckCircle,
  Circle,
  Loader2
} from 'lucide-react';
import { notificationService } from '../services';

function Notifications() {
  const { t, language } = useLanguage();
  const { useBackend } = useAuth();
  const [notifList, setNotifList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (useBackend) {
          const data = await notificationService.getMyNotifications();
          setNotifList(data || []);
        } else {
          // Fallback to mock data
          const { notifications: mockNotifications } = await import('../data/mockData');
          setNotifList(mockNotifications);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Fallback to mock data on error
        const { notifications: mockNotifications } = await import('../data/mockData');
        setNotifList(mockNotifications);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [useBackend]);

  const getIcon = (type) => {
    switch (type) {
      case 'festival':
        return <Calendar className="w-5 h-5" />;
      case 'contribution':
        return <IndianRupee className="w-5 h-5" />;
      case 'birthday':
        return <Gift className="w-5 h-5" />;
      default:
        return <Megaphone className="w-5 h-5" />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'festival':
        return 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400';
      case 'contribution':
        return 'bg-leaf-100 dark:bg-leaf-900/40 text-leaf-600 dark:text-leaf-400';
      case 'birthday':
        return 'bg-saffron-100 dark:bg-saffron-900/40 text-saffron-600 dark:text-saffron-400';
      default:
        return 'bg-earth-100 dark:bg-earth-800 text-earth-600 dark:text-earth-400';
    }
  };

  const markAsRead = async (id) => {
    // Optimistic update
    setNotifList(notifList.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
    
    // Call API
    if (useBackend) {
      try {
        await notificationService.markAsRead(id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const markAllRead = async () => {
    // Optimistic update
    setNotifList(notifList.map(n => ({ ...n, isRead: true })));
    
    // Call API
    if (useBackend) {
      try {
        await notificationService.markAllAsRead();
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    }
  };

  const unreadCount = notifList.filter(n => !n.isRead).length;

  const formatNotifTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} ${language === 'hi' ? 'मिनट पहले' : 'min ago'}`;
    if (hours < 24) return `${hours} ${language === 'hi' ? 'घंटे पहले' : 'hours ago'}`;
    return `${days} ${language === 'hi' ? 'दिन पहले' : 'days ago'}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
        <p className="text-earth-500 dark:text-earth-400 mt-4">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-earth-900 dark:text-cream-100 mb-2">
            {t('notifications.title')}
          </h1>
          <p className="text-earth-600 dark:text-earth-400">
            {t('notifications.subtitle')}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            {t('notifications.markAllRead')}
          </Button>
        )}
      </div>

      {/* Stats */}
      {unreadCount > 0 && (
        <div className="mb-6 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-center">
          <p className="text-primary-700 dark:text-primary-300 font-medium">
            {unreadCount} {language === 'hi' ? 'नई सूचनाएं' : 'new notifications'}
          </p>
        </div>
      )}

      {/* Notifications List */}
      {notifList.length > 0 ? (
        <div className="space-y-4">
          {notifList.map((notif) => (
            <Card
              key={notif.id}
              className={`cursor-pointer transition-all ${
                !notif.isRead ? 'ring-2 ring-primary-200 dark:ring-primary-800' : ''
              }`}
              onClick={() => markAsRead(notif.id)}
            >
              <div className="p-4 flex gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconBg(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`font-semibold truncate ${
                      !notif.isRead ? 'text-earth-900 dark:text-cream-100' : 'text-earth-700 dark:text-earth-300'
                    }`}>
                      {notif.title}
                    </h3>
                    {!notif.isRead && (
                      <Circle className="w-3 h-3 fill-primary-500 text-primary-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-earth-600 dark:text-earth-400 line-clamp-2 mb-2">
                    {notif.message}
                  </p>
                  <p className="text-xs text-earth-500 dark:text-earth-500">
                    {formatNotifTime(notif.createdAt)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="py-12 text-center">
            <Bell className="w-16 h-16 mx-auto text-earth-300 dark:text-earth-600 mb-4" />
            <h3 className="text-lg font-semibold text-earth-900 dark:text-cream-100 mb-2">
              {t('notifications.noNotifications')}
            </h3>
          </div>
        </Card>
      )}
    </div>
  );
}

export default Notifications;
