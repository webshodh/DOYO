// components/dashboard/TopOrdersByMenu.jsx
import React, { useMemo } from "react";
import DynamicTable from "../DynamicTable";
import { TrendingUp } from "lucide-react";

const TopOrdersByMenu = ({ topOrdersByMenu = [] }) => {
  const menuTableColumns = useMemo(
    () => [
      {
        Header: "Rank",
        accessor: "rank",
        Cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white font-bold text-sm shadow-lg">
              {row.index + 1}
            </span>
          </div>
        ),
      },
      {
        Header: "Menu Item",
        accessor: "menuName",
        Cell: ({ row }) => (
          <div className="py-1">
            <p className="font-semibold text-gray-900 text-sm">
              {row.original.menuName}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                {row.original.category}
              </span>
            </p>
          </div>
        ),
      },
      {
        Header: "Orders",
        accessor: "orderCount",
        Cell: ({ value }) => (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 shadow-sm">
            {value}
          </span>
        ),
      },
      {
        Header: "Revenue",
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

  if (!topOrdersByMenu.length) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
      <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500 rounded-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-green-900">
              Menu Item Analytics
            </h2>
            <p className="text-sm text-green-700">
              Detailed performance breakdown
            </p>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <DynamicTable columns={menuTableColumns} data={topOrdersByMenu} />
      </div>
    </div>
  );
};

export default TopOrdersByMenu;
