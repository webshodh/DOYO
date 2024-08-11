// src/Pages/ResetPasswordPage.js

import React, { useState, useEffect } from "react";
import { getAuth, confirmPasswordReset } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css"; // Ensure this import is present

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

  const queryParams = new URLSearchParams(location.search);
  const oobCode = queryParams.get("oobCode");

  useEffect(() => {
    if (!oobCode) {
      toast.error("Invalid or expired password reset link.");
      navigate("/login"); // Redirect to login if no oobCode
    }
  }, [oobCode, navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await confirmPasswordReset(auth, oobCode, password);
      toast.success("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000); // Redirect after 2 seconds
    } catch (error) {
      toast.error("Error resetting password: " + error.message);
    }
  };

  return (
    <div className="container text-center mt-5">
      <ToastContainer />
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <h3 className="mb-4">Reset Password</h3>
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                New Password
              </label>
              <input
                type="password"
                className={`form-control ${error ? "border-danger" : ""}`}
                id="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                className={`form-control ${error ? "border-danger" : ""}`}
                id="confirmPassword"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-danger">{error}</p>}
            <button type="submit" className="btn btn-primary w-100">
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
