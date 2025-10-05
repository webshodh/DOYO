import React, { memo } from "react";

const CustomerDashboardSkeleton = memo(({ activeTab }) => {
  const renderOverviewSkeleton = () => (
    <>
      {/* Stats Cards - Reusing StatCardSkeleton pattern */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3, 4, 5, 6].map((stat) => (
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

      {/* Top Customers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((section) => (
          <div
            key={section}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
          >
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((customer) => (
                <div
                  key={customer}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full" />
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
    </>
  );

  const renderSegmentsSkeleton = () => (
    <>
      {/* Customer Segmentation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {[1, 2, 3, 4, 5].map((segment) => (
          <div
            key={segment}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
          >
            <div className="text-center space-y-3">
              <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto" />
              <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
            </div>
          </div>
        ))}
      </div>

      {/* Customer Table - Reusing table skeleton pattern */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden animate-pulse">
        <div className="p-6">
          {/* Search and Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="flex space-x-4">
              <div className="h-10 bg-gray-200 rounded-lg w-64" />
              <div className="h-10 bg-gray-200 rounded w-32" />
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((header) => (
                  <div key={header} className="h-4 bg-gray-200 rounded w-3/4" />
                ))}
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                <div key={row} className="px-6 py-4">
                  <div className="grid grid-cols-5 gap-4 items-center">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-200 rounded-full" />
                      <div className="h-4 bg-gray-200 rounded w-24" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-4 bg-gray-200 rounded w-16" />
                    <div className="h-4 bg-gray-200 rounded w-20" />
                    <div className="h-4 bg-gray-200 rounded w-12" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderAnalyticsSkeleton = () => (
    <>
      {/* Analytics Charts - Reusing chart skeleton pattern */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
              {[1, 2, 3].map((legend) => (
                <div key={legend} className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-gray-200 rounded-full" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((card) => (
          <div
            key={card}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
          >
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="space-y-8">
      {activeTab === "overview" && renderOverviewSkeleton()}
      {activeTab === "segments" && renderSegmentsSkeleton()}
      {activeTab === "analytics" && renderAnalyticsSkeleton()}
    </div>
  );
});

CustomerDashboardSkeleton.displayName = "CustomerDashboardSkeleton";

export default CustomerDashboardSkeleton;
