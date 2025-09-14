import React, { memo } from "react";
import { Grid, List } from "lucide-react";

const ResultsSummary = memo(
  ({
    totalResults,
    filteredResults,
    hasFilters,
    viewMode,
    onViewModeChange,
  }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-1 p-1 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-2">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredResults}</span> items
          {hasFilters && (
            <span className="text-gray-500">
              {" "}
              (filtered from {totalResults} total)
            </span>
          )}
        </p>
      </div>
    </div>
  )
);

ResultsSummary.displayName = "ResultsSummary";

export default ResultsSummary;
