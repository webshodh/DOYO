import React, { memo } from "react";

const OrderFilters = memo(
  ({
    activeFilter,
    onFilterChange,
    selectedDate,
    onDateChange,
    orderStats,
    totalOrders,
  }) => {
    const filterOptions = [
      { key: "all", label: "All Orders", count: totalOrders },
      { key: "received", label: "Pending", count: orderStats.pending },
      { key: "preparing", label: "Preparing", count: orderStats.preparing },
      { key: "ready", label: "Ready", count: orderStats.ready },
      { key: "completed", label: "Completed", count: orderStats.completed },
      { key: "rejected", label: "Rejected", count: orderStats.rejected },
    ];

    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => onFilterChange(filter.key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === filter.key
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>
    );
  },
);

OrderFilters.displayName = "OrderFilters";

export default OrderFilters;
