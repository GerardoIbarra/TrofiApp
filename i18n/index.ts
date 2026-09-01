import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import es from './locales/es.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
};

const LANGUAGE_KEY = 'user-language';

// 1. Detectar idioma inicial de forma síncrona
const locales = Localization.getLocales();
const deviceLanguage = locales[0]?.languageCode;
const initialLanguage = deviceLanguage === 'en' || deviceLanguage === 'es' ? deviceLanguage : 'es';

// 2. Inicializar i18n inmediatamente
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Importante para evitar problemas en React Native
    }
  });

// 3. Cargar idioma guardado de forma asíncrona (sin bloquear el inicio)
const loadSavedLanguage = async () => {
  if (typeof window === 'undefined') return;
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage && savedLanguage !== i18n.language) {
      await i18n.changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.log('AsyncStorage not ready or error loading language:', error);
  }
};

loadSavedLanguage();

export default i18n;
export { LANGUAGE_KEY };
