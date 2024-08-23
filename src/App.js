import React, { useState, useEffect } from "react";
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
  CartDetails,
  OrderDashboard,
  AdminDashboard,
  StaffDashboard,
  LoginPage,
  SignupPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  AdminList,
  MenuDashboard,
  TableDashboard,
  OrderBill,
  OrderHistory,
  TrackOrders,
  ThankYouScreen,
  CaptainTip,
  CustomerDashboard,
  WelcomeScreen,
  CaptainFeedBack,
  POS,
  SpecialMenuPage,
} from "./Pages";

// Importing other components
import { Layout } from "./Atoms";
import { ErrorBoundary } from "./components";
import PredictionDashboard from "./Pages/AI Prediction/PredictionDashboard";
import UserLogin from "./Pages/Login/UserLogin";
import GoogleLogin from "./Pages/Login/GoogleLogin";
import Dashboard from "Pages/Dashboard";


function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("admin")) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeScreen(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <ErrorBoundary>
       
          <Routes>
            {/* Login Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/user/login" element={<UserLogin />} />
            <Route path="/" element={<Navigate to="/login" />} />

            {/* User Routes */}
           
            <Route path="/viewMenu/:hotelName/welcome" element={<WelcomeScreen />} />
            <Route path="/viewMenu/:hotelName" element={showWelcomeScreen ? <WelcomeScreen /> : <GoogleLogin />} />
            <Route path="/viewMenu/:hotelName/home" element={ <Home />} />
            <Route path="/:hotelName/feedback" element={''} />
            <Route path="/:hotelName/cart/cart-details" element={<CartDetails />} />
            <Route path="/:hotelName/orders/payment/menu-bill" element={<OrderBill />} />
            <Route path="/:hotelName/orders/details/thank-you" element={<ThankYouScreen />} />
            <Route path="/:hotelName/orders/track-orders" element={<TrackOrders />} />
            <Route path="/:hotelName/orders/captain-tip" element={<CaptainTip />} />
            <Route path="/:hotelName/orders/captain-feedback" element={<CaptainFeedBack />} />
            <Route path="/:hotelName/orders/order-history" element={<OrderHistory />} />
            <Route path="/viewMenu/:hotelName/home/specialMenu" element={<SpecialMenuPage />} />
          </Routes>
        
        {isAdmin && (
          <Layout>
            <Routes>
              {/* Super Admin Routes */}
              <Route path="/viewMenu/:hotelName/admin/POS" element={ <POS />} />
              <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
              <Route path="/super-admin/dashboard/admin-list" element={<AdminList />} />
              <Route path="/hotels/admin/add-hotel" element={<AddHotel />} />

              {/* Admin Routes */}
              {/* <Route path="/admin/admin-dashboard" element={<Dashboard />} /> */}
              <Route path="/:hotelName/admin/admin-dashboard" element={<Dashboard />} />
              <Route path="/:hotelName/admin/menu/menu-dashboard" element={<MenuDashboard />} />
              <Route path="/:hotelName/admin/table/table-dashboard" element={<TableDashboard />} />
              <Route path="/:hotelName/admin/customers/customer-dashboard" element={<CustomerDashboard />} />
              <Route path="/:hotelName/admin/staff/staff-dashboard" element={<StaffDashboard />} />
              <Route path="/:hotelName/admin/order/order-dashboard" element={<OrderDashboard />} />
              <Route path="/:hotelName/admin/forecasting/forecasting-dashboard" element={<PredictionDashboard />} />
            </Routes>
          </Layout>
        )}
      </ErrorBoundary>
    </Router>
  );
}

export default App;
