import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaUserShield, FaShieldAlt } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const LoginPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const navigate = useNavigate();

  // Super admin credentials from environment variables
  const SUPER_ADMIN_EMAIL = process.env.REACT_APP_SUPER_ADMIN_EMAIL;

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    // Clear previous errors
    setErrors({});
    setLoading(true);

    try {
      // Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Check if the authenticated user is the super admin
      if (user.email === SUPER_ADMIN_EMAIL) {
        toast.success("Super Admin Login Successful!");
        setTimeout(() => {
          navigate("/super-admin/dashboard", { replace: true });
        }, 1000);
      } else {
        // Regular admin login
        toast.success("Admin Login Successful!");
        setTimeout(() => {
          navigate("/admin/hotel-select", { replace: true });
        }, 1000);
      }
    } catch (error) {
      let errorMessage = "Authentication failed";

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address.";
          break;
        case "auth/wrong-password":
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email format.";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        default:
          errorMessage = "Login failed: " + error.message;
      }

      toast.error(errorMessage);
      setErrors({
        email: "Authentication failed",
        password: "Authentication failed",
      });
    } finally {
      setLoading(false);
    }
  };

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
          <div className="text-center mb-8">
            <FaUserShield className="mx-auto text-5xl text-orange-600 dark:text-orange-400 mb-4" />
            <h3 className="text-4xl font-extrabold text-orange-600 dark:text-orange-400 mb-2">
              Admin Login
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Log in to access your administrative dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Email Address
              </label>
              <input
                type="email"
                className={`w-full p-3 text-gray-900 bg-gray-100 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white dark:border-gray-600`}
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-2">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-6 relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Password
              </label>
              <input
                type={passwordVisible ? "text" : "password"}
                className={`w-full p-3 pr-10 text-gray-900 bg-gray-100 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white dark:border-gray-600`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-11 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={togglePasswordVisibility}
                disabled={loading}
                aria-label={passwordVisible ? "Hide password" : "Show password"}
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-2">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75 transition-all duration-200 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 active:bg-orange-700"
              }`}
            >
              <div className="flex items-center justify-center">
                {loading && (
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
                )}
                {loading ? "Authenticating..." : "Login"}
                {!loading && <FaShieldAlt className="ml-2" />}
              </div>
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex items-center">
              <FaShieldAlt className="text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Secure admin portal - Access level determined by credentials
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Logo/Branding */}
      <div className="md:w-2/5 w-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center p-8">
        <div className="text-center text-white">
          <img
            src="/logo.png"
            alt="Application Logo"
            className="max-w-full h-auto mb-6 mx-auto"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div className="space-y-4">
            <FaUserShield className="mx-auto text-8xl opacity-20" />
            <h2 className="text-3xl font-bold">Administrative Access</h2>
            <p className="text-lg opacity-90">
              Secure. Reliable. Professional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
