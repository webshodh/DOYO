import React, { memo } from "react";
import { Plus } from "lucide-react";

// Action buttons component
const PrimaryButton = memo(({ onAdd, loading = false, btnText }) => (
  <div className="flex flex-wrap gap-2">
    <button
      onClick={onAdd}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      <Plus className="w-4 h-4" />
      <span className="hidden sm:inline">{btnText}</span>
    </button>
  </div>
));

PrimaryButton.displayName = "PrimaryButton";
export default PrimaryButton;
