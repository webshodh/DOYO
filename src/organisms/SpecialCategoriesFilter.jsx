import React, { memo } from "react";
import { Star } from "lucide-react";

const SpecialCategoriesFilter = memo(
  ({ categories, selectedFilters, onToggle, counts }) => {
    if (!categories.length) return null;

    return (
      <div className="mb-2">
        {/* <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-orange-500" />
          Special Categories
        </h3> */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => {
            const isSelected = selectedFilters.includes(category.name);
            const count = counts[category.name] || 0;
            const Icon = category.icon || Star;

            return (
              <button
                key={category.name}
                onClick={() => onToggle(category.name)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  isSelected
                    ? `${
                        category.activeColor || "bg-blue-500"
                      } text-white border-transparent shadow-lg`
                    : `${category.bgColor || "bg-white"} ${
                        category.iconColor || "text-gray-600"
                      } ${
                        category.borderColor || "border-gray-300"
                      } hover:shadow-md hover:border-gray-400`
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium whitespace-nowrap">
                  {category.label}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

SpecialCategoriesFilter.displayName = "SpecialCategoriesFilter";

export default SpecialCategoriesFilter;
