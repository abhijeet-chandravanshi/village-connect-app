import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Home, 
  Calendar, 
  Image, 
  User, 
  Bell
} from 'lucide-react';

function BottomNav() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  const navLinks = [
    { to: '/', icon: Home, label: t('nav.home') },
    { to: '/festivals', icon: Calendar, label: t('nav.festivals') },
    { to: '/gallery', icon: Image, label: t('nav.gallery') },
    { to: '/notifications', icon: Bell, label: t('nav.notifications'), badge: unreadCount },
    { to: '/profile', icon: User, label: t('nav.profile') },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-earth-900/90 backdrop-blur-md border-t border-cream-200 dark:border-earth-700 safe-area-bottom transition-colors duration-300">
      <div className="flex items-center justify-around px-2 py-2">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`relative flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all ${
              isActive(link.to)
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-earth-500 dark:text-earth-400'
            }`}
          >
            <div className={`relative p-1.5 rounded-lg ${
              isActive(link.to) ? 'bg-primary-100 dark:bg-primary-900/40' : ''
            }`}>
              <link.icon className={`w-5 h-5 ${link.badge > 0 && link.to === '/notifications' ? 'animate-pulse' : ''}`} />
              {link.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {link.badge > 9 ? '9+' : link.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] mt-0.5 font-medium ${
              isActive(link.to) ? 'text-primary-600 dark:text-primary-400' : 'text-earth-500 dark:text-earth-400'
            }`}>
              {link.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default BottomNav;
