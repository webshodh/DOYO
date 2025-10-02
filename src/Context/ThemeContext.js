// src/contexts/ThemeContext.js
import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const themes = {
  light: {
    name: "light",
    colors: {
      primary: "#f97316",
      primaryHover: "#ea580c",
      secondary: "#6b7280",
      background: "#ffffff",
      surface: "#f9fafb",
      text: "#111827",
      textSecondary: "#6b7280",
      border: "#e5e7eb",
      error: "#ef4444",
      success: "#10b981",
      warning: "#f59e0b",
      info: "#3b82f6",
    },
    shadows: {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    },
  },
  dark: {
    name: "dark",
    colors: {
      primary: "#f97316",
      primaryHover: "#ea580c",
      secondary: "#9ca3af",
      background: "#111827",
      surface: "#1f2937",
      text: "#f9fafb",
      textSecondary: "#9ca3af",
      border: "#374151",
      error: "#ef4444",
      success: "#10b981",
      warning: "#f59e0b",
      info: "#3b82f6",
    },
    shadows: {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.3)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)",
    },
  },
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Get theme from localStorage or system preference
    const savedTheme = localStorage.getItem("theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    const initialTheme = savedTheme || systemTheme;

    setCurrentTheme(initialTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Apply theme to document
      document.documentElement.className = currentTheme;
      document.documentElement.setAttribute("data-theme", currentTheme);

      // Save to localStorage
      localStorage.setItem("theme", currentTheme);

      // Update CSS variables
      const theme = themes[currentTheme];
      const root = document.documentElement;

      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });

      Object.entries(theme.shadows).forEach(([key, value]) => {
        root.style.setProperty(`--shadow-${key}`, value);
      });
    }
  }, [currentTheme, mounted]);

  const toggleTheme = () => {
    setCurrentTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (theme) => {
    if (themes[theme]) {
      setCurrentTheme(theme);
    }
  };

  const value = {
    currentTheme,
    theme: themes[currentTheme],
    toggleTheme,
    setTheme,
    isDark: currentTheme === "dark",
    isLight: currentTheme === "light",
  };

  // Prevent flash of incorrect theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
