// atoms/Skeleton/CaptainManagementSkeleton.jsx
import React, { memo } from "react";

const CaptainManagementSkeleton = memo(() => (
  <div className="min-h-screen bg-gray-50 animate-pulse">
    {/* Header Skeleton */}
    <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-xl shadow-lg p-4 sm:p-6 mb-4">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>

    {/* Stats Cards Skeleton */}
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
      {[1, 2, 3, 4].map((stat) => (
        <div
          key={stat}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
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
      ))}
    </div>

    {/* Search Section Skeleton */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="h-10 bg-gray-200 rounded-lg w-full" />
        </div>
        <div className="flex items-center space-x-4">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-10 bg-gray-200 rounded-lg w-24" />
        </div>
      </div>
    </div>

    {/* Table Skeleton */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <CaptainTableSkeleton />
    </div>
  </div>
));

// Captain Table Skeleton Component
const CaptainTableSkeleton = memo(() => (
  <div className="animate-pulse">
    {/* Table Header */}
    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
      <div className="grid grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((header) => (
          <div key={header} className="h-4 bg-gray-200 rounded w-3/4" />
        ))}
      </div>
    </div>

    {/* Table Rows */}
    <div className="divide-y divide-gray-200">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
        <div key={row} className="px-6 py-4">
          <div className="grid grid-cols-6 gap-4 items-center">
            {/* Avatar + Name Column */}
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full" />
              <div className="space-y-1">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
            </div>

            {/* Other Columns */}
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-6 bg-gray-200 rounded-full w-16" />
            <div className="h-4 bg-gray-200 rounded w-16" />

            {/* Actions Column */}
            <div className="flex space-x-2">
              <div className="h-8 w-8 bg-gray-200 rounded" />
              <div className="h-8 w-8 bg-gray-200 rounded" />
              <div className="h-8 w-8 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
));

CaptainManagementSkeleton.displayName = "CaptainManagementSkeleton";
CaptainTableSkeleton.displayName = "CaptainTableSkeleton";

export { CaptainTableSkeleton };
export default CaptainManagementSkeleton;
