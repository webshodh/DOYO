// src/hooks/useTheme.js
import { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

// Additional utility hook for getting theme-aware classes
export const useThemeClasses = () => {
  const { themeColors, theme } = useTheme();

  return {
    // Primary colors
    primaryBg: theme === "dark" ? "bg-slate-600" : `bg-${theme}-500`,
    primaryText: "text-white",
    primaryBorder:
      theme === "dark" ? "border-slate-600" : `border-${theme}-500`,
    primaryHover:
      theme === "dark" ? "hover:bg-slate-700" : `hover:bg-${theme}-600`,

    // Secondary colors
    secondaryBg: theme === "dark" ? "bg-slate-700" : `bg-${theme}-100`,
    secondaryText: theme === "dark" ? "text-slate-200" : `text-${theme}-800`,

    // Background colors
    background: theme === "dark" ? "bg-slate-900" : "bg-white",
    surface: theme === "dark" ? "bg-slate-800" : "bg-gray-50",
    card: theme === "dark" ? "bg-slate-800" : "bg-white",

    // Text colors
    textPrimary: theme === "dark" ? "text-white" : "text-gray-900",
    textSecondary: theme === "dark" ? "text-slate-300" : "text-gray-600",
    textMuted: theme === "dark" ? "text-slate-400" : "text-gray-500",

    // Border colors
    border: theme === "dark" ? "border-slate-600" : "border-gray-200",
    borderLight: theme === "dark" ? "border-slate-700" : "border-gray-100",

    // Button variants
    btnPrimary: `${
      theme === "dark"
        ? "bg-slate-600 hover:bg-slate-700"
        : `bg-${theme}-500 hover:bg-${theme}-600`
    } text-white`,
    btnSecondary: `${
      theme === "dark"
        ? "bg-slate-700 hover:bg-slate-600 text-slate-200"
        : `bg-${theme}-100 hover:bg-${theme}-200 text-${theme}-800`
    }`,
    btnOutline: `${
      theme === "dark"
        ? "border-slate-600 text-slate-300 hover:bg-slate-800"
        : `border-${theme}-500 text-${theme}-500 hover:bg-${theme}-50`
    } border`,
  };
};
