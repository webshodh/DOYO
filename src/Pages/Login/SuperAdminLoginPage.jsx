import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaShieldAlt, FaUserShield } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const SuperAdminLoginPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const navigate = useNavigate();

  // Single predefined super admin credentials
  const SUPER_ADMIN_EMAIL = "webshodhteam@gmail.com";
  const SUPER_ADMIN_PASSWORD = "Vishal@7674";

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

    // Check credentials before Firebase authentication
    if (email !== SUPER_ADMIN_EMAIL || password !== SUPER_ADMIN_PASSWORD) {
      toast.error("Invalid super admin credentials!");
      setErrors({ 
        email: "Invalid credentials", 
        password: "Invalid credentials" 
      });
      return;
    }

    setLoading(true);
    try {
      // Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      const user = userCredential.user;
      
      // Double-check email after Firebase auth
      if (user.email === SUPER_ADMIN_EMAIL) {
        toast.success("Super Admin authentication successful!");
        
        // Immediate redirect without splash screen
        setTimeout(() => {
          navigate("/super-admin/dashboard", { replace: true });
        }, 1000);
      } else {
        toast.error("Unauthorized access!");
        await auth.signOut();
      }
    } catch (error) {
      let errorMessage = "Authentication failed";
      
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "Super admin account not found.";
          break;
        case "auth/wrong-password":
          errorMessage = "Invalid super admin credentials.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email format.";
          break;
        case "auth/user-disabled":
          errorMessage = "Super admin account has been disabled.";
          break;
        default:
          errorMessage = "Authentication error: " + error.message;
      }
      
      toast.error(errorMessage);
      setErrors({ 
        email: "Authentication failed", 
        password: "Authentication failed" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
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
        theme="dark"
      />
      
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          
          {/* Left Side - Branding */}
          <div className="flex-1 text-center lg:text-left space-y-6 lg:max-w-lg">
            {/* Logo */}
            <div className="flex items-center justify-center lg:justify-start space-x-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <FaShieldAlt className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Hotel Control</h1>
                <p className="text-blue-300 font-medium">Enterprise Suite</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                Super Admin
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  Control Center
                </span>
              </h2>
              <p className="text-xl text-blue-200 leading-relaxed">
                Secure access to enterprise-level hotel management system with advanced administrative privileges.
              </p>
            </div>

            {/* Features */}
            <div className="hidden lg:flex flex-col space-y-4 pt-8">
              <div className="flex items-center space-x-3 text-blue-200">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Complete system oversight</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-200">
                <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                <span>Advanced analytics & reporting</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-200">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Multi-hotel management</span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex-1 w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
              {/* Form Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FaUserShield className="text-2xl text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Secure Access
                </h3>
                <p className="text-blue-200">
                  Enter your super admin credentials
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      className={`w-full p-4 bg-white/10 backdrop-blur-sm border ${
                        errors.email ? "border-red-400" : "border-white/30"
                      } rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                      placeholder="Enter super admin email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: "" });
                      }}
                      disabled={loading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-300 text-sm mt-2 flex items-center space-x-1">
                      <span>⚠️</span>
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      className={`w-full p-4 bg-white/10 backdrop-blur-sm border ${
                        errors.password ? "border-red-400" : "border-white/30"
                      } rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 pr-12`}
                      placeholder="Enter super admin password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: "" });
                      }}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                      onClick={togglePasswordVisibility}
                      disabled={loading}
                    >
                      {passwordVisible ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-300 text-sm mt-2 flex items-center space-x-1">
                      <span>⚠️</span>
                      <span>{errors.password}</span>
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition-all duration-300 transform ${
                    loading
                      ? "bg-gray-500 cursor-not-allowed scale-95"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:scale-105 shadow-lg hover:shadow-2xl"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <FaShieldAlt />
                      <span>Access Control Center</span>
                    </div>
                  )}
                </button>
              </form>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-xl">
                <p className="text-yellow-200 text-sm text-center flex items-center justify-center space-x-2">
                  <FaShieldAlt className="text-yellow-400" />
                  <span>Secure encrypted connection</span>
                </p>
              </div>
            </div>

            {/* Demo Credentials (for development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-orange-500/10 border border-orange-400/30 rounded-xl">
                <p className="text-orange-200 text-sm text-center font-mono">
                  Demo: {SUPER_ADMIN_EMAIL}
                </p>
                <p className="text-orange-200 text-sm text-center font-mono">
                  Pass: {SUPER_ADMIN_PASSWORD}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default SuperAdminLoginPage;