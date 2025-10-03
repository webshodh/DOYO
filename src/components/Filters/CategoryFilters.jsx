import React, { memo } from "react";

const CategoryFilters = memo(
  ({ categories, selectedCategory, onCategorySelect, className = "" }) => (
    <div className={`overflow-x-auto pb-2 ${className}`}>
      <div className="flex space-x-2 min-w-max">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategorySelect(category)}
            className={`px-3 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              selectedCategory === category
                ? "bg-orange-500 text-white shadow-md transform scale-105"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-102"
            }`}
            aria-pressed={selectedCategory === category}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  ),
);

CategoryFilters.displayName = "CategoryFilters";
export default CategoryFilters;
