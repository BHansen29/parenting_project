import { useState } from 'react';

const LANGUAGE_STORAGE_KEY = 'sharecare-public-page-language';

export default function usePublicPageLanguage() {
  const [language, setLanguage] = useState(() =>
    window.sessionStorage.getItem(LANGUAGE_STORAGE_KEY) === 'es' ? 'es' : 'en'
  );

  function toggleLanguage() {
    const nextLanguage = language === 'en' ? 'es' : 'en';
    window.sessionStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    setLanguage(nextLanguage);
  }

  return { language, toggleLanguage };
}
