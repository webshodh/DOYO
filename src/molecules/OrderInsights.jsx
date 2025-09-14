// components/shared/OrderInsights.jsx
import { formatCurrency } from "Constants/orderConfig";
import React from "react";

export const OrderInsights = ({ analytics }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Insights
      </h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Success Rate</span>
          <span className="font-semibold text-green-600">
            {analytics.successRate}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Rejection Rate</span>
          <span className="font-semibold text-red-600">
            {analytics.rejectionRate}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Avg Order Value</span>
          <span className="font-semibold text-purple-600">
            {formatCurrency(analytics.avgOrderValue)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Peak Hour</span>
          <span className="font-semibold text-orange-600">
            {analytics.peakHour}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Unique Customers</span>
          <span className="font-semibold text-blue-600">
            {analytics.uniqueCustomers}
          </span>
        </div>
      </div>
    </div>
  );
};
