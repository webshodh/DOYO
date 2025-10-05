import React, { memo } from "react";

const TabNavigationSkeleton = memo(() => (
  <div className="bg-white rounded-xl shadow-sm border p-4 animate-pulse">
    <div className="flex space-x-8 border-b border-gray-200">
      {[1, 2, 3, 4].map((tab) => (
        <div key={tab} className="pb-4">
          <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
          <div className="h-1 bg-gray-200 rounded w-full" />
        </div>
      ))}
    </div>
  </div>
));

TabNavigationSkeleton.displayName = "TabNavigationSkeleton";

export default TabNavigationSkeleton;
