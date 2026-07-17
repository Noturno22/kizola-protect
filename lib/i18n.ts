import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';

import en from '../assets/translations/en.json';

const LANGUAGE_KEY = 'user-language';

// Track which languages have been loaded to avoid redundant work
const loadedLanguages = new Set<string>(['en']);

const translationModules: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
  pt: () => import('../assets/translations/pt.json'),
  fr: () => import('../assets/translations/fr.json'),
  es: () => import('../assets/translations/es.json'),
  'es-US': () => import('../assets/translations/es-US.json'),
  zh: () => import('../assets/translations/zh.json'),
  ja: () => import('../assets/translations/ja.json'),
  ko: () => import('../assets/translations/ko.json'),
  vi: () => import('../assets/translations/vi.json'),
  tl: () => import('../assets/translations/tl.json'),
  ar: () => import('../assets/translations/ar.json'),
  ru: () => import('../assets/translations/ru.json'),
  hi: () => import('../assets/translations/hi.json'),
  bn: () => import('../assets/translations/bn.json'),
  ln: () => import('../assets/translations/ln.json'),
};

export async function loadExtraTranslations(lang: string): Promise<void> {
  if (loadedLanguages.has(lang)) return;
  const loader = translationModules[lang];
  if (!loader) return;
  try {
    const mod = await loader();
    i18n.addResourceBundle(lang, 'translation', mod.default, true, true);
    loadedLanguages.add(lang);
  } catch {
    console.warn(`[i18n] Failed to load translations for "${lang}"`);
  }
}

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
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  // Skip if already loaded — this avoids redundant dynamic imports and addResourceBundle calls
  if (!loadedLanguages.has(lng)) {
    loadExtraTranslations(lng);
  }
});

export async function loadLanguageTranslations(lang: string): Promise<void> {
  if (lang === 'en') return;
  if (!translationModules[lang]) return;
  await loadExtraTranslations(lang);
}

export async function preloadAllTranslations(): Promise<void> {
  await Promise.allSettled(
    Object.entries(translationModules)
      .filter(([lang]) => !loadedLanguages.has(lang))
      .map(([lang, loader]) =>
        loader().then((mod) => {
          i18n.addResourceBundle(lang, 'translation', mod.default, true, true);
          loadedLanguages.add(lang);
        })
      )
  );
}

export default i18n;
