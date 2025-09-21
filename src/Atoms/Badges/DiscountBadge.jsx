// DiscountBadge.js - Fixed positioning and z-index
import React, { memo } from "react";
import { Percent } from "lucide-react";

const DiscountBadge = memo(({ discount }) => {
  if (!discount || discount <= 0) return null;

  return (
    <div className="absolute top-0 left-0 z-30">
      <div className="relative overflow-hidden bg-gradient-to-r from-red-500 via-orange-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 border border-white/20">
        {/* Background shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-pulse" />

        {/* Content */}
        <div className="relative z-10 flex items-center gap-1">
          <Percent className="w-3 h-3" />
          <span>{Math.round(discount)} OFF</span>
        </div>
      </div>
    </div>
  );
});

DiscountBadge.displayName = "DiscountBadge";
export default DiscountBadge;
