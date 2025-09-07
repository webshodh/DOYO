// SuperAdminRoutes.js - Corrected
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import SuperAdminDashboardLayout from "../Pages/SuperAdminDashboardLayout";
import SuperAdminDashboard from "../Pages/SuperAdminDashboard/SuperAdminDashboard";
import AddHotel from "../Pages/SuperAdminDashboard/AddHotel";
import AdminList from "../Pages/SuperAdminDashboard/AdminList";
import Profile from "../components/ProfileComponent";
import SettingsPage from "../Pages/Admin Dashboard/Setting"; // Fixed import path

const SuperAdminRoutes = () => {
  return (
    <Routes>
      <Route
        path="/super-admin/*"
        element={
          <ProtectedRoute
            requiredRole="super-admin"
            redirectTo="/super-admin/login"
          >
            <Routes>
              <Route
                path="dashboard"
                element={
                  <SuperAdminDashboardLayout>
                    <SuperAdminDashboard />
                  </SuperAdminDashboardLayout>
                }
              />
              <Route
                path="profile"
                element={
                  <SuperAdminDashboardLayout>
                    <Profile />
                  </SuperAdminDashboardLayout>
                }
              />
              <Route
                path="add-hotel"
                element={
                  <SuperAdminDashboardLayout>
                    <AddHotel />
                  </SuperAdminDashboardLayout>
                }
              />
              <Route
                path="view-admin"
                element={
                  <SuperAdminDashboardLayout>
                    <AdminList />
                  </SuperAdminDashboardLayout>
                }
              />
              <Route
                path="settings"
                element={
                  <SuperAdminDashboardLayout>
                    <SettingsPage />
                  </SuperAdminDashboardLayout>
                }
              />
              {/* Default redirect to dashboard */}
              <Route path="" element={<Navigate to="dashboard" replace />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default SuperAdminRoutes;
