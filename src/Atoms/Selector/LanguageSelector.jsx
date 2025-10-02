// src/components/LanguageSelector.jsx
import React, { useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useTranslation } from "react-i18next";

const LanguageSelector = ({ className = "" }) => {
  const { currentLanguage, languages, changeLanguage } = useLanguage();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {languages[currentLanguage]?.flag}{" "}
          {languages[currentLanguage]?.nativeName}
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-[200px]">
          {Object.entries(languages).map(([code, lang]) => (
            <button
              key={code}
              onClick={() => {
                changeLanguage(code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                currentLanguage === code
                  ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                  : ""
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <div>
                <div className="font-medium">{lang.nativeName}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {lang.name}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
