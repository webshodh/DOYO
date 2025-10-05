import React, { memo } from "react";

const TableSkeleton = memo(({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
    {/* Table Header */}
    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: columns }, (_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-3/4" />
        ))}
      </div>
    </div>

    {/* Table Rows */}
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="px-6 py-4">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: columns }, (_, j) => (
              <div key={j} className="h-4 bg-gray-200 rounded w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
));

TableSkeleton.displayName = "TableSkeleton";

export default TableSkeleton;
