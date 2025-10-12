import React, { memo } from "react";

const DashboardContentSkeleton = memo(({ activeTab, hasOrders }) => {
  const renderOverviewSkeleton = () => (
    <>
      {/* Stats Cards Row */}
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

      {/* Charts Section */}
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

      {/* Platform Analytics Grid */}
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

  const renderRecentOrdersSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden animate-pulse">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-gray-200 rounded" />
            <div className="h-6 bg-gray-200 rounded w-32" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-40" />
        </div>

        {/* Table Header */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((header) => (
                <div key={header} className="h-4 bg-gray-200 rounded w-3/4" />
              ))}
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-200">
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="px-6 py-4">
                <div className="grid grid-cols-6 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((cell) => (
                    <div
                      key={cell}
                      className="h-4 bg-gray-200 rounded w-full"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
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

  return (
    <div className="space-y-8">
      {activeTab === "overview" && renderOverviewSkeleton()}
      {activeTab === "platforms" && renderPlatformsSkeleton()}
      {activeTab === "recentOrders" &&
        hasOrders &&
        renderRecentOrdersSkeleton()}
      {activeTab === "performance" && renderPerformanceSkeleton()}
    </div>
  );
});

DashboardContentSkeleton.displayName = "DashboardContentSkeleton";
export default DashboardContentSkeleton;
