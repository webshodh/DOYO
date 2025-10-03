import React, { memo } from "react";
import { X } from "lucide-react";

const FilterBadge = memo(
  ({ label, onRemove, variant = "default", icon: Icon }) => {
    const variants = {
      default: "bg-gray-100 text-gray-800 border-gray-300",
      category: "bg-green-100 text-green-800 border-green-300",
      special: "bg-blue-100 text-blue-800 border-blue-300",
      main: "bg-purple-100 text-purple-800 border-purple-300",
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${variants[variant]} transition-all duration-200 hover:shadow-sm`}
      >
        {Icon && <Icon className="w-3 h-3" />}
        {label}
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
          aria-label={`Remove ${label} filter`}
        >
          <X className="w-3 h-3" />
        </button>
      </span>
    );
  },
);

FilterBadge.displayName = "FilterBadge";

export default FilterBadge;
