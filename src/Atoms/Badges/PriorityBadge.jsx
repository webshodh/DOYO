// PriorityBadge.js - Fixed positioning and z-index
import React, { useMemo, memo } from "react";
import { Star, ChefHat, TrendingUp, Award, Heart } from "lucide-react";

const PriorityBadge = memo(({ item }) => {
  const badge = useMemo(() => {
    if (item.chefSpecial) {
      return {
        text: "Chef's Special",
        color: "from-purple-500 to-pink-500",
        icon: <ChefHat className="w-3 h-3" />,
      };
    }
    if (item.isMostOrdered) {
      return {
        text: "Most Ordered",
        color: "from-rose-500 to-red-500",
        icon: <TrendingUp className="w-3 h-3" />,
      };
    }
    if (item.isPopular) {
      return {
        text: "Popular",
        color: "from-yellow-500 to-orange-500",
        icon: <Star className="w-3 h-3" />,
      };
    }
    if (item.isRecommended) {
      return {
        text: "Recommended",
        color: "from-blue-500 to-indigo-500",
        icon: <Heart className="w-3 h-3" />,
      };
    }
    if (item.isLimitedEdition) {
      return {
        text: "Limited",
        color: "from-indigo-500 to-purple-500",
        icon: <Award className="w-3 h-3" />,
      };
    }
    if (item.isSeasonal) {
      return {
        text: "Seasonal",
        color: "from-amber-500 to-orange-500",
        icon: <Star className="w-3 h-3" />,
      };
    }
    return null;
  }, [item]);

  if (!badge) return null;

  return (
    <div className="absolute bottom-0 left-0 z-20" style={{ width: "112px" }}>
      <div
        className={`bg-gradient-to-r ${badge.color} text-white px-2 py-1 rounded-half text-xs font-bold shadow-lg flex items-center gap-1 animate-fadeIn border border-white/20`}
      >
        {badge.icon}
        <span className="whitespace-nowrap">{badge.text}</span>
      </div>
    </div>
  );
});

PriorityBadge.displayName = "PriorityBadge";
export default PriorityBadge;
