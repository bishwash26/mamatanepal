import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Language storage key
export const LANGUAGE_STORAGE_KEY = 'app_language';

// Get user's saved language preference or detect browser language
const getUserLanguage = () => {
  // 1. Try to get from localStorage
  if (typeof window !== 'undefined') {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage && ['en', 'ne'].includes(savedLanguage)) {
      return savedLanguage;
    }
  }
  
  // 2. Try to detect from browser
  if (typeof window !== 'undefined' && navigator.language) {
    // If browser language starts with 'ne', use Nepali
    if (navigator.language.startsWith('ne')) {
      return 'ne';
    }
  }
  
  // 3. Default to English
  return 'en';
};

const resources = {
  en: {
    translation: {
      "welcome": "Welcome to Mamata Nepal",
      "resources": "Resources",
      "discussions": "Discussions",
      "login": "Login",
      "logout": "Logout",
      "createPost": "Create Post",
      "recentPosts": "Recent Posts",
      "popularResources": "Popular Resources",
      "switchLanguage": "भाषा परिवर्तन गर्नुहोस्",
      "readMore": "Read More",
      "profile": "Profile",
      "supportingMothers": "Supporting mothers through their pregnancy journey",
      "articles": "Articles",
      "videos": "Videos",
      "shorts": "Shorts",
      "watchNow": "Watch Now",
      "shareResource": "Share Resource",
      "about": "About"
    }
  },
  ne: {
    translation: {
      "welcome": "ममता नेपालमा स्वागत छ",
      "resources": "स्रोतहरू",
      "discussions": "छलफलहरू",
      "login": "लग इन",
      "logout": "लग आउट",
      "createPost": "पोस्ट सिर्जना गर्नुहोस्",
      "recentPosts": "भर्खरका पोस्टहरू",
      "popularResources": "लोकप्रिय स्रोतहरू",
      "switchLanguage": "Switch Language",
      "readMore": "थप पढ्नुहोस्",
      "profile": "प्रोफाइल",
      "supportingMothers": "गर्भावस्थामा आमाहरूलाई सहयोग गर्दै",
      "articles": "लेखहरू",
      "videos": "भिडियोहरू",
      "shorts": "शर्ट्स",
      "watchNow": "अहिले हेर्नुहोस्",
      "shareResource": "साझा गर्नुहोस्",
      "about": "हाम्रोबारे"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getUserLanguage(),
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;