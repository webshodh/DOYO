import React, { memo } from "react";

const CategoryIndicator = memo(({ categoryType }) => {
  const isVeg = categoryType === "Veg" || categoryType === "veg";
  const isNonVeg = [
    "Nonveg",
    "Non Veg",
    "Non-veg",
    "non-veg",
    "nonveg",
  ].includes(categoryType);

  if (!isVeg && !isNonVeg) return null;

  return (
    <div className="absolute top-2 right-2 z-10">
      <div className="bg-white rounded-full p-1 shadow-md border border-gray-100">
        <img
          src={isVeg ? "/veglogo.jpeg" : "/nonVeglogo.png"}
          alt={isVeg ? "Vegetarian" : "Non-vegetarian"}
          className="w-3 h-3"
        />
      </div>
    </div>
  );
});

CategoryIndicator.displayName = "CategoryIndicator";

export default CategoryIndicator;
