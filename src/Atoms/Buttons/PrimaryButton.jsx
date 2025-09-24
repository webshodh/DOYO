import React, { memo } from "react";
import { Plus } from "lucide-react";

// Action buttons component
const PrimaryButton = memo(({ onAdd, loading = false, btnText }) => (
  <div className="flex flex-wrap gap-2">
    <button
      onClick={onAdd}
      disabled={loading}
      className={`
        flex items-center justify-center
        bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full
        transition-all duration-200 transform
        hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none

        /* Mobile: small round icon-only button */
        w-10 h-10 p-0 mt-4

        /* Desktop: full button with padding and text */
        sm:rounded-lg sm:w-auto sm:h-auto sm:px-4 sm:py-2 sm:gap-2
      `}
    >
      <Plus className="w-4 h-4" />
      {/* Text hidden on mobile, visible on sm and up */}
      <span className="hidden sm:inline">{btnText}</span>
    </button>
  </div>
));

PrimaryButton.displayName = "PrimaryButton";
export default PrimaryButton;
