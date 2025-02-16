import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

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
      "shareResource": "Share Resource"
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
      "shareResource": "साझा गर्नुहोस्"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;