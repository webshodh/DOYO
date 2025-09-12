import React, { memo, useCallback } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";

const QuantityControls = memo(
  ({
    item,
    onQuantityChange,
    isUpdating = false,
    variant = "cart", // "cart" | "menu"
    size = "md", // "sm" | "md" | "lg"
  }) => {
    const handleDecrease = useCallback(() => {
      onQuantityChange(item, -1);
    }, [item, onQuantityChange]);

    const handleIncrease = useCallback(() => {
      onQuantityChange(item, 1);
    }, [item, onQuantityChange]);

    const sizeClasses = {
      sm: "p-1.5 text-xs min-w-[40px]",
      md: "p-2 text-sm min-w-[50px]",
      lg: "p-3 text-base min-w-[60px]",
    };

    const baseClasses =
      variant === "cart"
        ? "bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100"
        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100";

    return (
      <div className={`flex items-center ${baseClasses} rounded-lg border`}>
        <button
          onClick={handleDecrease}
          disabled={isUpdating || item.quantity <= 1}
          className={`${sizeClasses[size]} ${baseClasses} disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500`}
          aria-label="Decrease quantity"
        >
          {item.quantity <= 1 ? <Trash2 size={16} /> : <Minus size={16} />}
        </button>
        <span className={`${sizeClasses[size]} font-semibold text-center`}>
          {isUpdating ? "..." : item.quantity}
        </span>
        <button
          onClick={handleIncrease}
          disabled={isUpdating}
          className={`${sizeClasses[size]} ${baseClasses} disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500`}
          aria-label="Increase quantity"
        >
          <Plus size={16} />
        </button>
      </div>
    );
  }
);

QuantityControls.displayName = "QuantityControls";
export default QuantityControls;
