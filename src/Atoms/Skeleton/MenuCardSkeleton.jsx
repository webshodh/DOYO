import React, { memo } from "react";

const MenuCardSkeleton = memo(() => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
    <div className="h-32 bg-gray-200 rounded-lg mb-3" />
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-1/4" />
    </div>
  </div>
));

MenuCardSkeleton.displayName = "MenuCardSkeleton";

export default MenuCardSkeleton;
