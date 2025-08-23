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
  AdminDashboard,
  LoginPage,
  SignupPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  AdminList,
  MenuDashboard,
  ThankYouScreen,
  WelcomeScreen,
} from "./Pages";

// Importing other components
import { Layout } from "./Atoms";
import { ErrorBoundary } from "./components";



import Offers from "Pages/User/Offers";

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
          
          <Route path="/" element={<Navigate to="/login" />} />

          {/* User Routes */}

          
          <Route path="/viewMenu/:hotelName/home" element={<Home />} />
          <Route path="/:hotelName/feedback" element={""} />
          <Route path="/:hotelName/thank-you" element={<ThankYouScreen />} />
          <Route path="/viewMenu/:hotelName/offers" element={<Offers />} />
        </Routes>

        {/* {isAdmin && (
          <>
            <Layout> */}
              <Routes>
                {/* Super Admin Routes */}
                <Route
                  path="/superadmin/dashboard"
                  element={<SuperAdminDashboard />}
                />
                <Route
                  path="/super-admin/dashboard/admin-list"
                  element={<AdminList />}
                />
                <Route path="/hotels/admin/add-hotel" element={<AddHotel />} />

                {/* Admin Routes */}

                <Route
                  path="/:hotelName/admin/admin-dashboard"
                  element={<AdminDashboard />}
                />
                <Route
                  path="/:hotelName/admin/menu/menu-dashboard"
                  element={<MenuDashboard />}
                />
              </Routes>
            {/* </Layout>
          </> 
        )}*/}
      </ErrorBoundary>
    </Router>
  );
}

export default App;

// import React, { useState, useEffect } from "react";
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
// import { AuthProvider, useAuthContext } from "./Context/AuthContext";

// import UserLogin from "Pages/Login/UserLogin";
// import Offers from "Pages/User/Offers";

// // Protected Route Component
// const ProtectedRoute = ({ children, requiredRole, hotelId }) => {
//   const { userRole, isSuperAdmin, isAdmin, canAccessHotel, loading } = useAuthContext();
  
//   if (loading) {
//     return <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
//       <div className="spinner-border" role="status">
//         <span className="visually-hidden">Loading...</span>
//       </div>
//     </div>;
//   }

//   // Check super admin access
//   if (requiredRole === "superadmin" && !isSuperAdmin()) {
//     return <Navigate to="/login" replace />;
//   }
  
//   // Check admin access
//   if (requiredRole === "admin" && !isAdmin()) {
//     return <Navigate to="/login" replace />;
//   }
  
//   // Check hotel-specific access for admins
//   if (requiredRole === "admin" && hotelId && !canAccessHotel(hotelId)) {
//     return <Navigate to="/login" replace />;
//   }
  
//   return children;
// };

// const AppContent = () => {
//   const { currentUser, userRole, isSuperAdmin, isAdmin, loading } = useAuthContext();
//   const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setShowWelcomeScreen(false);
//     }, 3000);
//     return () => clearTimeout(timer);
//   }, []);

//   if (loading) {
//     return (
//       <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
//         <div className="spinner-border" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <Router>
//       <ErrorBoundary>
//         <Routes>
//           {/* Public Routes */}
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/signup" element={<SignupPage />} />
//           <Route path="/forgot-password" element={<ForgotPasswordPage />} />
//           <Route path="/reset-password" element={<ResetPasswordPage />} />
          
//           {/* User Login Routes */}
//           {/* <Route
//             path="/viewMenu/:hotelName/login/user-login"
//             element={<UserLogin />}
//           />
//           <Route path="/viewMenu/:hotelName/login" element={<UserLogin />} />
//           <Route path="/viewMenu/:hotelName/welcome" element={<UserLogin />} /> */}
          
//           {/* User Routes (No authentication required for customers) */}
//           <Route path="/viewMenu/:hotelName/home" element={<Home />} />
//           <Route path="/:hotelName/feedback" element={""} />
//           <Route path="/:hotelName/thank-you" element={<ThankYouScreen />} />
//           <Route path="/viewMenu/:hotelName/offers" element={<Offers />} />
          
//           {/* Default redirect based on user role */}
//           <Route path="/" element={
//             currentUser ? (
//               isSuperAdmin() ? <Navigate to="/super-admin/dashboard" /> :
//               isAdmin() ? <Navigate to="/admin/admin-dashboard" /> :
//               <Navigate to="/login" />
//             ) : (
//               <Navigate to="/login" />
//             )
//           } />
//         </Routes>

//         {/* Admin Routes - Only visible to authenticated admins and super admins */}
//         {currentUser && isAdmin() && (
//           <Layout>
//             <Routes>
//               {/* Super Admin Routes */}
//               <Route
//                 path="/super-admin/dashboard"
//                 element={
//                   <ProtectedRoute requiredRole="superadmin">
//                     <SuperAdminDashboard />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route
//                 path="/super-admin/dashboard/admin-list"
//                 element={
//                   <ProtectedRoute requiredRole="superadmin">
//                     <AdminList />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route
//                 path="/hotels/admin/add-hotel"
//                 element={
//                   <ProtectedRoute requiredRole="superadmin">
//                     <AddHotel />
//                   </ProtectedRoute>
//                 }
//               />

//               {/* Admin Routes */}
//               <Route
//                 path="/admin/admin-dashboard"
//                 element={
//                   <ProtectedRoute requiredRole="admin">
//                     <AdminDashboard />
//                   </ProtectedRoute>
//                 }
//               />
              
//               {/* Hotel-specific admin routes */}
//               <Route
//                 path="/:hotelName/admin/menu/menu-dashboard"
//                 element={
//                   <ProtectedRoute 
//                     requiredRole="admin" 
//                     hotelId={window.location.pathname.split('/')[1]}
//                   >
//                     <MenuDashboard />
//                   </ProtectedRoute>
//                 }
//               />
//             </Routes>
//           </Layout>
//         )}
//       </ErrorBoundary>
//     </Router>
//   );
// };

// function App() {
//   return (
//     <AuthProvider>
//       <AppContent />
//     </AuthProvider>
//   );
// }

// export default App;