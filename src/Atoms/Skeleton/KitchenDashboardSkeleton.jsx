import React, { memo } from "react";

const KitchenDashboardSkeleton = memo(() => (
  <div className="space-y-6 animate-pulse">
    {/* Time Period Navigation Skeleton */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          <div className="h-10 bg-gray-200 rounded-lg w-32" />
          <div className="h-10 bg-gray-200 rounded-lg w-40" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-24" />
      </div>
    </div>

    {/* Stats Cards Skeleton - Reusing StatCard pattern */}
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

    {/* Order Filters Skeleton */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="flex space-x-3">
          <div className="h-10 bg-gray-200 rounded-lg w-32" />
          <div className="h-10 bg-gray-200 rounded-lg w-24" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((filter) => (
          <div key={filter} className="h-12 bg-gray-200 rounded-lg" />
        ))}
      </div>
    </div>

    {/* Orders Grid Skeleton */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((order) => (
            <OrderCardSkeleton key={order} />
          ))}
        </div>
        <div className="mt-6 text-center">
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto" />
        </div>
      </div>
    </div>
  </div>
));

// Order Card Skeleton Component - Reusable for other components
const OrderCardSkeleton = memo(() => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
    {/* Order Header */}
    <div className="flex items-center justify-between mb-3">
      <div className="h-4 bg-gray-200 rounded w-16" />
      <div className="h-6 bg-gray-200 rounded-full w-20" />
    </div>

    {/* Customer Info */}
    <div className="flex items-center space-x-3 mb-4">
      <div className="h-10 w-10 bg-gray-200 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>

    {/* Order Items */}
    <div className="space-y-2 mb-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex items-center justify-between">
          <div className="h-3 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-8" />
        </div>
      ))}
    </div>

    {/* Order Total and Time */}
    <div className="flex items-center justify-between mb-4">
      <div className="h-5 bg-gray-200 rounded w-16" />
      <div className="h-4 bg-gray-200 rounded w-12" />
    </div>

    {/* Action Buttons */}
    <div className="flex space-x-2">
      <div className="h-8 bg-gray-200 rounded flex-1" />
      <div className="h-8 bg-gray-200 rounded flex-1" />
    </div>
  </div>
));

OrderCardSkeleton.displayName = "OrderCardSkeleton";
KitchenDashboardSkeleton.displayName = "KitchenDashboardSkeleton";

export { OrderCardSkeleton };
export default KitchenDashboardSkeleton;
