import React, { memo } from "react";
import { FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";

const LoginForm = memo(
  ({
    email,
    setEmail,
    password,
    setPassword,
    passwordVisible,
    togglePasswordVisibility,
    errors,
    loading,
    handleSubmit,
    loginConfig,
  }) => (
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
            : `${loginConfig.buttonColor} hover:${loginConfig.buttonHover} active:${loginConfig.buttonActive}`
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
          {loading ? "Authenticating..." : loginConfig.buttonText}
          {!loading && <FaShieldAlt className="ml-2" />}
        </div>
      </button>
    </form>
  )
);

LoginForm.displayName = "LoginForm";
export default LoginForm;
