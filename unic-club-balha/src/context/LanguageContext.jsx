import { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const { t, i18n } = useTranslation();
  
  const language = i18n.language;
  
  const setLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('app-language', lang);
    document.documentElement.lang = lang;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
