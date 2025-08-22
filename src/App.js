import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

// Importing all required components from the "./Pages" directory
import {
  Home,
  AddHotel,
  SuperAdminDashboard,
  AdminDashboard,
  LoginPage,
  SignupPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  AdminList,
  MenuDashboard,
  ThankYouScreen,
  WelcomeScreen,
  POS,
} from "./Pages";

// Importing other components
import { Layout } from "./Atoms";
import { ErrorBoundary } from "./components";

import UserLogin from "Pages/Login/UserLogin";

import Offers from "Pages/User/Offers";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("admin")) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeScreen(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          {/* Login Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/viewMenu/:hotelName/login/user-login"
            element={<UserLogin />}
          />
          <Route path="/" element={<Navigate to="/login" />} />

          {/* User Routes */}

          <Route path="/viewMenu/:hotelName/login" element={<UserLogin />} />
          <Route path="/viewMenu/:hotelName/welcome" element={<UserLogin />} />
          <Route path="/viewMenu/:hotelName/home" element={<Home />} />
          <Route path="/:hotelName/feedback" element={""} />
          <Route path="/:hotelName/thank-you" element={<ThankYouScreen />} />
          <Route path="/viewMenu/:hotelName/offers" element={<Offers />} />
        </Routes>

        {isAdmin && (
          <>
            <Layout>
              <Routes>
                {/* Super Admin Routes */}
                <Route
                  path="/super-admin/dashboard"
                  element={<SuperAdminDashboard />}
                />
                <Route
                  path="/super-admin/dashboard/admin-list"
                  element={<AdminList />}
                />
                <Route path="/hotels/admin/add-hotel" element={<AddHotel />} />

                {/* Admin Routes */}
                <Route
                  path="/viewMenu/:hotelName/admin/POS"
                  element={<POS />}
                />
                <Route
                  path="/:hotelName/admin/admin-dashboard"
                  element={<AdminDashboard />}
                />
                <Route
                  path="/:hotelName/admin/menu/menu-dashboard"
                  element={<MenuDashboard />}
                />
              </Routes>
            </Layout>
          </>
        )}
      </ErrorBoundary>
    </Router>
  );
}

export default App;
