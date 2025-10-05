import React, { memo } from "react";

const StatCardSkeleton = memo(() => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-8 w-8 bg-gray-200 rounded-full" />
    </div>
    <div className="space-y-2">
      <div className="h-8 bg-gray-200 rounded w-3/4" />
      <div className="flex items-center space-x-2">
        <div className="h-3 bg-gray-200 rounded w-16" />
        <div className="h-3 bg-gray-200 rounded w-20" />
      </div>
    </div>
  </div>
));

StatCardSkeleton.displayName = "StatCardSkeleton";

export default StatCardSkeleton;
