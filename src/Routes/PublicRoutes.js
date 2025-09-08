// PublicRoutes.js - Corrected
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import AdminLoginPage from "../Pages/Login/LoginPage";
import SuperAdminLoginPage from "../Pages/Login/SuperAdminLoginPage";
import SignupPage from "../Pages/Login/SignupPage";
import Home from "../Pages/User/Home";
import Offers from "../Pages/User/Offers";

const PublicRoutes = () => {
  return (
    <Routes>
      {/* Admin login route */}
      <Route
        path="/admin/login"
        element={
          <ProtectedRoute requiresAuth={false} redirectTo="/admin/hotel-select">
            <AdminLoginPage />
          </ProtectedRoute>
        }
      />

      {/* Super admin login route */}
      <Route
        path="/super-admin/login"
        element={
          <ProtectedRoute
            requiresAuth={false}
            redirectTo="/super-admin/dashboard"
          >
            <SuperAdminLoginPage />
          </ProtectedRoute>
        }
      />

      {/* Signup route */}
      <Route
        path="/admin/signup"
        element={
          <ProtectedRoute requiresAuth={false}>
            <SignupPage />
          </ProtectedRoute>
        }
      />

      {/* Public user routes */}
      <Route path="/viewMenu/:hotelName/home" element={<Home />} />
      <Route path="/viewMenu/:hotelName/offers" element={<Offers />} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

export default PublicRoutes;
