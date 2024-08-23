import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useHotelContext } from "../../Context/HotelContext";
import { getDatabase, ref, get, child } from "firebase/database"; // Import Firebase database functions
import "react-toastify/dist/ReactToastify.css";

const LoginPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const auth = getAuth();
  const navigate = useNavigate();
  const { hotelName, setHotelName } = useHotelContext(); // Add setHotelName to update the context

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
    if (validateFields()) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Logged in successfully!");

        // Fetch the hotels after login
        const db = getDatabase();
        const userUid = auth.currentUser.uid;
        const hotelsRef = ref(db, `admins/${userUid}/hotels`);
        const snapshot = await get(hotelsRef);

        if (snapshot.exists()) {
          const hotelsData = snapshot.val();
          const hotelNames = Object.keys(hotelsData);
          const firstHotelName = hotelNames[0];

          // Set the first hotel name in the context
          setHotelName(firstHotelName);

          // Navigate to the dashboard with the first hotel name
          navigate(`/${firstHotelName}/admin/admin-dashboard`);

            // Force a page refresh after a delay
        setTimeout(() => {
          window.location.reload();
        }, 0);
        } else {
          toast.error("No hotels found for this admin.");
        }
      } catch (error) {
        toast.error("Error logging in: " + error.message);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Column - 60% width */}
      <div className="md:w-3/5 w-full bg-gray-200 p-4 flex items-center justify-center">
        {/* Left column content here */}
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
                onBlur={validateFields}
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
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white`}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={validateFields}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={togglePasswordVisibility}
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-2">{errors.password}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3 mt-4 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75"
            >
              Login
            </button>
            <div className="mt-4 text-center">
              <a
                href="/forgot-password"
                className="text-sm text-orange-500 hover:underline dark:text-orange-400"
              >
                Forgot Password?
              </a>
            </div>
            <div className="mt-4 text-center">
              <a
                href="/signup"
                className="text-sm text-orange-500 hover:underline dark:text-orange-400"
              >
                Don't have an account? Sign Up
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column - 40% width */}
      <div className="md:w-2/5 w-full bg-gray-200 p-4 flex items-center justify-center">
        {/* Right column content here */}
        <img src="/logo.png" alt="App Logo" className="max-w-full h-auto" />
      </div>
    </div>
  );
};

export default LoginPage;
