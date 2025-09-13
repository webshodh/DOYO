// Routes/CaptainRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import KitchenAdminPage from "Pages/Admin Dashboard/Kitchen";
import BillGenerationPage from "Pages/Captain/BillGenerationPage";
import CaptainMenuPage from "Pages/Captain/CaptainMenuPage";
import CartPage from "Pages/Captain/CartPage";
import CheckoutPage from "Pages/Captain/CheckoutPage";
import OrderSuccessPage from "Pages/Captain/OrderSuccessPage";
import AdminDashboardLayout from "Pages/AdminDashboardLayout";

const CaptainRoutes = () => {
  return (
    <Routes>
      {/* Core Captain Routes */}
      <Route path="home" element={<CaptainMenuPage />} />
      <Route path="menu" element={<CaptainMenuPage />} />
      <Route path="cart" element={<CartPage />} />
      <Route path="checkout" element={<CheckoutPage />} />
      <Route path="order-success" element={<OrderSuccessPage />} />
      <Route path="bill-generation" element={<BillGenerationPage />} />

      {/* Kitchen Management */}
      <Route
        path="kitchen"
        element={
          <AdminDashboardLayout>
            <KitchenAdminPage />
          </AdminDashboardLayout>
        }
      />

      {/* Default redirect */}
      <Route path="" element={<Navigate to="home" replace />} />
    </Routes>
  );
};

export default CaptainRoutes;
