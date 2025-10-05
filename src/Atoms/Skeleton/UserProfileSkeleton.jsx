import React, { memo } from "react";

const UserProfileSkeleton = memo(() => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
    <div className="flex items-center space-x-4 mb-6">
      <div className="h-16 w-16 bg-gray-200 rounded-full" />
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-1" />
        <div className="h-3 bg-gray-200 rounded w-1/4" />
      </div>
    </div>

    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      ))}
    </div>
  </div>
));

UserProfileSkeleton.displayName = "UserProfileSkeleton";

export default UserProfileSkeleton;
