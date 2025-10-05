import React from "react";

const SuperAdminFooter = ({
  stats = {},
  loading = false,
  platformHealth = "Good",
  customMessage = "",
  showHealthStatus = true,
  showStats = true,
  className = "",
}) => {
  // Default stats structure with fallback values
  const defaultStats = {
    activeHotels: 0,
    activeAdmins: 0,
    activeSubscriptions: 0,
    totalStates: 0,
    totalRevenue: 0,
    totalHotels: 0,
    geographicStats: {
      states: {},
    },
    ...stats,
  };

  // Calculate total states from geographic stats if not provided directly
  const totalStates =
    stats.totalStates ||
    Object.keys(defaultStats.geographicStats?.states || {}).length;

  // Revenue formatting
  const formattedRevenue = `₹${(defaultStats.totalRevenue / 1000).toFixed(1)}K`;

  // Health status configuration
  const healthConfig = {
    Excellent: { color: "text-green-600", bgColor: "bg-green-100" },
    Good: { color: "text-blue-600", bgColor: "bg-blue-100" },
    Average: { color: "text-yellow-600", bgColor: "bg-yellow-100" },
    Poor: { color: "text-red-600", bgColor: "bg-red-100" },
  };

  const currentHealth = healthConfig[platformHealth] || healthConfig.Good;

  // Stats configuration for easy customization
  const statsConfig = [
    {
      label: "Active Hotels",
      value: defaultStats.activeHotels,
      color: "text-green-600",
      show: true,
    },
    {
      label: "Active Admins",
      value: defaultStats.activeAdmins,
      color: "text-blue-600",
      show: true,
    },
    {
      label: "Subscriptions",
      value: defaultStats.activeSubscriptions,
      color: "text-purple-600",
      show: true,
    },
    {
      label: "States",
      value: totalStates,
      color: "text-orange-600",
      show: true,
    },
    {
      label: "Revenue",
      value: formattedRevenue,
      color: "text-red-600",
      show: true,
    },
  ];

  // Filter visible stats
  const visibleStats = statsConfig.filter((stat) => stat.show);

  if (loading) {
    return (
      <div className={`text-center py-6 animate-pulse ${className}`}>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm mb-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
              <div className="h-3 bg-gray-100 rounded w-20 mx-auto"></div>
            </div>
          ))}
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className={`text-center py-6 animate-fade-in-up ${className}`}>
      {/* Statistics Grid */}
      {showStats && (
        <div
          className={`grid grid-cols-2 sm:grid-cols-${Math.min(
            visibleStats.length,
            5
          )} gap-4 text-sm text-gray-600 mb-4`}
        >
          {visibleStats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center space-y-1">
              <span className={`font-semibold ${stat.color} text-lg`}>
                {stat.value}
              </span>
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer Information */}
      <div className="space-y-2">
        {/* Custom message or default platform info */}
        {customMessage ? (
          <p className="text-gray-500 text-sm">{customMessage}</p>
        ) : (
          <p className="text-gray-500 text-sm">
            Dashboard powered by Real-time Firestore Analytics • Data refreshed
            automatically
            {showHealthStatus && (
              <>
                {" • "}Platform Health:{" "}
                <span className={`font-semibold ${currentHealth.color}`}>
                  {platformHealth}
                </span>
              </>
            )}
            {" • "}Total Properties:{" "}
            <span className="font-semibold">{defaultStats.totalHotels}</span>
          </p>
        )}

        {/* Additional metadata */}
        <div className="text-xs text-gray-400 space-y-1">
          <p>
            Last Updated: {new Date().toLocaleString()} • Version 2.1.0 •
            <span className="text-blue-500 hover:text-blue-700 cursor-pointer ml-1">
              System Status
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminFooter;
