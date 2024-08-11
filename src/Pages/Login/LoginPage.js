import React, { useState } from "react";
import "../../styles/LoginPage.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css"; // Ensure this import is present

const LoginPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const auth = getAuth();
  const navigate = useNavigate();
  const hotelName = "Atithi"; // Replace with dynamic hotel name if needed

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
        navigate(`/${hotelName}/admin`); // Redirect to the dashboard after successful login
      } catch (error) {
        toast.error("Error logging in: " + error.message);
      }
    }
  };

  return (
    <div className="login-container">
      <ToastContainer /> {/* Ensure this is included */}
      <div className="login-card">
        <h3 className="text-center mb-4">Login</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              className={`form-control ${
                errors.email ? "border-danger" : "border-success"
              }`}
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={validateFields}
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>
          <div className="mb-3 position-relative">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type={passwordVisible ? "text" : "password"}
              className={`form-control ${
                errors.password ? "border-danger" : "border-success"
              }`}
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={validateFields}
            />
            <button
              type="button"
              className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3"
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && (
              <p className="error-message">{errors.password}</p>
            )}
          </div>
          <button type="submit" className="btn btn-primary w-100 mb-3">
            Login
          </button>
          <a href="/forgot-password" className="d-block text-center">
            Forgot Password?
          </a>
          <a href="/signup" className="d-block text-center">
            Don't have an account? Sign Up
          </a>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
