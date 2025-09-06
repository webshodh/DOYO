import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { HotelSelectionProvider } from "../Context/HotelSelectionContext";
import AdminDashboardLayout from "../Pages/AdminDashboardLayout";
import AdminDashboard from "../Pages/Admin Dashboard/AdminDashboard";
import AddCategory from "../Pages/Admin Dashboard/AddCategory";
import CategoryManager from "../Pages/Admin Dashboard/AddMainCategory";
import AddMenu from "../Pages/Admin Dashboard/AddMenu";
import AddOffers from "../Pages/Admin Dashboard/AddOffers";
import SettingsPage from "../Pages/Admin Dashboard/Setting";
import Profile from "../components/ProfileComponent";
import HotelSplashScreen from "../Pages/SplashScreen";

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Hotel selection screen */}
      <Route
        path="/admin/hotel-select"
        element={
          <ProtectedRoute>
            <HotelSelectionProvider>
              <HotelSplashScreen />
            </HotelSelectionProvider>
          </ProtectedRoute>
        }
      />

      {/* Hotel-specific routes */}
      <Route
        path="/:hotelName/admin/*"
        element={
          <ProtectedRoute>
            <HotelSelectionProvider>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="profile" element={<Profile />} />
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
                  path="settings"
                  element={
                    <AdminDashboardLayout>
                      <SettingsPage />
                    </AdminDashboardLayout>
                  }
                />

                {/* Default redirect */}
                <Route path="" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </HotelSelectionProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AdminRoutes;
