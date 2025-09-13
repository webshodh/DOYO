// Routes/AdminRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Profile from "components/ProfileComponent";
import { AdminDashboard } from "Pages";
import AddCategory from "Pages/Admin Dashboard/AddCategory";
import CategoryManager from "Pages/Admin Dashboard/AddMainCategory";
import AddMenu from "Pages/Admin Dashboard/AddMenu";
import AddOffers from "Pages/Admin Dashboard/AddOffers";
import BulkMenuUpload from "Pages/Admin Dashboard/BulkUpload";
import KitchenAdminPage from "Pages/Admin Dashboard/Kitchen";
import SettingsPage from "Pages/Admin Dashboard/Setting";
import AdminDashboardLayout from "Pages/AdminDashboardLayout";
import AddOption from "Pages/Admin Dashboard/AddOptions";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route
        path="profile"
        element={
          <AdminDashboardLayout>
            <Profile />
          </AdminDashboardLayout>
        }
      />
      <Route
        path="add-category"
        element={
          <AdminDashboardLayout>
            <AddCategory />
          </AdminDashboardLayout>
        }
      />
      <Route
        path="add-special-category"
        element={
          <AdminDashboardLayout>
            <CategoryManager />
          </AdminDashboardLayout>
        }
      />
      <Route
        path="add-options"
        element={
          <AdminDashboardLayout>
            <AddOption />
          </AdminDashboardLayout>
        }
      />
      <Route
        path="add-menu"
        element={
          <AdminDashboardLayout>
            <AddMenu />
          </AdminDashboardLayout>
        }
      />
      <Route
        path="add-offers"
        element={
          <AdminDashboardLayout>
            <AddOffers />
          </AdminDashboardLayout>
        }
      />
      <Route
        path="upload-data"
        element={
          <AdminDashboardLayout>
            <BulkMenuUpload />
          </AdminDashboardLayout>
        }
      />
      <Route
        path="kitchen"
        element={
          <AdminDashboardLayout>
            <KitchenAdminPage />
          </AdminDashboardLayout>
        }
      />
      <Route
        path="settings"
        element={
          <AdminDashboardLayout>
            <SettingsPage />
          </AdminDashboardLayout>
        }
      />
      <Route path="" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
