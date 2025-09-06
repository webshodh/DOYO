import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const AdminLoginPage = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Admin Login Successful!");
      navigate("/admin/hotel-select");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        toast.error("No account found with this email address.");
      } else if (error.code === "auth/wrong-password") {
        toast.error("Incorrect password.");
      } else {
        toast.error("Login failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <ToastContainer />
      {/* Left Column */}
      <div className="md:w-3/5 w-full bg-gray-200 p-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-lg dark:bg-gray-800">
          <h3 className="text-4xl font-extrabold text-center text-orange-600 dark:text-orange-400 mb-2">
            Admin Login
          </h3>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Log in to manage your hotel.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Email address
              </label>
              <input
                type="email"
                className={`w-full p-3 mt-2 text-gray-900 bg-gray-100 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white`}
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-2">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Password
              </label>
              <input
                type={passwordVisible ? "text" : "password"}
                className={`w-full p-3 mt-2 text-gray-900 bg-gray-100 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white pr-10`}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-11 text-gray-500"
                onClick={togglePasswordVisibility}
                disabled={loading}
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-2">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 mt-4 text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
      {/* Right Column */}
      <div className="md:w-2/5 w-full bg-gray-200 flex items-center justify-center">
        <img src="/logo.png" alt="App Logo" className="max-w-full h-auto" />
      </div>
    </div>
  );
};

export default AdminLoginPage;
