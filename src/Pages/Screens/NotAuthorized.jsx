import React from "react";
import { Link } from "react-router-dom";
import { Shield, Home, ArrowLeft, Lock } from "lucide-react";

const NotAuthorized = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-md w-full">
        {/* Main card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {/* Header with icon */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Access Denied
            </h1>
            <div className="flex items-center justify-center gap-2 text-white/90">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Error 403</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <div className="mb-6">
              <p className="text-gray-700 text-lg mb-3">
                Sorry, you don't have permission to access this page.
              </p>
              <p className="text-gray-500 text-sm">
                Please contact your administrator if you believe this is an
                error.
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <Link
                to="/"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Home className="w-5 h-5" />
                Go to Homepage
              </Link>

              <button
                onClick={() => window.history.back()}
                className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-gray-200"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </button>
            </div>

            {/* Additional help */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">Need assistance?</p>
              <div className="flex justify-center gap-4 text-xs">
                <button className="text-blue-500 hover:text-blue-600 font-medium">
                  Contact Support
                </button>
                <span className="text-gray-300">•</span>
                <button className="text-blue-500 hover:text-blue-600 font-medium">
                  Help Center
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional info card */}
        <div className="mt-4 bg-white/60 backdrop-blur-md rounded-xl p-4 text-center border border-white/30">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Security Notice:</span> This area is
            restricted to authorized users only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotAuthorized;
