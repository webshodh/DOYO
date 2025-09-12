import React, { useState, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import LoginHeader from "components/LoginHeader";
import LoginForm from "components/LoginForm";
import SecurityNotice from "components/LoginSecurityNotice";
import LoginRightPanel from "components/LoginRightPanel";
import { getUserType, LOGIN_CONFIGS } from "Constants/loginConfigs";



const LoginPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine user type and get config
  const userType = useMemo(
    () => getUserType(location.pathname),
    [location.pathname]
  );
  const loginConfig = useMemo(() => LOGIN_CONFIGS[userType], [userType]);

  // Super admin credentials
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

  const getNavigationPath = (user) => {
    // Super admin check
    if (user.email === SUPER_ADMIN_EMAIL) {
      return "/super-admin/dashboard";
    }

    // Based on current path, determine where to redirect
    if (location.pathname.includes("super-admin")) {
      return "/super-admin/dashboard";
    } else if (
      location.pathname.includes("waiter") ||
      location.pathname.includes("captain")
    ) {
      // Extract hotel name from path if available
      const pathParts = location.pathname.split("/");
      const hotelIndex = pathParts.findIndex((part) => part === "viewMenu");
      if (hotelIndex !== -1 && pathParts[hotelIndex + 1]) {
        return `/viewMenu/${pathParts[hotelIndex + 1]}/captain/home`;
      }
      return "/waiter/dashboard"; // fallback
    } else {
      return "/admin/hotel-select";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    setErrors({});
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const successMessage =
        user.email === SUPER_ADMIN_EMAIL
          ? "Super Admin Login Successful!"
          : `${loginConfig.title} Successful!`;

      toast.success(successMessage);

      setTimeout(() => {
        navigate(getNavigationPath(user), { replace: true });
      }, 1000);
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
          <LoginHeader loginConfig={loginConfig} />

          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            passwordVisible={passwordVisible}
            togglePasswordVisibility={togglePasswordVisibility}
            errors={errors}
            loading={loading}
            handleSubmit={handleSubmit}
            loginConfig={loginConfig}
          />

          <SecurityNotice loginConfig={loginConfig} />
        </div>
      </div>

      {/* Right Column - Dynamic Content */}
      <LoginRightPanel loginConfig={loginConfig} />
    </div>
  );
};

export default LoginPage;
