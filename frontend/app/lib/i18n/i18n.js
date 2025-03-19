import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "../i18n/en.json";
import ar from "../i18n/ar.json";
import es from "../i18n/es.json";
import fr from "../i18n/fr.json";
import jp from "../i18n/jp.json";
import ko from "../i18n/ko.json";
import ru from "../i18n/ru.json";
import zh from "../i18n/zh.json";

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
