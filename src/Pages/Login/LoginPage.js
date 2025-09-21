// src/Pages/Login/LoginPage.jsx
import React, { useState, useMemo, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

// ✅ NEW: Import Firestore methods and context hooks
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../../services/firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";

// Components
import LoginHeader from "components/login-form/LoginHeader";
import LoginForm from "components/login-form/LoginForm";
import SecurityNotice from "components/login-form/LoginSecurityNotice";
import LoginRightPanel from "components/login-form/LoginRightPanel";
import LoadingSpinner from "../../atoms/LoadingSpinner";

// Constants
import { getUserType, LOGIN_CONFIGS } from "Constants/ConfigForms/loginConfigs";

const LoginPage = () => {
  // Form state
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // ✅ NEW: Additional state for enhanced functionality
  const [userProfile, setUserProfile] = useState(null);
  const [hotelInfo, setHotelInfo] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connected");

  const navigate = useNavigate();
  const location = useLocation();
  const { hotelName } = useParams();

  // ✅ NEW: Use context hooks
  const { currentUser, isAuthenticated } = useAuth();
  const { selectedHotel, selectHotelById } = useHotelContext();

  // Determine user type and get config
  const userType = useMemo(
    () => getUserType(location.pathname),
    [location.pathname]
  );
  const loginConfig = useMemo(() => LOGIN_CONFIGS[userType], [userType]);

  // Super admin credentials
  const SUPER_ADMIN_EMAIL =
    process.env.REACT_APP_SUPER_ADMIN_EMAIL || "webshodhteam@gmail.com";

  // ✅ NEW: Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user && isAuthenticated) {
          setConnectionStatus("connecting");

          // Check user role and redirect accordingly
          const navigationPath = await getNavigationPath(user);
          if (navigationPath) {
            toast.success("Already logged in, redirecting...");
            navigate(navigationPath, { replace: true });
            return;
          }
        }
        setConnectionStatus("connected");
      } catch (error) {
        console.error("Error checking auth status:", error);
        setConnectionStatus("error");
      } finally {
        setInitialLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, isAuthenticated]);

  // ✅ NEW: Load hotel information for captain/waiter login
  useEffect(() => {
    const loadHotelInfo = async () => {
      if (!hotelName || userType === "SUPER_ADMIN" || userType === "ADMIN")
        return;

      try {
        setConnectionStatus("connecting");

        // Find hotel by name
        const hotelsRef = collection(db, "hotels");
        const hotelQuery = query(hotelsRef, where("name", "==", hotelName));

        const hotelsSnapshot = await getDocs(hotelQuery);

        if (!hotelsSnapshot.empty) {
          const hotelDoc = hotelsSnapshot.docs[0];
          const hotelData = {
            id: hotelDoc.id,
            ...hotelDoc.data(),
          };
          setHotelInfo(hotelData);

          // Set hotel context
          if (!selectedHotel) {
            selectHotelById(hotelData.id);
          }
        }

        setConnectionStatus("connected");
      } catch (error) {
        console.error("Error loading hotel info:", error);
        setConnectionStatus("error");
      }
    };

    loadHotelInfo();
  }, [hotelName, userType, selectedHotel, selectHotelById]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // ✅ ENHANCED: Validation with better error messages
  const validateFields = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!emailPattern.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ ENHANCED: Get navigation path with Firestore role checking
  const getNavigationPath = async (user) => {
    try {
      // Super admin check
      if (user.email === SUPER_ADMIN_EMAIL) {
        return "/super-admin/dashboard";
      }

      // Check user role in Firestore based on current path context
      if (location.pathname.includes("super-admin")) {
        // Verify super admin status
        const adminDoc = await getDoc(doc(db, "admins", user.uid));
        if (adminDoc.exists() && adminDoc.data().role === "superadmin") {
          return "/super-admin/dashboard";
        } else {
          throw new Error("Unauthorized: Super admin access required");
        }
      } else if (
        location.pathname.includes("captain") ||
        location.pathname.includes("waiter")
      ) {
        // Check captain/waiter profile
        const captainDoc = await getDoc(doc(db, "captains", user.uid));
        if (captainDoc.exists()) {
          const captainData = captainData.data();

          // Verify hotel assignment
          if (
            hotelInfo &&
            (captainData.hotelId === hotelInfo.id ||
              captainData.hotelName === hotelName ||
              captainData.assignedHotels?.includes(hotelInfo.id))
          ) {
            return `/viewMenu/${hotelName}/captain/dashboard`;
          } else if (!hotelInfo) {
            // If hotel info not loaded yet, allow navigation
            return `/viewMenu/${hotelName}/captain/dashboard`;
          } else {
            throw new Error("Unauthorized: Not assigned to this restaurant");
          }
        } else {
          throw new Error("Captain profile not found");
        }
      } else {
        // Regular admin check
        const adminDoc = await getDoc(doc(db, "admins", user.uid));
        if (adminDoc.exists()) {
          return "/admin/hotel-select";
        } else {
          throw new Error("Admin profile not found");
        }
      }
    } catch (error) {
      console.error("Error determining navigation path:", error);
      throw error;
    }
  };

  // ✅ ENHANCED: Handle submit with Firestore integration
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    setErrors({});
    setLoading(true);
    setConnectionStatus("connecting");

    try {
      // Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get navigation path and verify access
      const navigationPath = await getNavigationPath(user);

      // ✅ NEW: Update user login status in Firestore
      try {
        let userDocRef;
        let profileData = {};

        if (user.email === SUPER_ADMIN_EMAIL) {
          // Super admin
          profileData = { role: "superadmin" };
        } else if (
          location.pathname.includes("captain") ||
          location.pathname.includes("waiter")
        ) {
          // Captain/Waiter
          userDocRef = doc(db, "captains", user.uid);
          const captainDoc = await getDoc(userDocRef);
          if (captainDoc.exists()) {
            profileData = captainDoc.data();

            // Update login status
            await updateDoc(userDocRef, {
              isOnline: true,
              lastLogin: serverTimestamp(),
              lastSeen: serverTimestamp(),
              deviceInfo: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                loginTime: serverTimestamp(),
              },
            });
          }
        } else {
          // Regular admin
          userDocRef = doc(db, "admins", user.uid);
          const adminDoc = await getDoc(userDocRef);
          if (adminDoc.exists()) {
            profileData = adminDoc.data();

            // Update login status
            await updateDoc(userDocRef, {
              lastLogin: serverTimestamp(),
              isActive: true,
            });
          }
        }

        setUserProfile(profileData);
      } catch (updateError) {
        console.warn("Could not update login status:", updateError);
        // Don't fail the login for this
      }

      setConnectionStatus("connected");

      // Success message
      const successMessage =
        user.email === SUPER_ADMIN_EMAIL
          ? "Super Admin Login Successful!"
          : `${loginConfig.title} Successful!`;

      toast.success(successMessage);

      // Navigate after short delay
      setTimeout(() => {
        navigate(navigationPath, { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      setConnectionStatus("error");

      let errorMessage = "Authentication failed";
      let fieldErrors = {};

      // ✅ ENHANCED: Better error handling
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address.";
          fieldErrors = { email: "Account not found" };
          break;
        case "auth/wrong-password":
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password.";
          fieldErrors = {
            email: "Invalid credentials",
            password: "Invalid credentials",
          };
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email format.";
          fieldErrors = { email: "Invalid email format" };
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your connection.";
          setConnectionStatus("error");
          break;
        default:
          if (error.message?.includes("Unauthorized")) {
            errorMessage = error.message;
            fieldErrors = {
              email: "Access denied",
              password: "Access denied",
            };
          } else if (error.message?.includes("not found")) {
            errorMessage = "Profile not found. Please contact support.";
            fieldErrors = {
              email: "Profile not found",
              password: "Profile not found",
            };
          } else {
            errorMessage = "Login failed: " + error.message;
          }
      }

      toast.error(errorMessage);
      setErrors(fieldErrors);
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while checking auth status
  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">
            Checking authentication status...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Left Column - Login Form */}
      <div className="md:w-3/5 w-full bg-gray-200 p-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-lg dark:bg-gray-800">
          <LoginHeader
            loginConfig={loginConfig}
            hotelInfo={hotelInfo}
            connectionStatus={connectionStatus}
          />

          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            passwordVisible={passwordVisible}
            togglePasswordVisibility={togglePasswordVisibility}
            errors={errors}
            loading={loading}
            handleSubmit={handleSubmit}
            loginConfig={loginConfig}
            connectionStatus={connectionStatus}
            hotelInfo={hotelInfo}
          />

          {/* ✅ NEW: Connection status indicator */}
          {connectionStatus === "error" && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm text-center">
                Connection error. Please check your internet and try again.
              </p>
            </div>
          )}

          {/* ✅ NEW: Hotel information display for captain login */}
          {hotelInfo && (userType === "CAPTAIN" || userType === "WAITER") && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-center">
                <p className="text-blue-800 font-medium text-sm">
                  {hotelInfo.businessName || hotelInfo.name}
                </p>
                {hotelInfo.address && (
                  <p className="text-blue-600 text-xs mt-1">
                    {hotelInfo.address.city || hotelInfo.address}
                  </p>
                )}
              </div>
            </div>
          )}

          <SecurityNotice loginConfig={loginConfig} />
        </div>
      </div>

      {/* Right Column - Dynamic Content */}
      <LoginRightPanel
        loginConfig={loginConfig}
        hotelInfo={hotelInfo}
        userType={userType}
      />
    </div>
  );
};

export default LoginPage;
