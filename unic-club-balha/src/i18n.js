import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationHI from './locales/hi/translation.json';

const resources = {
  en: {
    translation: translationEN
  },
  hi: {
    translation: translationHI
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'hi', // Default to Hindi
    lng: localStorage.getItem('app-language') || 'hi',
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'app-language',
    },

    interpolation: {
      escapeValue: false // React already handles XSS
    },

    // Flatten nested keys with dot notation
    keySeparator: '.',
    nsSeparator: false,
  });

export default i18n;

