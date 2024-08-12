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

import { HotelProvider } from "./Context/HotelContext";
// Inject colors into CSS
import { injectColorsIntoCSS } from "./theme/InjectColors";
import { AuthProvider } from "./Context/AuthContext";
injectColorsIntoCSS();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
    <HotelProvider>
      <App />
    </HotelProvider>
    </AuthProvider>
  </React.StrictMode>
);
