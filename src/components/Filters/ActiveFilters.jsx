import React, { memo } from "react";
import { Filter, Search, Utensils, Award } from "lucide-react";
import FilterBadge from "../../atoms/Badges/FilterBadge";
import { specialCategories } from "Constants/ConfigForms/addMenuFormConfig";

const ActiveFilters = memo(
  ({
    specialFilters,
    category,
    mainCategory,
    searchTerm,
    onRemoveSpecial,
    onRemoveCategory,
    onRemoveMainCategory,
    onClearSearch,
    onClearAll,
  }) => {
    const hasFilters =
      specialFilters.length > 0 || category || mainCategory || searchTerm;

    if (!hasFilters) return null;

    return (
      <div className="mb-1 p-2 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Active Filters
          </h4>
          <button
            onClick={onClearAll}
            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            Clear All
          </button>
        </div>

        {/*Currently hide this to save space but this is a working functionality  */}
        {/* <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <FilterBadge
              label={`Search: "${searchTerm}"`}
              onRemove={onClearSearch}
              variant="default"
              icon={Search}
            />
          )}

          {specialFilters.map((filter) => {
            const categoryData = specialCategories.find(
              (c) => c.name === filter
            );
            return (
              <FilterBadge
                key={filter}
                label={categoryData?.label || filter}
                onRemove={() => onRemoveSpecial(filter)}
                variant="special"
                icon={categoryData?.icon}
              />
            );
          })}

          {category && (
            <FilterBadge
              label={category}
              onRemove={onRemoveCategory}
              variant="category"
              icon={Utensils}
            />
          )}

          {mainCategory && (
            <FilterBadge
              label={mainCategory}
              onRemove={onRemoveMainCategory}
              variant="main"
              icon={Award}
            />
          )}
        </div> */}
      </div>
    );
  },
);

ActiveFilters.displayName = "ActiveFilters";

export default ActiveFilters;
