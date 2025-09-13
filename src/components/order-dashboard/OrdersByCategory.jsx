import React, { memo } from "react";
import { BarChart3, Utensils } from "lucide-react";

const CategoryRow = memo(({ category, count, percentage, revenue }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
        <Utensils className="w-4 h-4 text-blue-600" />
      </div>
      <div>
        <p className="font-medium text-gray-900">{category}</p>
        <p className="text-sm text-gray-500">
          ₹{revenue?.toLocaleString()} revenue
        </p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-semibold text-gray-900">{count} orders</p>
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-gray-500">{percentage.toFixed(1)}%</span>
      </div>
    </div>
  </div>
));

const OrdersByCategory = memo(({ categoryData }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
    <div className="flex items-center gap-2 mb-6">
      <BarChart3 className="w-5 h-5 text-blue-500" />
      <h2 className="text-lg font-semibold text-gray-900">
        Orders by Category
      </h2>
    </div>
    <div className="space-y-2">
      {categoryData.map((item) => (
        <CategoryRow
          key={item.category}
          category={item.category}
          count={item.orderCount}
          percentage={item.percentage}
          revenue={item.revenue}
        />
      ))}
      {categoryData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No category data available
        </div>
      )}
    </div>
  </div>
));

OrdersByCategory.displayName = "OrdersByCategory";
export default OrdersByCategory;
