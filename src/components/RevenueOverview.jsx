// components/dashboard/RevenueOverview.jsx
import React from "react";
import { DollarSign } from "lucide-react";

const RevenueOverview = ({ displayStats }) => {
  if (!displayStats) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Revenue Insights
        </h3>
        <DollarSign className="w-5 h-5 text-gray-400" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
          <div className="text-3xl font-bold text-green-600 mb-2">
            ₹{(displayStats.revenue || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-sm text-green-700 font-medium">
            Total Revenue
          </div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            ₹{(displayStats.avgOrderValue || 0).toFixed(0)}
          </div>
          <div className="text-sm text-blue-700 font-medium">Average Order</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {displayStats.rejectionRate || 0}%
          </div>
          <div className="text-sm text-purple-700 font-medium">
            Rejection Rate
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueOverview;
