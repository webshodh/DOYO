import React, { memo } from "react";
import { Star, Flame } from "lucide-react";
import { TagsContainer } from "atoms/Badges/Tags";

const SpecialBadges = memo(({ modalData }) => {
  const hasDiscount = modalData.discount && modalData.discount > 0;
  const discountPercentage = hasDiscount ? Math.round(modalData.discount) : 0;

  return (
    <div className="absolute top-4 left-4 z-40 flex flex-col gap-2">
      {hasDiscount ? (
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 border-2 border-white/20">
          {/* Animated background shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse" />

          {/* Pulsing glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full blur-sm animate-ping opacity-30" />

          {/* Content */}
          <div className="relative z-10 flex items-center gap-2">
            <div className="relative">
              <Star className="w-4 h-4 fill-current animate-bounce" />
              <div className="absolute inset-0 w-4 h-4 bg-yellow-300 rounded-full blur-sm opacity-50 animate-pulse" />
            </div>
            <span className="font-extrabold tracking-wide text-shadow">
              {discountPercentage}% OFF
            </span>
            <Flame className="w-3 h-3 text-yellow-300 animate-pulse" />
          </div>

          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-300 rounded-full transform translate-x-1 -translate-y-1 animate-ping" />
        </div>
      ) : null}
      <TagsContainer data={modalData} categories={["features"]} />
    </div>
  );
});

SpecialBadges.displayName = "SpecialBadges";

export default SpecialBadges;
