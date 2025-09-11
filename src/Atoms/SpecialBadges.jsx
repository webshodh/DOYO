import React, { memo } from "react";
import { Star } from "lucide-react";
import { TagsContainer } from "Atoms/Tags";

const SpecialBadges = memo(({ modalData }) => {
  const hasDiscount = modalData.discount && modalData.discount > 0;
  const discountPercentage = hasDiscount ? Math.round(modalData.discount) : 0;

  return (
    <div className="absolute top-4 left-4 z-40 flex flex-col gap-2">
      {hasDiscount && (
        <div className="bg-gradient-to-r from-green-500 to-yellow-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg animate-pulse flex items-center gap-1">
          <Star className="w-3 h-3" />
          {discountPercentage}% OFF
        </div>
      )}
      <TagsContainer data={modalData} categories={["features"]} />
    </div>
  );
});

SpecialBadges.displayName = "SpecialBadges";

export default SpecialBadges;
