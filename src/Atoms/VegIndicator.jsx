import React, { memo } from "react";

const VegIndicator = memo(({ isVeg, size = "sm" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const dotSizeClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  return (
    <div
      className={`${sizeClasses[size]} border-2 ${
        isVeg ? "border-green-500" : "border-red-500"
      } bg-white rounded-sm flex items-center justify-center`}
      aria-label={isVeg ? "Vegetarian item" : "Non-vegetarian item"}
      role="img"
    >
      <div
        className={`${dotSizeClasses[size]} ${
          isVeg ? "bg-green-500" : "bg-red-500"
        } rounded-full`}
      />
    </div>
  );
});

VegIndicator.displayName = "VegIndicator";

export default VegIndicator;
