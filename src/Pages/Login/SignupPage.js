import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { db } from "../../data/firebase/firebaseConfig";
import { ref, set } from "firebase/database";
import { useNavigate } from "react-router-dom";

const SuperAdminSignup = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const auth = getAuth();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const validateFields = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) newErrors.name = "Name is required.";
    if (!email || !emailPattern.test(email))
      newErrors.email = "Valid email is required.";
    if (!password) newErrors.password = "Password is required.";
    if (password.length < 6) 
      newErrors.password = "Password must be at least 6 characters.";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords must match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateFields()) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        await updateProfile(user, {
          displayName: name,
        });

        const superAdminData = {
          name,
          email,
          role: "super-admin",
          createdAt: new Date().toISOString(),
          uid: user.uid,
        };

        // Store in superadmin collection
        const superAdminRef = ref(db, `superadmin/${user.uid}`);
        await set(superAdminRef, superAdminData);

        toast.success("Super Admin registered successfully!");
        
        // Redirect to super admin dashboard
        setTimeout(() => {
          navigate("/super-admin/dashboard");
        }, 1500);
        
      } catch (error) {
        toast.error("Error registering super admin: " + error.message);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <ToastContainer />
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h3 className="text-center text-2xl font-semibold text-orange-600 mb-6">
          Super Admin Sign Up
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              id="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              id="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          
          <div className="mb-4 relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type={passwordVisible ? "text" : "password"}
              className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          
          <div className="mb-6 relative">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
              id="confirmPassword"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              onClick={toggleConfirmPasswordVisibility}
            >
              {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full bg-orange-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-orange-700 transition-colors duration-200"
          >
            Create Super Admin Account
          </button>
          
          <a
            href="/login"
            className="block text-center text-orange-600 mt-4 hover:underline"
          >
            Already have an account? Login
          </a>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminSignup;