// import React from "react";
// import {
//   BrowserRouter as Router,
//   Route,
//   Routes,
//   Navigate,
// } from "react-router-dom";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "react-toastify/dist/ReactToastify.css";

// // Importing all required components from the "./Pages" directory
// import {
//   Home,
//   AddHotel,
//   SuperAdminDashboard,
//   AdminDashboard,
//   LoginPage,
//   SignupPage,
//   ForgotPasswordPage,
//   ResetPasswordPage,
//   AdminList,
//   MenuDashboard,
//   ThankYouScreen,
//   WelcomeScreen,
// } from "./Pages";

// // Importing other components
// import { Layout } from "./Atoms";
// import { ErrorBoundary } from "./components";

// import Offers from "Pages/User/Offers";
// import AddCategory from "Pages/Admin Dashboard/AddCategory";
// import CategoryManager from "Pages/Admin Dashboard/AddMainCategory";
// import AddMenu from "Pages/Admin Dashboard/AddMenu";
// import HotelSplashScreen from "Pages/SplashScreen";

// // Protected Route Components
// const ProtectedRoute = ({ children, allowedRoles, userRole }) => {
//   if (!userRole) {
//     return <Navigate to="/admin/login" replace />;
//   }

//   if (!allowedRoles.includes(userRole)) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return children;
// };

// // Get user role from localStorage, context, or wherever you store auth state
// const getUserRole = () => {
//   // Replace this with your actual authentication logic
//   return localStorage.getItem('userRole'); // 'superadmin', 'admin', or null
// };

// function App() {
//   const userRole = getUserRole();

//   return (
//     <Router>
//       <ErrorBoundary>
//         <Routes>
//           {/* Public Login Routes */}
//           <Route path="/admin/login" element={<LoginPage />} />
//           <Route path="/super-admin/login" element={<LoginPage />} />
//           <Route path="/super-admin/signup" element={<SignupPage />} />
//           <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
//           <Route path="/admin/reset-password" element={<ResetPasswordPage />} />
// <Route path="/admin/hotel-select" element={<HotelSplashScreen />} />

//           {/* Public User Routes (accessible to anyone) */}
//           <Route path="/viewMenu/:hotelName/home" element={<Home />} />
//           <Route path="/viewMenu/:hotelName/review" element={<div>Review Page</div>} />
//           <Route path="/viewMenu/:hotelName/thank-you" element={<ThankYouScreen />} />
//           <Route path="/viewMenu/:hotelName/offers" element={<Offers />} />

//           {/* Protected Super Admin Routes */}
//           <Route path="/super-admin/dashboard" element={<Layout><SuperAdminDashboard /></Layout>} />
//           <Route path="/super-admin/dashboard/admin-list" element={<Layout><AdminList /></Layout>} />
//           <Route path="/super-admin/dashboard/add-hotel" element={<Layout><AddHotel /></Layout>} />

//           {/* Protected Admin Routes */}
//           <Route path="/:hotelName/admin/admin-dashboard" element={<Layout><AdminDashboard /></Layout>} />
// <Route path="/:hotelName/admin/add-category" element={<Layout><AddCategory /></Layout>} />
// <Route path="/:hotelName/admin/add-special-category" element={<Layout><CategoryManager /></Layout>} />
// <Route path="/:hotelName/admin/add-menu" element={<Layout><AddMenu /></Layout>} />

//           {/* Redirect root to login */}
//           <Route path="/" element={<Navigate to="/admin/login" replace />} />

//           {/* Unauthorized page */}
//           <Route path="/unauthorized" element={<div className="container mt-5"><h2>Unauthorized Access</h2><p>You don't have permission to access this page.</p></div>} />
//         </Routes>
//       </ErrorBoundary>
//     </Router>
//   );
// }

// export default App;

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
import { HotelProvider } from "./Context/HotelContext"; // Your existing context
import { HotelSelectionProvider } from "./Context/HotelSelectionContext";

// Components
import LoginPage from "./Pages/Login/LoginPage";
import HotelSplashScreen from "./Pages/SplashScreen";
import AdminDashboard from "./Pages/Admin Dashboard/AdminDashboard";
import Profile from "./components/ProfileComponent";
import Sidebar from "./components/SideBarComponent";
import Navbar from "./components/NavBarComponent";
import AddCategory from "Pages/Admin Dashboard/AddCategory";
import CategoryManager from "Pages/Admin Dashboard/AddMainCategory";
import AddMenu from "Pages/Admin Dashboard/AddMenu";
import { SuperAdminDashboard } from "Pages";

// Protected Route Component
const ProtectedRoute = ({
  children,
  requiresAuth = true,
  redirectTo = "/login",
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (requiresAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!requiresAuth && user) {
    return <Navigate to="/admin/hotel-select" replace />;
  }

  return children;
};

const SettingsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
    <p className="text-gray-600 mt-2">Manage your hotel settings here.</p>
  </div>
);

// Dashboard Layout Component
const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Navbar onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};



function App() {
  return (
    <Router>
      <HotelProvider>
        <div className="App">
          <Routes>
            {/* Public Routes - No HotelSelectionProvider needed */}
            <Route
              path="/login"
              element={
                <ProtectedRoute requiresAuth={false}>
                  <LoginPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - Wrapped with HotelSelectionProvider */}
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

            {/* Super Admin Routes - No HotelSelectionProvider needed */}
            <Route
              path="/super-admin/dashboard"
              element={
                <ProtectedRoute>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Hotel-specific Admin Routes - All wrapped with HotelSelectionProvider */}
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
                          <DashboardLayout>
                            <AddCategory />
                          </DashboardLayout>
                        }
                      />
                      <Route
                        path="add-special-category"
                        element={
                          <DashboardLayout>
                            <CategoryManager />
                          </DashboardLayout>
                        }
                      />
                      <Route
                        path="add-menu"
                        element={
                          <DashboardLayout>
                            <AddMenu />
                          </DashboardLayout>
                        }
                      />

                      <Route
                        path="settings"
                        element={
                          <DashboardLayout>
                            <SettingsPage />
                          </DashboardLayout>
                        }
                      />
                      {/* Redirect to dashboard if no specific route matches */}
                      <Route
                        path=""
                        element={<Navigate to="dashboard" replace />}
                      />
                    </Routes>
                  </HotelSelectionProvider>
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
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

export default App;
