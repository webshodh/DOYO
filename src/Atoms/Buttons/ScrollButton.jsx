import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo } from "react";

// Scroll navigation buttons
const ScrollButton = memo(
  ({ direction, onClick, disabled, className = "" }) => {
    const Icon = direction === "left" ? ChevronLeft : ChevronRight;

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
        flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-md
        border border-gray-200 hover:bg-gray-50 transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed ${className}
      `}
        aria-label={`Scroll ${direction}`}
      >
        <Icon className="w-4 h-4 text-gray-600" />
      </button>
    );
  }
);

ScrollButton.displayName = "ScrollButton";
export default ScrollButton;
