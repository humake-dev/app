// i18n/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 번역 파일
import translationKR from './locales/ko.json';
import translationEN from './locales/en.json';

const resources = {
  ko: {
    translation: translationKR,
  },
  en: {
    translation: translationEN,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ko', // 기본 언어 설정
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;