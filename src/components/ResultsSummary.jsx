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
  )
);

ResultsSummary.displayName = "ResultsSummary";

export default ResultsSummary;
