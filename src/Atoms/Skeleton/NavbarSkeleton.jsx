import React, { memo } from "react";

const NavbarSkeleton = memo(() => (
  <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 animate-pulse">
    <div className="flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <div className="h-6 w-6 bg-gray-200 rounded" />
        <div className="h-6 bg-gray-200 rounded w-32" />
      </div>

      {/* Center Section */}
      <div className="hidden md:flex items-center space-x-4">
        <div className="h-10 bg-gray-200 rounded-lg w-80" />
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        <div className="h-6 w-6 bg-gray-200 rounded" />
        <div className="h-6 w-6 bg-gray-200 rounded" />
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
      </div>
    </div>
  </div>
));

NavbarSkeleton.displayName = "NavbarSkeleton";

export default NavbarSkeleton;
