import React from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute"; // export ProtectedRoute separately
import AdminLoginPage from "../Pages/Login/LoginPage";
import SuperAdminLoginPage from "../Pages/Login/SuperAdminLoginPage";
import SignupPage from "../Pages/Login/SignupPage";
import Home from "../Pages/User/Home";
import Offers from "../Pages/User/Offers";

const PublicRoutes = () => {
  return (
    <Routes>
      <Route
        path="/admin/login"
        element={
          <ProtectedRoute requiresAuth={false}>
            <AdminLoginPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/login"
        element={
          <ProtectedRoute requiresAuth={false}>
            <SuperAdminLoginPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/sign-up"
        element={
          <ProtectedRoute requiresAuth={false}>
            <SignupPage />
          </ProtectedRoute>
        }
      />
      <Route path="/viewMenu/:hotelName/home" element={<Home />} />
      <Route path="/viewMenu/:hotelName/offers" element={<Offers />} />
    </Routes>
  );
};

export default PublicRoutes;
