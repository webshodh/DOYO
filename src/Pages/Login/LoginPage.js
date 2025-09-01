import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, get } from "firebase/database";
import "react-toastify/dist/ReactToastify.css";

const LoginPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const validateFields = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailPattern.test(email))
      newErrors.email = "Valid email is required.";
    if (!password) newErrors.password = "Password is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkUserRole = async (userUid) => {
    const db = getDatabase();

    try {
      // First check if user exists in superadmin collection
      const superAdminRef = ref(db, `superadmin/${userUid}`);
      const superAdminSnapshot = await get(superAdminRef);

      if (superAdminSnapshot.exists()) {
        return { role: "super-admin", data: superAdminSnapshot.val() };
      }

      // Then check if user exists in admins collection
      const adminRef = ref(db, `admins/${userUid}`);
      const adminSnapshot = await get(adminRef);

      if (adminSnapshot.exists()) {
        return { role: "admin", data: adminSnapshot.val() };
      }

      // User not found in either collection
      return { role: null, data: null };
    } catch (error) {
      console.error("Error checking user role:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateFields()) {
      setLoading(true);
      try {
        // Authenticate user
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Check user role in database
        const { role, data } = await checkUserRole(user.uid);
        console.log("role", role);
        if (!role) {
          toast.error(
            "User not found in system records. Please contact administrator."
          );
          await auth.signOut(); // Sign out the user
          return;
        }

        toast.success("Logged in successfully!");

        // Route based on role
        if (role === "super-admin") {
          navigate("/super-admin/dashboard");
        } else if (role === "admin") {
          // For admins, always redirect to hotel splash screen
          navigate("/admin/hotel-select");
        }
      } catch (error) {
        if (error.code === "auth/user-not-found") {
          toast.error("No account found with this email address.");
        } else if (error.code === "auth/wrong-password") {
          toast.error("Incorrect password. Please try again.");
        } else if (error.code === "auth/invalid-email") {
          toast.error("Invalid email address format.");
        } else if (error.code === "auth/user-disabled") {
          toast.error(
            "This account has been disabled. Please contact support."
          );
        } else if (error.code === "auth/invalid-credential") {
          toast.error(
            "Invalid credentials. Please check your email and password."
          );
        } else {
          toast.error("Error logging in: " + error.message);
        }
        console.error("Login error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <ToastContainer />

      {/* Left Column - 60% width */}
      <div className="md:w-3/5 w-full bg-gray-200 p-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-lg dark:bg-gray-800">
          <h3 className="text-4xl font-extrabold text-center text-orange-600 dark:text-orange-400 mb-2">
            Welcome Back!
          </h3>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Log in to your account to continue.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Email address
              </label>
              <input
                type="email"
                className={`w-full p-3 mt-2 text-gray-900 bg-gray-100 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white`}
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-2">{errors.email}</p>
              )}
            </div>

            <div className="mb-4 relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Password
              </label>
              <input
                type={passwordVisible ? "text" : "password"}
                className={`w-full p-3 mt-2 text-gray-900 bg-gray-100 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white pr-10`}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-11 text-gray-500 hover:text-gray-700"
                onClick={togglePasswordVisibility}
                disabled={loading}
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-2">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 mt-4 text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75 transition-colors duration-200 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>

            <div className="mt-4 text-center">
              <a
                href="/forgot-password"
                className="text-sm text-orange-500 hover:underline dark:text-orange-400"
              >
                Forgot Password?
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column - 40% width */}
      <div className="md:w-2/5 w-full bg-gray-200 p-4 flex items-center justify-center">
        <img src="/logo.png" alt="App Logo" className="max-w-full h-auto" />
      </div>
    </div>
  );
};

export default LoginPage;
