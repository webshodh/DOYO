// Separate component for discount badge
import React, { useMemo, memo } from "react";
const DiscountBadge = memo(({ discount }) => {
  if (!discount || discount <= 0) return null;

  return (
    <div className="absolute bottom-2 right-2 z-10">
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
        {discount}% OFF
      </div>
    </div>
  );
});

export default DiscountBadge.displayName = 'DiscountBadge';