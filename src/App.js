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
  UserSignupPage,
  UserLoginPage,
  OrderHistory,
  TrackOrders,
  ThankYouScreen,
  CaptainTip,
  CustomerDashboard,
  WelcomeScreen,
  CaptainFeedBack,
} from "./Pages";

// Importing other components
import { Layout } from "./Atoms";
import { ErrorBoundary } from "./components";
import MobileLoginPage from "./Pages/Login/MobileLoginPage";
import UserLogin from "./Pages/Login/UserLogin";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);

  useEffect(() => {
    // Check if 'admin' is present in the URL pathname
    const path = window.location.pathname;
    if (path.includes("admin")) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    // Set a timer to hide the WelcomeScreen after 5 seconds
    const timer = setTimeout(() => {
      setShowWelcomeScreen(false);
    }, 3000);

    // Clear the timer if the component is unmounted before the timeout
    return () => clearTimeout(timer);
  }, []);
  return (
    <Router>
      <ErrorBoundary>
        {!isAdmin && (
          <Routes>
            {/* Routes without Layout */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            {/* user login */}
            <Route path="/user/signup" element={<UserSignupPage />} />
            <Route path="/user/login" element={<UserLoginPage />} />

            <Route path="/user/login/mobile" element={<MobileLoginPage />} />

            <Route path="/" element={<Navigate to="/login" />} />
            <Route
              path="/viewMenu/:hotelName/welcome"
              element={<WelcomeScreen />}
            />
            <Route
              path="/viewMenu/:hotelName"
              element={showWelcomeScreen ? <WelcomeScreen /> : <Home />}
            />
            <Route
              path="/:hotelName/feedback"
              element={<Navigate to="/login" />}
            />

            {/*Orders */}
            <Route
              path="/:hotelName/cart/cart-details"
              element={<CartDetails />}
            />
            <Route
              path="/:hotelName/orders/payment/menu-bill"
              element={<OrderBill />}
            />
            <Route
              path="/:hotelName/orders/details/thank-you"
              element={<ThankYouScreen />}
            />
            <Route
              path="/:hotelName/orders/track-orders"
              element={<TrackOrders />}
            />
            <Route
              path="/:hotelName/orders/captain-tip"
              element={<CaptainTip />}
            />
            <Route
              path="/:hotelName/orders/captain-feedback"
              element={<CaptainFeedBack />}
            />
            <Route
              path="/:hotelName/orders/order-history"
              element={<OrderHistory />}
            />
          </Routes>
        )}
        {/* Routes that require Layout */}
        {isAdmin && (
          <Layout>
            <Routes>
              <Route>
                {/*Super Admin */}
                <Route
                  path="/super-admin/dashboard"
                  element={<SuperAdminDashboard />}
                />
                <Route
                  path="/super-admin/dashboard/admin-list"
                  element={<AdminList />}
                />

                {/* Hotels */}
                <Route path="/hotels/admin/add-hotel" element={<AddHotel />} />

                {/* Dashboards */}
                <Route
                  path="/:hotelName/admin/admin-dashboard"
                  element={<AdminDashboard />}
                />
                <Route
                  path="/:hotelName/admin/menu/menu-dashboard"
                  element={<MenuDashboard />}
                />
                <Route
                  path="/:hotelName/admin/table/table-dashboard"
                  element={<TableDashboard />}
                />
                <Route
                  path="/:hotelName/admin/customers/customer-dashboard"
                  element={<CustomerDashboard />}
                />
                <Route
                  path="/:hotelName/admin/staff/staff-dashboard"
                  element={<StaffDashboard />}
                />
                <Route
                  path="/:hotelName/admin/order/order-dashboard"
                  element={<OrderDashboard />}
                />
              </Route>
            </Routes>
          </Layout>
        )}
      </ErrorBoundary>
    </Router>
  );
}

export default App;
