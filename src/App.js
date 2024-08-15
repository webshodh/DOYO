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
  SplitBill,
  Payment,
  AddSections,
  TableDashboard,
} from "./Pages";

// Importing other components
import { Layout } from "./Atoms";
import { ErrorBoundary } from "./components";
import UserSignupPage from "./Pages/Login/UserSignupPage";
import UserLoginPage from "./Pages/Login/UserLoginPage";
import OrderDetails from "./Pages/OrderDetails";
import OrderStatus from "./Pages/OrderStatus";
import ThankYouPage from "./Pages/ThankYouPage";
import WelcomePage from "./Pages/WelcomePage";
import RestaurantRating from "./Pages/RestaurantRating";
import TipEntry from "./Pages/TipEntry";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if 'admin' is present in the URL pathname
    const path = window.location.pathname;
    if (path.includes("admin")) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
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
          <Route path="/user/signup" element={<UserSignupPage />} />
          <Route path="/user/login" element={<UserLoginPage />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/viewMenu/:hotelId" element={<Home />} />
          <Route path="/:hotelName/orders/details" element={<OrderStatus />} />
          <Route path="/:hotelName/cart-details" element={<CartDetails />} />
          <Route path="/viewMenu/:hotelId/welcome" element={<WelcomePage />} />
          <Route
            path="/:hotelName/cart-details/split-bill"
            element={<SplitBill />}
          />
          <Route path="/payment" element={<Payment />} />
          <Route path="/orderDetails" element={<OrderDetails />} />
          <Route path="/:hotelName/orders/details/thank-you" element={<ThankYouPage/>}/>
          <Route path="/:hotelName/hotelRating" element={<RestaurantRating/>}/>
          <Route path="/:hotelName/captionTip" element={<TipEntry/>}/>
        </Routes>)}
        {/* Routes that require Layout */}
        {isAdmin && (
          <Layout>
          <Routes>
            <Route>
              <Route
                path="/super-admin/dashboard"
                element={<SuperAdminDashboard />}
              />
              <Route
                path="/super-admin/dashboard/admin-list"
                element={<AdminList />}
              />
              <Route path="/hotels/admin/add-hotel" element={<AddHotel />} />
              <Route path="/hotels/:hotelId" element={<ViewHotel />} />
              <Route path="/hotels/:hotelId/edit" element={<UpdateHotel />} />
              <Route path="/hotels/:hotelId/info" element={<AddHotelInfo />} />
              <Route
                path="/categories/add/:hotelId"
                element={<AddCategory />}
              />
              <Route path="/:hotelId/menus/add" element={<AddMenu />} />
              <Route path="/menus/view/:hotelId" element={<ViewMenu />} />
              <Route
                path="/:hotelName/admin/menu"
                element={<MenuDashboard />}
              />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route
                path="/:hotelName/admin/table"
                element={<TableDashboard />}
              />
              <Route path="/sections/add/:hotelId" element={<AddSections />} />
              <Route
                path="/:hotelName/admin/dashboard"
                element={<AdminDashboard />}
              />
              <Route
                path="/:hotelName/admin/customers"
                element={<Customers />}
              />
              <Route
                path="/:hotelName/admin/staffDashboard"
                element={<StaffDashboard />}
              />
              <Route
                path="/:hotelName/order-dashboard"
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
