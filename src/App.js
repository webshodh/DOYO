import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";

// Context Providers
import { HotelProvider } from "./Context/HotelContext";
import { HotelSelectionProvider } from "./Context/HotelSelectionContext";

// Components
import LoginPage from "./Pages/Login/LoginPage";
import HotelSplashScreen from "./Pages/SplashScreen";
import AdminDashboard from "./Pages/Admin Dashboard/AdminDashboard";
import Profile from "./components/ProfileComponent";
import AddCategory from "Pages/Admin Dashboard/AddCategory";
import CategoryManager from "Pages/Admin Dashboard/AddMainCategory";
import AddMenu from "Pages/Admin Dashboard/AddMenu";
import {
  AddHotel,
  AdminList,
  Home,
  NotAuthorized,
  NotFound,
  SignupPage,
  SuperAdminDashboard,
} from "Pages";
import AddOffers from "Pages/Admin Dashboard/AddOffers";
import Offers from "Pages/User/Offers";
import { Spinner } from "Atoms";
import SettingsPage from "Pages/Admin Dashboard/Setting";
import AdminDashboardLayout from "./Pages/AdminDashboardLayout";
import SuperAdminDashboardLayout from "Pages/SuperAdminDashboardLayout";
import AddOption from "Pages/Admin Dashboard/AddOptions";
import SuperAdminLoginPage from "Pages/Login/SuperAdminLoginPage";
import BulkMenuUpload from "Pages/Admin Dashboard/BulkUpload";

// Super Admin credentials (same as in login page)
const SUPER_ADMIN_EMAIL = "webshodhteam@gmail.com";

// Protected Route Component for Regular Admin
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

  if (loading) {
    return <Spinner />;
  }

  if (requiresAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!requiresAuth && user) {
    // If user is super admin, redirect to super admin dashboard
    if (user.email === SUPER_ADMIN_EMAIL) {
      return <Navigate to="/super-admin/dashboard" replace />;
    }
    // Regular admin goes to hotel selection
    return <Navigate to="/admin/hotel-select" replace />;
  }

  // Block super admin from accessing admin routes
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

  if (loading) {
    return <Spinner />;
  }

  if (requiresAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!requiresAuth && user) {
    // If already logged in, redirect based on user type
    if (user.email === SUPER_ADMIN_EMAIL) {
      return <Navigate to="/super-admin/dashboard" replace />;
    } else {
      return <Navigate to="/super-admin/login" replace />;
    }
  }

  // Block regular admin from accessing super admin routes
  if (user && user.email !== SUPER_ADMIN_EMAIL) {
    return <Navigate to="/not-authorized" replace />;
  }

  return children;
};

// Public Route Component (no auth required)
const PublicRoute = ({ children }) => {
  return children;
};

function App() {
  return (
    <Router>
      <HotelProvider>
        <div className="App">
          <Routes>
            {/* Public Routes - No authentication required */}
            <Route
              path="/viewMenu/:hotelName/home"
              element={
                <PublicRoute>
                  <Home />
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

            {/* Admin Login Routes */}
            <Route
              path="/admin/login"
              element={
                <ProtectedAdminRoute requiresAuth={false}>
                  <LoginPage />
                </ProtectedAdminRoute>
              }
            />

            {/* Super Admin Login Routes */}
            <Route
              path="/super-admin/login"
              element={
                <ProtectedSuperAdminRoute requiresAuth={false}>
                  <SuperAdminLoginPage />
                </ProtectedSuperAdminRoute>
              }
            />

            <Route
              path="/super-admin/sign-up"
              element={
                <ProtectedSuperAdminRoute requiresAuth={false}>
                  <SignupPage />
                </ProtectedSuperAdminRoute>
              }
            />

            {/* Admin Hotel Selection (with splash screen) */}
            <Route
              path="/admin/hotel-select"
              element={
                <ProtectedAdminRoute>
                  <HotelSelectionProvider>
                    <HotelSplashScreen />
                  </HotelSelectionProvider>
                </ProtectedAdminRoute>
              }
            />

            {/* Super Admin Routes - NO HotelSelectionProvider, NO Splash Screen */}
            <Route
              path="/super-admin/*"
              element={
                <ProtectedSuperAdminRoute>
                  <HotelSelectionProvider>
                    <Routes>
                      <Route
                        path="dashboard"
                        element={
                          <SuperAdminDashboardLayout>
                            <SuperAdminDashboard />
                          </SuperAdminDashboardLayout>
                        }
                      />
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
                      <Route
                        path="settings"
                        element={
                          <SuperAdminDashboardLayout>
                            <SettingsPage />
                          </SuperAdminDashboardLayout>
                        }
                      />
                      {/* Redirect to dashboard if no specific route matches */}
                      <Route
                        path=""
                        element={<Navigate to="dashboard" replace />}
                      />
                    </Routes>
                  </HotelSelectionProvider>
                </ProtectedSuperAdminRoute>
              }
            />

            {/* Hotel-specific Admin Routes - WITH HotelSelectionProvider */}
            <Route
              path="/:hotelName/admin/*"
              element={
                <ProtectedAdminRoute>
                  <HotelSelectionProvider>
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
                        path="settings"
                        element={
                          <AdminDashboardLayout>
                            <SettingsPage />
                          </AdminDashboardLayout>
                        }
                      />
                      {/* Redirect to dashboard if no specific route matches */}
                      <Route
                        path=""
                        element={<Navigate to="dashboard" replace />}
                      />
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

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    // Not authenticated, redirect to admin login
    return <Navigate to="/admin/login" replace />;
  }

  // Authenticated user, redirect based on role
  if (user.email === SUPER_ADMIN_EMAIL) {
    return <Navigate to="/super-admin/dashboard" replace />;
  } else {
    return <Navigate to="/super-admin/login" replace />;
  }
};

export default App;
