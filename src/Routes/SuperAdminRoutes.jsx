// Routes/SuperAdminRoutes.jsx
import Profile from "organisms/ProfileComponent";
import { AdminList, SuperAdminDashboard } from "Pages";
import AddHotelWithAdmins from "Pages/SuperAdminDashboard/AddHotel";
import ViewHotel from "Pages/SuperAdminDashboard/HotelList";
import ViewHotelSubscription from "Pages/SuperAdminDashboard/Subcription";
import SuperAdminDashboardLayout from "layout/SuperAdminDashboardLayout";
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

const SuperAdminRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<SuperAdminDashboard />} />
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
            <AddHotelWithAdmins />
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
        path="view-hotel"
        element={
          <SuperAdminDashboardLayout>
            <ViewHotel />
          </SuperAdminDashboardLayout>
        }
      />
      <Route
        path="view-hotel-subscriptions"
        element={
          <SuperAdminDashboardLayout>
            <ViewHotelSubscription />
          </SuperAdminDashboardLayout>
        }
      />
      <Route path="" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default SuperAdminRoutes;
