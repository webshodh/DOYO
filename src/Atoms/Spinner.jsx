// Spinner.js
import React from "react";

const Spinner = ({ text }) => {
  return (
    // Loading overlay for smooth transitions
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[60] flex items-center justify-center transition-opacity duration-300">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
        <p className="text-sm text-gray-600 font-medium">
          {text || "Loading..."}
        </p>
      </div>
    </div>
  );
};

export default Spinner;
