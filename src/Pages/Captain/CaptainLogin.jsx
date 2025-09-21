// src/Pages/Captain/CaptainLogin.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChefHat,
  Loader,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff,
  Building2,
} from "lucide-react";
import { toast } from "react-toastify";

// ✅ NEW: Import Firestore authentication and services
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
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

// ✅ NEW: Import context hooks
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";

const CaptainLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connected");
  const [hotelInfo, setHotelInfo] = useState(null);

  const navigate = useNavigate();
  const { hotelName } = useParams();

  // ✅ NEW: Use context hooks
  const { currentUser, isAuthenticated } = useAuth();
  const { selectedHotel, selectHotelById } = useHotelContext();

  console.log("hotelName:", hotelName);

  // ✅ NEW: Load hotel information
  useEffect(() => {
    const loadHotelInfo = async () => {
      if (!hotelName) return;

      try {
        // First try to find hotel by name
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
        } else {
          // Try alternate name fields
          const alternateQuery = query(
            hotelsRef,
            where("businessName", "==", hotelName)
          );
          const alternateSnapshot = await getDocs(alternateQuery);

          if (!alternateSnapshot.empty) {
            const hotelDoc = alternateSnapshot.docs[0];
            const hotelData = {
              id: hotelDoc.id,
              ...hotelDoc.data(),
            };
            setHotelInfo(hotelData);
            selectHotelById(hotelData.id);
          }
        }
      } catch (error) {
        console.error("Error loading hotel info:", error);
        setConnectionStatus("error");
      }
    };

    loadHotelInfo();
  }, [hotelName, selectedHotel, selectHotelById]);

  // ✅ ENHANCED: Check if already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setConnectionStatus("connecting");

        // Listen to auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user && isAuthenticated) {
            try {
              // Check if user is a captain
              const captainDoc = await getDoc(doc(db, "captains", user.uid));

              if (captainDoc.exists()) {
                const captainData = captainDoc.data();

                // Verify captain is associated with this hotel
                if (
                  hotelInfo &&
                  (captainData.hotelId === hotelInfo.id ||
                    captainData.hotelName === hotelName ||
                    captainData.assignedHotels?.includes(hotelInfo.id))
                ) {
                  toast.success(
                    `Welcome back, ${
                      captainData.name || captainData.firstName
                    }!`
                  );
                  navigate(`/viewMenu/${hotelName}/captain/dashboard`);
                } else if (!hotelInfo) {
                  // Hotel info not loaded yet, navigate anyway
                  navigate(`/viewMenu/${hotelName}/captain/dashboard`);
                }
              }
              setConnectionStatus("connected");
            } catch (error) {
              console.error("Error checking captain status:", error);
              setConnectionStatus("error");
            }
          } else {
            setConnectionStatus("connected");
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error setting up auth listener:", error);
        setConnectionStatus("error");
      }
    };

    checkAuthStatus();
  }, [navigate, hotelName, hotelInfo, isAuthenticated]);

  // ✅ NEW: Connection status indicator
  const ConnectionStatusIndicator = () => {
    if (connectionStatus === "connecting") {
      return (
        <div className="flex items-center gap-2 text-yellow-600 text-sm mb-4">
          <Wifi className="animate-pulse" size={16} />
          <span>Connecting...</span>
        </div>
      );
    } else if (connectionStatus === "error") {
      return (
        <div className="flex items-center gap-2 text-red-600 text-sm mb-4">
          <WifiOff size={16} />
          <span>Connection Error</span>
        </div>
      );
    } else if (connectionStatus === "connected") {
      return (
        <div className="flex items-center gap-2 text-green-600 text-sm mb-4">
          <CheckCircle size={16} />
          <span>Connected</span>
        </div>
      );
    }
    return null;
  };

  const validateForm = useCallback(() => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: null,
        }));
      }
    },
    [errors]
  );

  // ✅ ENHANCED: Handle submit with Firestore authentication
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      setConnectionStatus("connecting");

      try {
        // ✅ FIRESTORE: Authenticate with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email.trim(),
          formData.password
        );

        const user = userCredential.user;

        // ✅ FIRESTORE: Check if user is a captain
        const captainDocRef = doc(db, "captains", user.uid);
        const captainDoc = await getDoc(captainDocRef);

        if (!captainDoc.exists()) {
          // User is not a captain, sign them out
          await signOut(auth);
          toast.error(
            "You are not registered as a captain for this restaurant"
          );
          setErrors({
            email: " ",
            password: "Not registered as a captain",
          });
          setConnectionStatus("connected");
          return;
        }

        const captainData = {
          id: captainDoc.id,
          uid: user.uid,
          email: user.email,
          ...captainDoc.data(),
        };

        // ✅ NEW: Verify captain is assigned to this hotel
        const isAssignedToHotel =
          hotelInfo &&
          (captainData.hotelId === hotelInfo.id ||
            captainData.hotelName === hotelName ||
            captainData.assignedHotels?.includes(hotelInfo.id) ||
            !hotelInfo); // Allow if hotel info not loaded yet

        if (hotelInfo && !isAssignedToHotel) {
          await signOut(auth);
          toast.error("You are not assigned to this restaurant");
          setErrors({
            email: " ",
            password: "Not assigned to this restaurant",
          });
          setConnectionStatus("connected");
          return;
        }

        // ✅ FIRESTORE: Update captain's login status
        try {
          await updateDoc(captainDocRef, {
            isOnline: true,
            lastLogin: serverTimestamp(),
            lastSeen: serverTimestamp(),
            deviceInfo: {
              userAgent: navigator.userAgent,
              platform: navigator.platform,
              loginTime: serverTimestamp(),
            },
          });
        } catch (updateError) {
          console.warn("Could not update captain login status:", updateError);
          // Don't fail the login for this
        }

        setConnectionStatus("connected");
        toast.success(
          `Welcome back, ${
            captainData.name || captainData.firstName || "Captain"
          }!`
        );

        // Navigate to captain dashboard
        navigate(`/viewMenu/${hotelName}/captain/dashboard`);
      } catch (error) {
        console.error("Login error:", error);
        setConnectionStatus("error");

        // ✅ ENHANCED: Handle specific Firebase Auth error cases
        let errorMessage = "Login failed. Please try again.";
        let fieldErrors = {};

        switch (error.code) {
          case "auth/user-not-found":
          case "auth/wrong-password":
          case "auth/invalid-credential":
            errorMessage = "Invalid email or password";
            fieldErrors = {
              email: " ",
              password: "Invalid email or password",
            };
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email address";
            fieldErrors = { email: "Invalid email address" };
            break;
          case "auth/user-disabled":
            errorMessage =
              "Your account has been disabled. Please contact support.";
            break;
          case "auth/too-many-requests":
            errorMessage =
              "Too many failed login attempts. Please try again later.";
            break;
          case "auth/network-request-failed":
            errorMessage = "Network error. Please check your connection.";
            setConnectionStatus("error");
            break;
          default:
            if (error.message?.includes("captain")) {
              errorMessage = "You are not registered as a captain";
              fieldErrors = {
                email: " ",
                password: "Not registered as a captain",
              };
            }
            break;
        }

        toast.error(errorMessage);
        setErrors(fieldErrors);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm, hotelInfo, hotelName, navigate]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* ✅ NEW: Connection Status */}
        <ConnectionStatusIndicator />

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Captain Login
          </h2>
          <p className="text-gray-600">Sign in to access your dashboard</p>

          {/* ✅ NEW: Hotel info display */}
          {hotelInfo && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center gap-2 text-blue-800">
                <Building2 size={16} />
                <span className="font-medium text-sm">
                  {hotelInfo.businessName || hotelInfo.name}
                </span>
              </div>
              {hotelInfo.address && (
                <p className="text-xs text-blue-600 mt-1">
                  {hotelInfo.address.city || hotelInfo.address}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your captain email"
                  disabled={isSubmitting || connectionStatus === "connecting"}
                  className={`
                    w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
                    disabled:bg-gray-50 disabled:cursor-not-allowed
                    ${
                      errors.email
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                    }
                  `}
                />
              </div>
              {errors.email && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="Enter your password"
                  disabled={isSubmitting || connectionStatus === "connecting"}
                  className={`
                    w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
                    disabled:bg-gray-50 disabled:cursor-not-allowed
                    ${
                      errors.password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                    }
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting || connectionStatus === "connecting"}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || connectionStatus === "connecting"}
              className={`
                w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                ${
                  isSubmitting || connectionStatus === "connecting"
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : connectionStatus === "error"
                    ? "bg-red-300 text-red-700 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : connectionStatus === "connecting" ? (
                <>
                  <Wifi className="w-5 h-5 animate-pulse" />
                  <span>Connecting...</span>
                </>
              ) : connectionStatus === "error" ? (
                <>
                  <WifiOff className="w-5 h-5" />
                  <span>Connection Error</span>
                </>
              ) : (
                <span>Sign In as Captain</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Having trouble signing in?{" "}
              <button
                onClick={() =>
                  toast.info(
                    "Please contact your restaurant manager for login assistance"
                  )
                }
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Contact your manager
              </button>
            </p>
          </div>
        </div>

        {/* ✅ ENHANCED: Info section */}
        <div className="text-center text-sm text-gray-500 space-y-2">
          <p>Only registered captains can access this dashboard</p>
          {hotelInfo && (
            <p className="text-xs">
              Logging in to:{" "}
              <span className="font-medium">
                {hotelInfo.businessName || hotelInfo.name}
              </span>
            </p>
          )}
          {connectionStatus === "error" && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-700 text-sm">
                Unable to connect to the server. Please check your internet
                connection and try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaptainLogin;
