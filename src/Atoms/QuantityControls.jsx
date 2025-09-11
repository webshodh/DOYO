import React, { memo } from "react";
import { Minus, Plus } from "lucide-react";

const QuantityControls = memo(
  ({
    quantity,
    onIncrease,
    onDecrease,
    isAvailable = true,
    minQuantity = 0,
    maxQuantity = 99,
  }) => {
    const canDecrease = quantity > minQuantity && isAvailable;
    const canIncrease = quantity < maxQuantity && isAvailable;

    return (
      <div className="flex items-center bg-orange-50 rounded-lg border border-orange-200 shadow-sm">
        <button
          onClick={onDecrease}
          className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-l-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset"
          disabled={!canDecrease}
          aria-label="Decrease quantity"
        >
          <Minus size={14} />
        </button>
        <span
          className="px-3 py-1.5 text-sm font-semibold text-orange-700 min-w-[32px] text-center"
          aria-live="polite"
          aria-label={`Quantity: ${quantity}`}
        >
          {quantity}
        </span>
        <button
          onClick={onIncrease}
          className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset"
          disabled={!canIncrease}
          aria-label="Increase quantity"
        >
          <Plus size={14} />
        </button>
      </div>
    );
  }
);

QuantityControls.displayName = "QuantityControls";

export default QuantityControls;
