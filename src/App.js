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

// Protected Route Component
const ProtectedRoute = ({
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
    <Spinner />;
  }

  if (requiresAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!requiresAuth && user) {
    return <Navigate to="/admin/hotel-select" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <HotelProvider>
        <div className="App">
          <Routes>
            {/* Public Routes - No HotelSelectionProvider needed */}
            <Route
              path="/admin/login"
              element={
                <ProtectedRoute requiresAuth={false}>
                  <LoginPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/sign-up"
              element={
                <ProtectedRoute requiresAuth={false}>
                  <SignupPage />
                </ProtectedRoute>
              }
            />
            <Route path="/viewMenu/:hotelName/home" element={<Home />} />
            <Route path="/viewMenu/:hotelName/offers" element={<Offers />} />
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
                  <HotelSelectionProvider>
                    <SuperAdminDashboard />
                  </HotelSelectionProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/*"
              element={
                <ProtectedRoute>
                  {/* <HotelSelectionProvider> */}
                  <Routes>
                    <Route path="dashboard" element={<SuperAdminDashboard />} />
                    <Route path="profile" element={<Profile />} />
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
                  {/* </HotelSelectionProvider> */}
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
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/admin/login" replace />} />

            {/* Catch-all route */}
            {/* <Route path="*" element={<Navigate to="/admin/login" replace />} /> */}

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

export default App;

// import React from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import { ToastContainer } from "react-toastify";
// import { HotelProvider } from "./Context/HotelContext";

// import PublicRoutes from "./Routes/PublicRoutes";
// import AdminRoutes from "./Routes/AdminRoutes";
// import SuperAdminRoutes from "./Routes/SuperAdminRoutes";
// import NotAuthorized from "./Pages/Screens/NotAuthorized";
// import NotFound from "./Pages/Screens/NotFound";

// function App() {
//   return (
//     <Router>
//       <HotelProvider>
//         <div className="App">
//           <Routes>
//             {/* Public */}
//             <Route path="/*" element={<PublicRoutes />} />

//             {/* Admin */}
//             <Route path="/admin/*" element={<AdminRoutes />} />

//             {/* Super Admin */}
//             <Route path="/super-admin/*" element={<SuperAdminRoutes />} />

//             {/* Utility Pages */}
//             <Route path="/not-authorized" element={<NotAuthorized />} />
//             <Route path="/not-found" element={<NotFound />} />

//             {/* Default redirect */}
//             <Route path="/" element={<Navigate to="/admin/login" replace />} />

//             {/* Catch-all */}
//             <Route path="*" element={<NotFound />} />
//           </Routes>

//           <ToastContainer position="top-right" autoClose={5000} theme="light" />
//         </div>
//       </HotelProvider>
//     </Router>
//   );
// }

// export default App;
