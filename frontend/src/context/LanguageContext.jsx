import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';
import mr from '../i18n/mr.json';

const LanguageContext = createContext(null);

const translations = { en, hi, mr };

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const savedLanguage = localStorage.getItem('asha_lang');
    return translations[savedLanguage] ? savedLanguage : 'en';
  });

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem('asha_lang', lang);
    }
  };

  /**
   * Translate key with nested path support (e.g. 'nav.dashboard')
   */
  const t = (keyPath, fallback = '') => {
    const keys = keyPath.split('.');
    let current = translations[language];

    for (const k of keys) {
      if (current && current[k] !== undefined) {
        current = current[k];
      } else {
        // Fallback to English if translation is missing
        let enFallback = translations.en;
        for (const ek of keys) {
          if (enFallback && enFallback[ek] !== undefined) {
            enFallback = enFallback[ek];
          } else {
            enFallback = fallback || keyPath;
            break;
          }
        }
        return enFallback;
      }
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages: ['en', 'hi', 'mr'] }}>
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
