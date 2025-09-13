import React, { memo } from "react";
import { X } from "lucide-react";

const CloseButton = memo(({ onClose, className = "" }) => (
  <button
    onClick={onClose}
    className={`absolute top-4 right-4 z-50 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${className}`}
    aria-label="Close modal"
  >
    <X className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
  </button>
));

CloseButton.displayName = "CloseButton";

export default CloseButton;
