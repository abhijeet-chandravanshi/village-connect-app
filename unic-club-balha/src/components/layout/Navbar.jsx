import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { SettingsDropdown } from '../ui';
import { 
  Home, 
  Calendar, 
  Image, 
  User, 
  Bell,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

function Navbar() {
  const { user, isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', icon: Home, label: t('nav.home') },
    { to: '/festivals', icon: Calendar, label: t('nav.festivals') },
    { to: '/gallery', icon: Image, label: t('nav.gallery') },
    { to: '/notifications', icon: Bell, label: t('nav.notifications'), badge: unreadCount },
    { to: '/profile', icon: User, label: t('nav.profile') },
  ];

  if (isAdmin) {
    navLinks.splice(4, 0, { to: '/admin', icon: Shield, label: t('nav.admin') });
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-earth-900/80 backdrop-blur-md border-b border-cream-200 dark:border-earth-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary-500 to-saffron-500 flex items-center justify-center text-white font-bold text-lg shadow-warm">
              UC
            </div>
            <span className="font-display font-bold text-xl text-earth-900 dark:text-cream-100 hidden sm:block">
              {t('common.appName')}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  isActive(link.to)
                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                    : 'text-earth-600 dark:text-earth-400 hover:text-earth-900 dark:hover:text-cream-100 hover:bg-cream-100 dark:hover:bg-earth-800'
                }`}
              >
                <link.icon className={`w-5 h-5 ${link.badge > 0 && link.to === '/notifications' ? 'animate-pulse' : ''}`} />
                <span className="hidden lg:inline">{link.label}</span>
                {link.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-warm">
                    {link.badge > 9 ? '9+' : link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Right side - Settings & User */}
          <div className="flex items-center gap-2">
            <SettingsDropdown />
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-earth-600 dark:text-earth-400 hover:bg-cream-100 dark:hover:bg-earth-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            {/* Desktop User Avatar */}
            <Link to="/profile" className="hidden md:flex items-center gap-3 pl-4 border-l border-cream-200 dark:border-earth-700">
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary-400 to-saffron-400 flex items-center justify-center text-white font-semibold hover:shadow-warm transition-shadow cursor-pointer">
                {[...(language === 'en' ? (user?.nameEn || user?.name) : user?.name) || ''][0] || 'U'}
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-earth-900 border-t border-cream-200 dark:border-earth-700">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive(link.to)
                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                    : 'text-earth-600 dark:text-earth-400 hover:bg-cream-100 dark:hover:bg-earth-800'
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
                {link.badge > 0 && (
                  <span className="ml-auto w-6 h-6 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
