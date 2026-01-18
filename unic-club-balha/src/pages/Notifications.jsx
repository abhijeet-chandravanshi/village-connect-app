import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
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

function Notifications() {
  const { t, language } = useLanguage();
  const { 
    notifications: notifList, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    refreshNotifications,
    refreshUnreadCount
  } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Refresh data when user visits notifications page (only once per mount)
  useEffect(() => {
    const loadData = async () => {
      if (hasLoaded) return; // Prevent re-fetching
      
      setLoading(true);
      try {
        await Promise.all([
          refreshNotifications(),
          refreshUnreadCount()
        ]);
        setHasLoaded(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // Cleanup: reset hasLoaded when component unmounts
    return () => setHasLoaded(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

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


  const formatNotifTime = (dateString) => {
    try {
      // Handle backend format: 2026-01-18T07:17:42.026634 (with microseconds)
      // Replace microseconds with milliseconds for JavaScript Date compatibility
      let normalizedDateString = dateString;
      if (typeof dateString === 'string' && dateString.includes('.')) {
        const [datePart, timePart] = dateString.split('T');
        if (timePart) {
          const [time, fraction] = timePart.split('.');
          // Convert microseconds to milliseconds (take first 3 digits)
          const milliseconds = fraction ? fraction.substring(0, 3) : '000';
          normalizedDateString = `${datePart}T${time}.${milliseconds}`;
        }
      }
      
      const date = new Date(normalizedDateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return language === 'hi' ? 'अभी' : 'now';
      }
      
      const now = new Date();
      const diff = now - date;
      
      // Handle negative time (future dates or clock skew)
      if (diff < 0) {
        return language === 'hi' ? 'अभी' : 'just now';
      }
      
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return language === 'hi' ? 'अभी' : 'just now';
      if (minutes < 60) return `${minutes} ${language === 'hi' ? 'मिनट पहले' : 'min ago'}`;
      if (hours < 24) return `${hours} ${language === 'hi' ? 'घंटे पहले' : 'hours ago'}`;
      if (days === 1) return language === 'hi' ? 'कल' : 'yesterday';
      if (days < 7) return `${days} ${language === 'hi' ? 'दिन पहले' : 'days ago'}`;
      if (days < 30) {
        const weeks = Math.floor(days / 7);
        return `${weeks} ${language === 'hi' ? 'सप्ताह पहले' : 'week' + (weeks > 1 ? 's' : '') + ' ago'}`;
      }
      if (days < 365) {
        const months = Math.floor(days / 30);
        return `${months} ${language === 'hi' ? 'महीने पहले' : 'month' + (months > 1 ? 's' : '') + ' ago'}`;
      }
      const years = Math.floor(days / 365);
      return `${years} ${language === 'hi' ? 'साल पहले' : 'year' + (years > 1 ? 's' : '') + ' ago'}`;
    } catch (error) {
      console.error('Error formatting notification time:', error, dateString);
      return language === 'hi' ? 'अभी' : 'now';
    }
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-earth-900 dark:text-cream-100 mb-1 sm:mb-2">
            {t('notifications.title')}
          </h1>
          <p className="text-sm sm:text-base text-earth-600 dark:text-earth-400">
            {t('notifications.subtitle')}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllAsRead} className="w-full sm:w-auto">
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
                !notif.isRead 
                  ? 'ring-2 ring-primary-300 dark:ring-primary-700 bg-primary-50 dark:bg-primary-900/20' 
                  : 'bg-white dark:bg-earth-800 hover:bg-cream-50 dark:hover:bg-earth-700'
              }`}
              onClick={() => !notif.isRead && markAsRead(notif.id)}
            >
              <div className="p-3 sm:p-4 flex gap-3 sm:gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${getIconBg(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`font-semibold text-sm sm:text-base truncate ${
                      !notif.isRead ? 'text-earth-900 dark:text-cream-100' : 'text-earth-700 dark:text-earth-400'
                    }`}>
                      {notif.title}
                    </h3>
                    {!notif.isRead && (
                      <Circle className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-primary-600 text-primary-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-earth-600 dark:text-earth-400 line-clamp-2 mb-1.5 sm:mb-2">
                    {notif.message}
                  </p>
                  <p className="text-xs text-earth-500 dark:text-earth-400">
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
