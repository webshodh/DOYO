import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChefHat,
  Loader,
  AlertCircle,
} from "lucide-react";
import { captainServices } from "../../services/api/captainServices";
import { toast } from "react-toastify";

const CaptainLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { hotelName } = useParams();
  console.log("hotelNamehotelName", hotelName);
  // Check if already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (captainServices.isAuthenticatedCaptain()) {
          const captain = await captainServices.getCurrentCaptain();
          if (captain) {
            navigate(`/viewMenu/${hotelName}/captain/dashboard`);
          }
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  const validateForm = () => {
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
  };

  const handleInputChange = (field, value) => {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const loginResult = await captainServices.captainLogin(
        formData.email.trim(),
        formData.password
      );

      toast.success(`Welcome back, ${loginResult.captainData.firstName}!`);

      // Navigate to captain dashboard
      navigate(`/viewMenu/${hotelName}/captain/dashboard`);
    } catch (error) {
      console.error("Login error:", error);

      // Handle specific error cases
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        toast.error("Invalid email or password");
        setErrors({
          email: " ",
          password: "Invalid email or password",
        });
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email address");
        setErrors({ email: "Invalid email address" });
      } else if (error.code === "auth/user-disabled") {
        toast.error("Your account has been disabled. Please contact support.");
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Too many failed login attempts. Please try again later.");
      } else if (error.message === "Invalid captain credentials") {
        toast.error("You are not registered as a captain");
        setErrors({
          email: " ",
          password: "Not registered as a captain",
        });
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Captain Login
          </h2>
          <p className="text-gray-600">Sign in to access your dashboard</p>
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
                  placeholder="Enter your email"
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
              disabled={isSubmitting}
              className={`
                w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                ${
                  isSubmitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Having trouble signing in?{" "}
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Contact your manager
              </button>
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="text-center text-sm text-gray-500">
          <p>Only registered captains can access this dashboard</p>
        </div>
      </div>
    </div>
  );
};

export default CaptainLogin;
