import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css"; // Ensure this import is present
import '../../styles/ForgotPasswordPage.css'
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const auth = getAuth();
  const navigate = useNavigate(); // Hook for navigation

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent!");
      setEmail(""); // Clear the email input field

      // Redirect after a delay
      setTimeout(() => {
        navigate("/login"); // Redirect to the login page
      }, 3000); // Adjust the delay as needed (3000 ms = 3 seconds)
    } catch (error) {
      toast.error("Error sending reset email: " + error.message);
    }
  };

  return (
    <div className="container text-center mt-5">
      <ToastContainer />
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <h3 className="mb-4">Forgot Password</h3>
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                type="email"
                className={`form-control ${error ? "border-danger" : ""}`}
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error && <p className="text-danger">{error}</p>}
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Send Reset Link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
