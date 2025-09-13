import React, { memo } from "react";
import { Utensils } from "lucide-react";

const EmptyState = memo(({ hasActiveFilters, onClearFilters }) => (
  <div className="text-center py-12">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Utensils className="w-10 h-10 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-700 mb-2">
      No menu items found
    </h3>
    <p className="text-gray-500 mb-6">
      {hasActiveFilters
        ? "Try adjusting your filters or search terms"
        : "No menu items are available at the moment"}
    </p>
    {hasActiveFilters && (
      <button
        onClick={onClearFilters}
        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
      >
        Clear All Filters
      </button>
    )}
  </div>
));

EmptyState.displayName = "EmptyState";

export default EmptyState;
