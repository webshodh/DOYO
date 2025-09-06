import React, { useEffect } from "react";
import { X } from "lucide-react";

const Modal = ({
  handleClose,
  title,
  children,
  size = "md",
  showFooter = false,
  footerContent = null,
  closeOnBackdrop = true,
}) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [handleClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "max-w-md";
      case "lg":
        return "max-w-4xl";
      case "xl":
        return "max-w-6xl";
      case "full":
        return "max-w-[95vw] max-h-[95vh]";
      default:
        return "max-w-2xl";
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      style={{marginTop:'100px'}}
    >
      <div
        className={`
          relative w-full ${getSizeClasses()} 
          bg-white rounded-xl shadow-2xl 
          transform animate-in zoom-in-95 duration-200
          max-h-[90vh] overflow-hidden
          border border-gray-200
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-orange-200 bg-gradient-to-r from-orange-300 to-orange-500">
          <h2 className="text-xl font-semibold text-white truncate pr-4">
            {title}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-white hover:text-white hover:bg-gray-200 rounded-lg transition-colors duration-200 flex-shrink-0"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
            {footerContent || (
              <>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Confirm
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
