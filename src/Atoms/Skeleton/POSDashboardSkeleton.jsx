import React, { memo } from "react";

const POSDashboardSkeleton = memo(() => (
  <div className="min-h-screen bg-gray-50 flex animate-pulse">
    {/* Menu Section - Left Side */}
    <div className="flex-1 flex flex-col">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-xl shadow-lg p-4 sm:p-6 mb-4">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>

      {/* Search & Sort Skeleton */}
      <div className="mb-3 px-4">
        <div className="flex items-center justify-between">
          <div className="h-10 bg-gray-200 rounded-lg w-64" />
          <div className="flex space-x-3">
            <div className="h-10 bg-gray-200 rounded-lg w-32" />
            <div className="h-10 bg-gray-200 rounded-lg w-24" />
          </div>
        </div>
      </div>

      {/* Category Tabs Skeleton */}
      <div className="px-4 mb-4">
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5, 6].map((tab) => (
            <div
              key={tab}
              className="h-10 bg-gray-200 rounded-full w-24 flex-shrink-0"
            />
          ))}
        </div>
      </div>

      {/* Menu Items Grid Skeleton */}
      <div className="p-4">
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item) => (
            <MenuItemCardSkeleton key={item} />
          ))}
        </div>
      </div>
    </div>

    {/* Cart Section - Right Side */}
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
      {/* Cart Header Skeleton */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 bg-gray-200 rounded" />
            <div className="h-6 bg-gray-200 rounded w-24" />
          </div>
          <div className="h-8 bg-gray-200 rounded-full w-16" />
        </div>
      </div>

      {/* Cart Items Skeleton */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <CartItemSkeleton key={item} />
          ))}
        </div>
      </div>

      {/* Cart Summary Skeleton */}
      <div className="border-t border-gray-200 p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-16" />
            <div className="h-4 bg-gray-200 rounded w-12" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-12" />
          </div>
          <div className="flex justify-between border-t pt-2">
            <div className="h-6 bg-gray-200 rounded w-12" />
            <div className="h-6 bg-gray-200 rounded w-16" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-12 bg-gray-200 rounded-xl w-full" />
          <div className="h-10 bg-gray-200 rounded-xl w-full" />
        </div>
      </div>
    </div>
  </div>
));

// Menu Item Card Skeleton Component
const MenuItemCardSkeleton = memo(() => (
  <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
    {/* Image placeholder */}
    <div className="aspect-square bg-gray-200 rounded-lg" />

    {/* Title */}
    <div className="h-4 bg-gray-200 rounded w-3/4" />

    {/* Price */}
    <div className="h-5 bg-gray-200 rounded w-1/2" />

    {/* Add button */}
    <div className="h-8 bg-gray-200 rounded w-full" />
  </div>
));

// Cart Item Skeleton Component
const CartItemSkeleton = memo(() => (
  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
    {/* Item header */}
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
      <div className="h-6 w-6 bg-gray-200 rounded" />
    </div>

    {/* Quantity controls and price */}
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
        <div className="h-6 bg-gray-200 rounded w-8" />
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
      </div>
      <div className="h-5 bg-gray-200 rounded w-16" />
    </div>
  </div>
));

POSDashboardSkeleton.displayName = "POSDashboardSkeleton";
MenuItemCardSkeleton.displayName = "MenuItemCardSkeleton";
CartItemSkeleton.displayName = "CartItemSkeleton";

// Export individual components for potential reuse
export { MenuItemCardSkeleton, CartItemSkeleton };
export default POSDashboardSkeleton;
