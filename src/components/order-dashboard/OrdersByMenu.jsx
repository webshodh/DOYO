import React, { memo } from "react";
import { ShoppingBag } from "lucide-react";

const MenuRow = memo(({ menuName, count, percentage, revenue, imageUrl }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center gap-3">
      <div>
        <p className="font-medium text-gray-900">{menuName}</p>
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
            className="h-full bg-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-gray-500">{percentage.toFixed(1)}%</span>
      </div>
    </div>
  </div>
));

const OrdersByMenu = memo(({ menuData }) => (
  <div className="p-6">
    <div className="flex items-center gap-2 mb-6">
      <ShoppingBag className="w-5 h-5 text-purple-500" />
      <h2 className="text-lg font-semibold text-gray-900">Orders by Menu</h2>
    </div>
    <div className="space-y-2">
      {menuData.map((item) => (
        <MenuRow
          key={item.menuName}
          menuName={item.menuName}
          count={item.orderCount}
          percentage={item.percentage}
          revenue={item.revenue}
          //   imageUrl={item.imageUrl}
        />
      ))}
      {menuData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No menu data available
        </div>
      )}
    </div>
  </div>
));

OrdersByMenu.displayName = "OrdersByMenu";
export default OrdersByMenu;
