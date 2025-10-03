import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ToastContainer } from "react-toastify";

// Context Providers
import { HotelProvider } from "./context/HotelContext";
import { HotelSelectionProvider } from "./context/HotelSelectionContext";

// Components
import LoginPage from "./Pages/Login/LoginPage";
import SplashScreen from "./Pages/Screens/SplashScreen";
import AdminDashboard from "./Pages/Admin Dashboard/AdminDashboard";
import Profile from "./organisms/ProfileComponent";
import AddCategory from "./Pages/Admin Dashboard/AddCategory";
import CategoryManager from "./Pages/Admin Dashboard/AddMainCategory";
import AddMenu from "./Pages/Admin Dashboard/AddMenu";
import {
  AddHotel,
  Home,
  NotAuthorized,
  NotFound,
  SuperAdminDashboard,
} from "./Pages";
import AddOffers from "./Pages/Admin Dashboard/AddOffers";
import Offers from "./Pages/User/Offers";
import LoadingSpinner from "./atoms/LoadingSpinner";
import AdminLayout from "./layout/AdminDashboardLayout";
import SuperAdminLayout from "./layout/SuperAdminDashboardLayout";
import CaptainMenuPage from "./Pages/Captain/CaptainMenuPage";
import CheckoutPage from "./Pages/Captain/CheckoutPage";
import KitchenAdminPage from "./Pages/Admin Dashboard/KitchenDahboard";
import AddCaptain from "Pages/Admin Dashboard/AddCaptain";
import CaptainDashboardLayout from "layout/CaptainDashboardLayout";
import CaptainDashboard from "Pages/Captain/CaptainDashboard ";
import CaptainLogin from "Pages/Login/CaptainLogin";
import MyOrdersPage from "Pages/Captain/MyOrderPage";
import OrderDashboard from "Pages/Admin Dashboard/OrderDashboard";
import ViewHotel from "Pages/SuperAdminDashboard/ViewHotel";
import AddHotelPage from "Pages/SuperAdminDashboard/AddHotel";
import ViewAdmin from "Pages/SuperAdminDashboard/ViewAdmin";
import ViewSubscriptionPlan from "Pages/SuperAdminDashboard/ViewSubscriptionPlan";
import CustomersPage from "Pages/Admin Dashboard/CustomerDahboard";
import DOYOLandingPage from "Pages/LandingPage";
import POSDashboard from "Pages/Admin Dashboard/POSDashboard";

// Constants
const SUPER_ADMIN_EMAIL = "webshodhteam@gmail.com";

// Protected Route Component for Admin
const ProtectedAdminRoute = ({
  children,
  requiresAuth = true,
  redirectTo = "/admin/login",
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [auth]);

  if (loading) return <LoadingSpinner />;

  if (requiresAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!requiresAuth && user) {
    if (user.email === SUPER_ADMIN_EMAIL) {
      return <Navigate to="/super-admin/dashboard" replace />;
    }
    return <Navigate to="/admin/hotel-select" replace />;
  }

  if (user && user.email === SUPER_ADMIN_EMAIL) {
    return <Navigate to="/super-admin/dashboard" replace />;
  }

  return children;
};

// Protected Route Component for Super Admin
const ProtectedSuperAdminRoute = ({
  children,
  requiresAuth = true,
  redirectTo = "/super-admin/login",
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [auth]);

  if (loading) return <LoadingSpinner />;

  if (requiresAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!requiresAuth && user) {
    if (user.email === SUPER_ADMIN_EMAIL) {
      return <Navigate to="/super-admin/dashboard" replace />;
    }
    return <Navigate to="/admin/hotel-select" replace />;
  }

  if (user && user.email !== SUPER_ADMIN_EMAIL) {
    return <Navigate to="/not-authorized" replace />;
  }

  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  return children;
};

