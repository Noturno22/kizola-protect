import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';

import en from '../assets/translations/en.json';
import pt from '../assets/translations/pt.json';
import fr from '../assets/translations/fr.json';
import es from '../assets/translations/es.json';
import esUS from '../assets/translations/es-US.json';
import zh from '../assets/translations/zh.json';
import ja from '../assets/translations/ja.json';
import ko from '../assets/translations/ko.json';
import vi from '../assets/translations/vi.json';
import tl from '../assets/translations/tl.json';
import ar from '../assets/translations/ar.json';
import ru from '../assets/translations/ru.json';
import hi from '../assets/translations/hi.json';
import bn from '../assets/translations/bn.json';

const LANGUAGE_KEY = 'user-language';

const languageDetector: any = {
  type: 'languageDetector',
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      const savedLanguage = await SecureStore.getItemAsync(LANGUAGE_KEY);
      if (savedLanguage) {
        return callback(savedLanguage);
      }
      try {
        const deviceLanguage = Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0];
        return callback(deviceLanguage || 'en');
      } catch (e) {
        return callback('en');
      }
    } catch (error) {
      console.log('Error reading language', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await SecureStore.setItemAsync(LANGUAGE_KEY, language);
    } catch (error) {}
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pt: { translation: pt },
      fr: { translation: fr },
      es: { translation: es },
      'es-US': { translation: esUS },
      zh: { translation: zh },
      ja: { translation: ja },
      ko: { translation: ko },
      vi: { translation: vi },
      tl: { translation: tl },
      ar: { translation: ar },
      ru: { translation: ru },
      hi: { translation: hi },
      bn: { translation: bn },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
