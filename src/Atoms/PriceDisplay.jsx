import React, { memo } from "react";

const PriceDisplay = memo(
  ({ originalPrice, finalPrice, discount, currency = "₹", item }) => {
    // Support both new prop structure and legacy item structure
    const menuPrice = originalPrice || item?.menuPrice;
    const price = finalPrice || item?.finalPrice || menuPrice;
    const discountValue = discount || item?.discount;

    const hasDiscount = discountValue > 0;
    const savings = hasDiscount ? Math.round(menuPrice - price) : 0;

    return (
      <div className="flex items-center flex-wrap gap-1">
        {hasDiscount && (
          <span className="line-through text-gray-400 text-sm">
            {currency}
            {Math.round(menuPrice)}
          </span>
        )}
        <span className="text-orange-600 text-lg sm:text-xl font-bold">
          {currency}
          {price}
        </span>
        {savings > 0 && (
          <span className="text-green-600 text-xs font-medium bg-green-50 px-1 py-0.5 rounded border border-green-200">
            Save {currency}
            {savings}
          </span>
        )}
      </div>
    );
  },
);

PriceDisplay.displayName = "PriceDisplay";

export default PriceDisplay;
