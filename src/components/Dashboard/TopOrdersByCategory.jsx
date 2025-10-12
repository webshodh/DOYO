// components/dashboard/TopOrdersByCategory.jsx
import React, { useMemo } from "react";
import DynamicTable from "../DynamicTable";
import { BarChart3 } from "lucide-react";

const TopOrdersByCategory = ({ topOrdersByCategory = [] }) => {
  const categoryTableColumns = useMemo(
    () => [
      {
        header: "Rank",
        accessor: "rank",
        Cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm shadow-lg">
              {row.index + 1}
            </span>
          </div>
        ),
      },
      {
        header: "Category",
        accessor: "category",
        Cell: ({ value }) => (
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 mr-3 shadow-sm"></div>
            <span className="font-semibold text-gray-900 text-sm">{value}</span>
          </div>
        ),
      },
      {
        header: "Orders",
        accessor: "orderCount",
        Cell: ({ value }) => (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 shadow-sm">
            {value}
          </span>
        ),
      },
      {
        header: "Revenue",
        accessor: "totalRevenue",
        Cell: ({ value }) => (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-sm">
            ₹
            {parseFloat(value).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ),
      },
    ],
    []
  );

  if (!topOrdersByCategory.length) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-900">
              Category Performance
            </h2>
            <p className="text-sm text-blue-700">
              Top performing categories by orders
            </p>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <DynamicTable
          columns={categoryTableColumns}
          data={topOrdersByCategory}
        />
      </div>
    </div>
  );
};

export default TopOrdersByCategory;
