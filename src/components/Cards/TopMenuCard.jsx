import React, { memo } from "react";
import { TrendingUp, Award, Star } from "lucide-react";

const TopMenuCard = memo(({ menu, rank, orders, revenue }) => {
  // Safe property access with fallbacks
  const safeMenu = menu || {};
  const menuName = safeMenu.menuName || "Unknown Menu";
  const menuCategory = safeMenu.category || "No Category";
  const imageUrl = safeMenu.imageUrl || "/dish.png";
  const safeOrders = orders || 0;
  const safeRevenue = revenue || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={imageUrl}
            alt={menuName}
            className="w-16 h-16 rounded-lg object-cover"
            onError={(e) => {
              e.target.src = "/dish.png";
            }}
          />
          <div className="absolute -top-2 -left-2 bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {rank || 0}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{menuName}</h3>
          <p className="text-sm text-gray-600">{menuCategory}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center text-sm font-medium text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              {safeOrders} orders
            </span>
            <span className="text-sm font-medium text-purple-600">
              ₹{safeRevenue?.toLocaleString() || "0"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

const TopMenuCards = memo(
  ({ topMenus = [], title = "Top Performing Menu Items" }) => {
    // Ensure topMenus is always an array
    const safeTopMenus = Array.isArray(topMenus) ? topMenus : [];

    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {safeTopMenus.map((item, index) => {
            // Safe object access with fallbacks
            const safeItem = item || {};
            const safeMenu = safeItem.menu || {};
            const menuId = safeMenu.id || safeMenu.menuId || `menu-${index}`;

            return (
              <TopMenuCard
                key={menuId}
                menu={safeMenu}
                rank={index + 1}
                orders={safeItem.orderCount || 0}
                revenue={safeItem.revenue || 0}
              />
            );
          })}

          {safeTopMenus.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              <div className="flex flex-col items-center gap-2">
                <Star className="w-8 h-8 text-gray-300" />
                <p>No menu data available for selected period</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

TopMenuCards.displayName = "TopMenuCards";
export default TopMenuCards;
