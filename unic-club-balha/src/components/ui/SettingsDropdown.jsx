import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Settings, Globe, Sun, Moon, Check } from 'lucide-react';

function SettingsDropdown() {
  const { language, setLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-earth-600 dark:text-earth-400 hover:bg-cream-100 dark:hover:bg-earth-800 transition-colors"
        title={t('nav.settings')}
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-earth-900 rounded-xl shadow-warm-lg dark:shadow-lg border border-cream-200 dark:border-earth-700 overflow-hidden z-50">
          {/* Language Section */}
          <div className="p-3 border-b border-cream-100 dark:border-earth-700">
            <p className="text-xs font-medium text-earth-500 dark:text-earth-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {t('settings.language')}
            </p>
            <div className="space-y-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    language === lang.code
                      ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                      : 'hover:bg-cream-100 dark:hover:bg-earth-800 text-earth-700 dark:text-earth-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span className="font-medium">{lang.label}</span>
                  </span>
                  {language === lang.code && (
                    <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Section */}
          <div className="p-3">
            <p className="text-xs font-medium text-earth-500 dark:text-earth-400 uppercase tracking-wider mb-2">
              {t('settings.theme')}
            </p>
            <button
              onClick={() => {
                toggleTheme();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-cream-100 dark:hover:bg-earth-800 transition-colors"
            >
              <span className="flex items-center gap-2 text-earth-700 dark:text-earth-300">
                {isDark ? (
                  <>
                    <Moon className="w-4 h-4 text-primary-500" />
                    <span className="font-medium">{t('settings.darkMode')}</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-saffron-500" />
                    <span className="font-medium">{t('settings.lightMode')}</span>
                  </>
                )}
              </span>
              <div className={`w-10 h-6 rounded-full p-1 transition-colors ${
                isDark ? 'bg-primary-500' : 'bg-cream-300 dark:bg-earth-600'
              }`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
                  isDark ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsDropdown;
