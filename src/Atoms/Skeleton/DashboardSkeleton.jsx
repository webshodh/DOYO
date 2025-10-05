import React, { memo } from "react";

const DashboardSkeleton = memo(({ activeTab, isOrderEnabled }) => {
  const renderOverviewSkeleton = () => (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((stat) => (
          <div
            key={stat}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((chart) => (
          <div
            key={chart}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
          >
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
            <div className="h-64 bg-gray-200 rounded-lg mb-4" />
            <div className="flex items-center justify-center space-x-6">
              {[1, 2, 3, 4].map((legend) => (
                <div key={legend} className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-gray-200 rounded-full" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const renderPlatformsSkeleton = () => (
    <>
      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((filter) => (
            <div key={filter}>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-10 bg-gray-200 rounded-lg w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Platform Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((card) => (
          <div
            key={card}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
          >
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-48 bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>
    </>
  );

  const renderMenuSkeleton = () => (
    <>
      {/* Menu Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((stat) => (
          <div
            key={stat}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-6 w-6 bg-gray-200 rounded" />
            </div>
            <div className="h-8 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div
            key={item}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse"
          >
            <div className="h-32 bg-gray-200 rounded-lg mb-3" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const renderPerformanceSkeleton = () => (
    <div className="space-y-8">
      {[1, 2, 3].map((section) => (
        <div
          key={section}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
        >
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-200 rounded w-20" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-16" />
                  <div className="h-3 bg-gray-200 rounded w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // Default fallback - always show overview skeleton if no matching tab
  const renderDefaultSkeleton = () => renderOverviewSkeleton();

  return (
    <div className="space-y-8 animate-pulse">
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-gray-500 p-2 bg-yellow-100 rounded">
          Debug: activeTab="{activeTab}", isOrderEnabled=
          {isOrderEnabled?.toString()}
        </div>
      )}

      {/* Render based on activeTab with fallbacks */}
      {(() => {
        switch (activeTab) {
          case "overview":
            return isOrderEnabled
              ? renderOverviewSkeleton()
              : renderDefaultSkeleton();
          case "platforms":
            return isOrderEnabled
              ? renderPlatformsSkeleton()
              : renderDefaultSkeleton();
          case "menu":
            return renderMenuSkeleton();
          case "performance":
            return isOrderEnabled
              ? renderPerformanceSkeleton()
              : renderDefaultSkeleton();
          default:
            // Always show default skeleton if no matching tab
            return renderDefaultSkeleton();
        }
      })()}
    </div>
  );
});

DashboardSkeleton.displayName = "DashboardSkeleton";

export default DashboardSkeleton;