function App() {
  return (
    <Router>
      <HotelProvider>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <DOYOLandingPage />
                </PublicRoute>
              }
            />
            <Route
              path="/home"
              element={
                <PublicRoute>
                  <DOYOLandingPage />
                </PublicRoute>
              }
            />
            <Route
              path="/viewMenu/:hotelName/home"
              element={
                <PublicRoute>
                  <Home />
                </PublicRoute>
              }
            />
            <Route
              path="/viewMenu/:hotelName/captain/login"
              element={
                <PublicRoute>
                  <CaptainLogin />
                </PublicRoute>
              }
            />
            <Route
              path="/viewMenu/:hotelName/offers"
              element={
                <PublicRoute>
                  <Offers />
                </PublicRoute>
              }
            />

            {/* Admin Login */}
            <Route
              path="/admin/login"
              element={
                <ProtectedAdminRoute requiresAuth={false}>
                  <LoginPage />
                </ProtectedAdminRoute>
              }
            />

            {/* Admin Hotel Selection */}
            <Route
              path="/admin/hotel-select"
              element={
                <ProtectedAdminRoute>
                  <HotelSelectionProvider>
                    <SplashScreen />
                  </HotelSelectionProvider>
                </ProtectedAdminRoute>
              }
            />

            {/* Super Admin Login */}
            <Route
              path="/super-admin/login"
              element={
                <ProtectedSuperAdminRoute requiresAuth={false}>
                  <LoginPage />
                </ProtectedSuperAdminRoute>
              }
            />

            {/* Super Admin Routes */}
            <Route
              path="/super-admin/*"
              element={
                <ProtectedSuperAdminRoute>
                  <HotelSelectionProvider>
                    <Routes>
                      <Route
                        path="dashboard"
                        element={<SuperAdminDashboard />}
                      />
                      <Route
                        path="profile"
                        element={
                          <SuperAdminLayout>
                            <Profile />
                          </SuperAdminLayout>
                        }
                      />
                      <Route
                        path="add-hotel"
                        element={
                          <SuperAdminLayout>
                            <AddHotelPage />
                          </SuperAdminLayout>
                        }
                      />
                      <Route
                        path="view-hotel"
                        element={
                          <SuperAdminLayout>
                            <ViewHotel />
                          </SuperAdminLayout>
                        }
                      />

                      <Route
                        path="add-subscription-plan"
                        element={
                          <SuperAdminLayout>
                            <ViewSubscriptionPlan />
                          </SuperAdminLayout>
                        }
                      />

                      <Route
                        path="add-admin"
                        element={
                          <SuperAdminLayout>
                            <ViewAdmin />
                          </SuperAdminLayout>
                        }
                      />

                      <Route
                        path=""
                        element={<Navigate to="dashboard" replace />}
                      />
                    </Routes>
                  </HotelSelectionProvider>
                </ProtectedSuperAdminRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/:hotelName/admin/*"
              element={
                <ProtectedAdminRoute>
                  <HotelSelectionProvider>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route
                        path="pos-dashboard"
                        element={<AdminLayout><POSDashboard /></AdminLayout>}
                      />
                      <Route
                        path="order-dashboard"
                        element={<OrderDashboard />}
                      />

                      <Route
                        path="customer-dashboard"
                        element={
                          <AdminLayout>
                            <CustomersPage />
                          </AdminLayout>
                        }
                      />

                      <Route
                        path="profile"
                        element={
                          <AdminLayout>
                            <Profile />
                          </AdminLayout>
                        }
                      />
                      <Route
                        path="add-category"
                        element={
                          <AdminLayout>
                            <AddCategory />
                          </AdminLayout>
                        }
                      />
                      <Route
                        path="add-special-category"
                        element={
                          <AdminLayout>
                            <CategoryManager />
                          </AdminLayout>
                        }
                      />

                      <Route
                        path="add-menu"
                        element={
                          <AdminLayout>
                            <AddMenu />
                          </AdminLayout>
                        }
                      />

                      <Route
                        path="add-offers"
                        element={
                          <AdminLayout>
                            <AddOffers />
                          </AdminLayout>
                        }
                      />

                      <Route
                        path="add-captain"
                        element={
                          <AdminLayout>
                            <AddCaptain />
                          </AdminLayout>
                        }
                      />

                      <Route
                        path="kitchen"
                        element={
                          <AdminLayout>
                            <KitchenAdminPage />
                          </AdminLayout>
                        }
                      />
                      <Route
                        path="settings"
                        element={
                          <AdminLayout>
                            <Profile />
                          </AdminLayout>
                        }
                      />
                      <Route
                        path=""
                        element={<Navigate to="dashboard" replace />}
                      />
                    </Routes>
                  </HotelSelectionProvider>
                </ProtectedAdminRoute>
              }
            />

            {/* Captain Routes */}
            <Route
              path="/viewMenu/:hotelName/captain/*"
              element={
                <ProtectedAdminRoute>
                  <HotelSelectionProvider>
                    <Routes>
                      <Route
                        path="dashboard"
                        element={
                          <CaptainDashboardLayout>
                            <CaptainDashboard />
                          </CaptainDashboardLayout>
                        }
                      />
                      <Route
                        path="home"
                        element={
                          <CaptainDashboardLayout>
                            <CaptainMenuPage />
                          </CaptainDashboardLayout>
                        }
                      />
                      <Route
                        path="checkout"
                        element={
                          <CaptainDashboardLayout>
                            <CheckoutPage />
                          </CaptainDashboardLayout>
                        }
                      />
                      <Route
                        path="kitchen"
                        element={
                          <CaptainDashboardLayout>
                            <KitchenAdminPage />
                          </CaptainDashboardLayout>
                        }
                      />
                      <Route
                        path="my-orders"
                        element={
                          <CaptainDashboardLayout>
                            <MyOrdersPage />
                          </CaptainDashboardLayout>
                        }
                      />

                      <Route
                        path="settings"
                        element={
                          <AdminLayout>
                            <Profile />
                          </AdminLayout>
                        }
                      />
                      <Route path="" element={<Navigate to="home" replace />} />
                    </Routes>
                  </HotelSelectionProvider>
                </ProtectedAdminRoute>
              }
            />

            {/* Default redirect based on authentication */}
            <Route path="/" element={<AuthBasedRedirect />} />

            {/* Utility Pages */}
            <Route path="/not-authorized" element={<NotAuthorized />} />
            <Route path="/not-found" element={<NotFound />} />

            {/* Catch-all -> NotFound */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Toast Container */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </HotelProvider>
    </Router>
  );
}

// Component to handle root redirect based on authentication status
const AuthBasedRedirect = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [auth]);

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.email === SUPER_ADMIN_EMAIL) {
    return <Navigate to="/super-admin/dashboard" replace />;
  } else {
    return <Navigate to="/admin/hotel-select" replace />;
  }
};

export default App;
