// src/utils/themeConfig.js
export const themeConfig = {
  themes: {
    orange: {
      name: "Orange Theme",
      icon: "🧡",
      colors: {
        primary: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316", // Main orange
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        secondary: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
        background: "#ffffff",
        surface: "#f9fafb",
        card: "#ffffff",
        text: "#111827",
        textSecondary: "#6b7280",
        textMuted: "#9ca3af",
        border: "#e5e7eb",
        borderLight: "#f3f4f6",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",
      },
    },
    green: {
      name: "Green Theme",
      icon: "💚",
      colors: {
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e", // Main green
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        secondary: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
        background: "#ffffff",
        surface: "#f9fafb",
        card: "#ffffff",
        text: "#111827",
        textSecondary: "#6b7280",
        textMuted: "#9ca3af",
        border: "#e5e7eb",
        borderLight: "#f3f4f6",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",
      },
    },
    dark: {
      name: "Dark Theme",
      icon: "🌙",
      colors: {
        primary: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b", // Main slate
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        secondary: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
        },
        background: "#0f172a",
        surface: "#1e293b",
        card: "#334155",
        text: "#f8fafc",
        textSecondary: "#cbd5e1",
        textMuted: "#94a3b8",
        border: "#334155",
        borderLight: "#475569",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",
      },
    },
    blue: {
      name: "Blue Theme",
      icon: "💙",
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6", // Main blue
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        secondary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        background: "#ffffff",
        surface: "#f9fafb",
        card: "#ffffff",
        text: "#111827",
        textSecondary: "#6b7280",
        textMuted: "#9ca3af",
        border: "#e5e7eb",
        borderLight: "#f3f4f6",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",
      },
    },
  },
  defaultTheme: "orange",
  storageKey: "doyo-theme",
};

// Helper functions
export const getTheme = (themeName) => {
  return (
    themeConfig.themes[themeName] ||
    themeConfig.themes[themeConfig.defaultTheme]
  );
};

export const getAllThemes = () => {
  return Object.keys(themeConfig.themes).map((key) => ({
    key,
    ...themeConfig.themes[key],
  }));
};

export const isValidTheme = (themeName) => {
  return Object.keys(themeConfig.themes).includes(themeName);
};
