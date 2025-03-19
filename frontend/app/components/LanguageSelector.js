"use client";
import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import { useTranslation } from "react-i18next";

const LanguageSelector = () => {
  const { i18n } = useTranslation(); // Get i18n instance
  const { language, setLanguage } = useContext(LanguageContext); // Get language and setter from context

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;
    setLanguage(selectedLanguage); // Update the context language
    i18n.changeLanguage(selectedLanguage); // Change language in i18next
  };

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="language-select" className="text-white text-sm">
        {i18n.t("hero.chooseLanguage")}:
      </label>
      <select
        id="language-select"
        onChange={handleLanguageChange}
        value={language} // Use the context language value
        className="bg-white text-black px-2 py-1 rounded-md"
      >
        <option value="en">English</option>
        <option value="ar">العربية</option>
        <option value="es">Español</option>
        <option value="fr">français</option>
        <option value="jp">日本語</option>
        <option value="ko">한국어</option>
        <option value="ru">Русский</option>
        <option value="zh">中文</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
