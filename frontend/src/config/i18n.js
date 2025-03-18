import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "D:/projects/NYC-transit-hub/frontend/src/locales/en.json";
import ar from "D:/projects/NYC-transit-hub/frontend/src/locales/ar.json";
import es from "D:/projects/NYC-transit-hub/frontend/src/locales/es.json";
import fr from "D:/projects/NYC-transit-hub/frontend/src/locales/fr.json";
import jp from "D:/projects/NYC-transit-hub/frontend/src/locales/jp.json";
import ko from "D:/projects/NYC-transit-hub/frontend/src/locales/ko.json";
import ru from "D:/projects/NYC-transit-hub/frontend/src/locales/ru.json";
import zh from "D:/projects/NYC-transit-hub/frontend/src/locales/zh.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      es: { translation: es },
      fr: { translation: fr },
      jp: { translation: jp },
      ko: { translation: ko },
      ru: { translation: ru },
      zh: { translation: zh },
    },
    lng: "en", // Default language
    fallbackLng: "en", // If language is not available, fallback to English
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on("languageChanged", (lng) => {
  const htmlTag = document.documentElement;
  if (lng === "ar") {
    htmlTag.setAttribute("dir", "rtl");
  } else {
    htmlTag.setAttribute("dir", "ltr");
  }
});

export default i18n;
