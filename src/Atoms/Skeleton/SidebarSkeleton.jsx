import React, { memo } from "react";

const SidebarSkeleton = memo(() => (
  <div className="w-64 bg-white shadow-lg border-r border-gray-200 h-screen animate-pulse">
    {/* Logo Section */}
    <div className="p-4 border-b border-gray-200">
      <div className="h-8 bg-gray-200 rounded w-3/4" />
    </div>

    {/* Navigation Items */}
    <div className="p-4 space-y-3">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
        <div key={item} className="flex items-center space-x-3 p-2">
          <div className="h-5 w-5 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded flex-1" />
        </div>
      ))}
    </div>

    {/* Bottom Section */}
    <div className="absolute bottom-4 left-4 right-4">
      <div className="flex items-center space-x-3 p-2">
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-1" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    </div>
  </div>
));

SidebarSkeleton.displayName = "SidebarSkeleton";

export default SidebarSkeleton;
