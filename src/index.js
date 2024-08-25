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

import { HotelProvider } from "./Context/HotelContext";
// Inject colors into CSS
import { injectColorsIntoCSS } from "./theme/InjectColors";
import { AuthProvider } from "./Context/AuthContext";
import { UserAuthProvider } from "./Context/UserAuthContext";
import { UserProvider } from "./Context/UserContext";
injectColorsIntoCSS();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <HotelProvider>
      <UserAuthProvider>
      <UserProvider>
        <App />
        </UserProvider>
        </UserAuthProvider>
      </HotelProvider>
    </AuthProvider>
  </React.StrictMode>
);
