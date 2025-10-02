// src/components/ThemeSelector.jsx
import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const ThemeSelector = ({ className = "" }) => {
  const { currentTheme, toggleTheme, setTheme } = useTheme();

  const themes = [
    { key: "light", label: "Light", icon: Sun },
    { key: "dark", label: "Dark", icon: Moon },
    { key: "system", label: "System", icon: Monitor },
  ];

  return (
    <div
      className={`flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}
    >
      {themes.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => (key === "system" ? toggleTheme() : setTheme(key))}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentTheme === key
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};

export default ThemeSelector;
