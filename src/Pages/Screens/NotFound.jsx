import React from "react";
import { Link } from "react-router-dom";
import { Search, Home, ArrowLeft, AlertCircle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Main content card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
          {/* 404 Number - Large and prominent */}
          <div className="mb-6">
            <h1 className="text-8xl md:text-9xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent leading-none">
              404
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <AlertCircle className="w-5 h-5 text-gray-500" />
              <span className="text-gray-500 font-medium">Page Not Found</span>
            </div>
          </div>

          {/* Message */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Oops! Page not found
            </h2>
            <p className="text-gray-600 text-lg mb-2">
              The page you're looking for doesn't exist.
            </p>
            <p className="text-gray-500 text-sm">
              It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-4">
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Home className="w-5 h-5" />
              Back to Homepage
            </Link>

            <div className="flex gap-3">
              <button
                onClick={() => window.history.back()}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>

              <button className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-blue-200">
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Additional help */}
        <div className="mt-6 bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/30">
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-semibold">Lost?</span> Here are some helpful
            links:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              to="/about"
              className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
            >
              About Us
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/contact"
              className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
            >
              Contact
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/help"
              className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
            >
              Help Center
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/sitemap"
              className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
            >
              Sitemap
            </Link>
          </div>
        </div>

        {/* Fun illustration placeholder */}
        <div className="mt-8 opacity-60">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-white" />
          </div>
          <p className="text-xs text-gray-400 mt-3">
            "Not all who wander are lost, but this page definitely is!"
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
