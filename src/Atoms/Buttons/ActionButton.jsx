import React, { memo } from "react";
import { Eye, AlertCircle } from "lucide-react";

const ActionButton = memo(({ isAvailable, onClick, isLoading = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={!isAvailable || isLoading}
      className={`w-full py-2 px-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg flex items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
        isAvailable && !isLoading
          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 hover:shadow-xl transform hover:scale-105 active:scale-95 focus:ring-orange-500"
          : "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
      }`}
      aria-label={
        isAvailable ? "View menu item details" : "Item currently unavailable"
      }
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
          <span className="hidden sm:inline">Loading...</span>
        </>
      ) : isAvailable ? (
        <>
          <Eye size={14} />
          <span className="hidden sm:inline">View Details</span>
          <span className="sm:hidden">View</span>
        </>
      ) : (
        <>
          <AlertCircle size={14} />
          <span className="hidden sm:inline">Unavailable</span>
          <span className="sm:hidden">Unavailable</span>
        </>
      )}
    </button>
  );
});

ActionButton.displayName = "ActionButton";

export default ActionButton;
