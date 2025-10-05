import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// Import Icons
import "bootstrap-icons/font/bootstrap-icons.css";
import "remixicon/fonts/remixicon.css";

// Import Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import "./i18n/index";

import { AuthProvider } from "context/AuthContext";
import { HotelProvider } from "context/HotelContext";
import { HotelSelectionProvider } from "context/HotelSelectionContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <HotelProvider>
            <HotelSelectionProvider>
              <App />
            </HotelSelectionProvider>
          </HotelProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
);

// Note: AuthProvider and HotelProvider are now handled inside App.js
// This prevents context duplication and ensures proper nesting
