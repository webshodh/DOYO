import React from "react";
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
} from "./Pages";

// Importing other components
import { Layout } from "./Atoms";
import { ErrorBoundary } from "./components";

import Offers from "Pages/User/Offers";
import AddCategory from "Pages/Admin Dashboard/AddCategory";
import CategoryManager from "Pages/Admin Dashboard/AddMainCategory";
import AddMenu from "Pages/Admin Dashboard/AddMenu";

// Protected Route Components
const ProtectedRoute = ({ children, allowedRoles, userRole }) => {
  if (!userRole) {
    return <Navigate to="/admin/login" replace />;
  }
  
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

// Get user role from localStorage, context, or wherever you store auth state
const getUserRole = () => {
  // Replace this with your actual authentication logic
  return localStorage.getItem('userRole'); // 'superadmin', 'admin', or null
};

function App() {
  const userRole = getUserRole();

  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          {/* Public Login Routes */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/super-admin/login" element={<LoginPage />} />
          <Route path="/super-admin/signup" element={<SignupPage />} />
          <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/admin/reset-password" element={<ResetPasswordPage />} />

          {/* Public User Routes (accessible to anyone) */}
          <Route path="/viewMenu/:hotelName/home" element={<Home />} />
          <Route path="/viewMenu/:hotelName/review" element={<div>Review Page</div>} />
          <Route path="/viewMenu/:hotelName/thank-you" element={<ThankYouScreen />} />
          <Route path="/viewMenu/:hotelName/offers" element={<Offers />} />

          {/* Protected Super Admin Routes */}
          <Route path="/super-admin/dashboard" element={<Layout><SuperAdminDashboard /></Layout>} />
          <Route path="/super-admin/dashboard/admin-list" element={<Layout><AdminList /></Layout>} />
          <Route path="/super-admin/dashboard/add-hotel" element={<Layout><AddHotel /></Layout>} />

          {/* Protected Admin Routes */}
          <Route path="/:hotelName/admin/admin-dashboard" element={<Layout><AdminDashboard /></Layout>} />
<Route path="/:hotelName/admin/add-category" element={<Layout><AddCategory /></Layout>} />
<Route path="/:hotelName/admin/add-special-category" element={<Layout><CategoryManager /></Layout>} />
<Route path="/:hotelName/admin/add-menu" element={<Layout><AddMenu /></Layout>} />

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          
          {/* Unauthorized page */}
          <Route path="/unauthorized" element={<div className="container mt-5"><h2>Unauthorized Access</h2><p>You don't have permission to access this page.</p></div>} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;