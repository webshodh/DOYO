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
  AddCategory,
  AddHotel,
  ViewHotel,
  UpdateHotel,
  AddHotelInfo,
  SuperAdminDashboard,
  CartDetails,
  OrderDashboard,
  OrderPage,
  AddMenu,
  Customers,
  NotFound,
  ViewMenu,
  AdminDashboard,
  StaffDashboard,
  LoginPage,
  SignupPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  AdminList,
  MenuDashboard,
} from "./Pages";

// Importing other components
import { Layout } from "./Atoms";
import { ErrorBoundary } from "./components";

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          {/* Routes without Layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/" element={<Navigate to="/login" />} />
          {/* <Route path="*" element={<NotFound />} /> */}
          <Route path="/viewMenu/:hotelId" element={<Home />} />
          <Route path="/:hotelName/orders/details" element={<OrderPage />} />
          <Route path="/:hotelName/cart-details" element={<CartDetails />} />
        </Routes>

        {/* Routes with Layout */}
        <Layout>
          <Routes>
            <Route
              path="/super-admin/dashboard"
              element={<SuperAdminDashboard />}
            />
            <Route
              path="/super-admin/dashboard/admin-list"
              element={<AdminList />}
            />
            <Route path="/hotels/add" element={<AddHotel />} />
            <Route path="/hotels/:hotelId" element={<ViewHotel />} />
            <Route path="/hotels/:hotelId/edit" element={<UpdateHotel />} />
            <Route path="/hotels/:hotelId/info" element={<AddHotelInfo />} />
            <Route path="/categories/add/:hotelId" element={<AddCategory />} />
            <Route path="/:hotelId/menus/add" element={<AddMenu />} />
            <Route path="/menus/view/:hotelId" element={<ViewMenu />} />
            <Route path="/:hotelName/admin/menu" element={<MenuDashboard />} />
            <Route path="/:hotelName/admin" element={<AdminDashboard />} />
            <Route path="/:hotelName/admin/customers" element={<Customers />} />
            <Route
              path="/:hotelName/admin/staffDashboard"
              element={<StaffDashboard />}
            />
            <Route
              path="/:hotelName/order-dashboard"
              element={<OrderDashboard />}
            />
          </Routes>
        </Layout>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
