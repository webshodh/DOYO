import React, { memo } from "react";

const ChartCardSkeleton = memo(() => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-2">
        <div className="h-5 bg-gray-200 rounded w-32" />
        <div className="h-3 bg-gray-200 rounded w-24" />
      </div>
      <div className="flex space-x-2">
        <div className="h-8 w-16 bg-gray-200 rounded" />
        <div className="h-8 w-8 bg-gray-200 rounded" />
      </div>
    </div>

    {/* Chart Area */}
    <div className="h-64 bg-gray-200 rounded-lg mb-4" />

    {/* Legend/Footer */}
    <div className="flex items-center justify-center space-x-6">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="flex items-center space-x-2">
          <div className="h-3 w-3 bg-gray-200 rounded-full" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
      ))}
    </div>
  </div>
));

ChartCardSkeleton.displayName = "ChartCardSkeleton";

export default ChartCardSkeleton;
