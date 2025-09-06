import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import SuperAdminDashboardLayout from "../Pages/SuperAdminDashboardLayout";
import SuperAdminDashboard from "../Pages/SuperAdminDashboard/SuperAdminDashboard";
import AddHotel from "../Pages/SuperAdminDashboard/AddHotel";
import AdminList from "../Pages/SuperAdminDashboard/AdminList";
// import SettingsPage from "../Pages/SuperAdminDashboard/Setting";
import Profile from "../components/ProfileComponent";

const SuperAdminRoutes = () => {
  return (
    <Routes>
      <Route
        path="/super-admin/*"
        element={
          <ProtectedRoute>
            <Routes>
              <Route
                path="dashboard"
                element={
                  <SuperAdminDashboardLayout>
                    <SuperAdminDashboard />
                  </SuperAdminDashboardLayout>
                }
              />
              <Route path="profile" element={<Profile />} />
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
              {/* <Route
                path="settings"
                element={
                  <SuperAdminDashboardLayout>
                    <SettingsPage />
                  </SuperAdminDashboardLayout>
                }
              /> */}
              <Route path="" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default SuperAdminRoutes;
