// ===========================================
// i18n YAPILANDIRMASI
// ===========================================

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Dil dosyalarını içe aktar
import tr from './locales/tr.json';
import en from './locales/en.json';

// i18n yapılandırması
i18n
  .use(LanguageDetector) // Tarayıcı dilini otomatik algıla
  .use(initReactI18next) // React entegrasyonu
  .init({
    resources: {
      tr: { translation: tr },
      en: { translation: en }
    },
    fallbackLng: 'tr', // Varsayılan dil
    supportedLngs: ['tr', 'en'], // Desteklenen diller

    detection: {
      // Dil algılama sırası
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'], // Seçilen dili localStorage'a kaydet
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false // React zaten XSS koruması yapıyor
    },

    react: {
      useSuspense: false // Suspense kullanma (opsiyonel)
    }
  });

export default i18n;
