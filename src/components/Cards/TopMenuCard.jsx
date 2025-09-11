import React, { memo } from "react";
import { TrendingUp, Award, Star } from "lucide-react";

const TopMenuCard = memo(({ menu, rank, orders, revenue }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-4">
      <div className="relative">
        <img
          src={menu.imageUrl || "/dish.png"}
          alt={menu.menuName}
          className="w-16 h-16 rounded-lg object-cover"
          onError={(e) => {
            e.target.src = "/dish.png";
          }}
        />
        <div className="absolute -top-2 -left-2 bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
          {rank}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">
          {menu.menuName}
        </h3>
        <p className="text-sm text-gray-600">{menu.menuCategory}</p>
        <div className="flex items-center gap-4 mt-2">
          <span className="flex items-center text-sm font-medium text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            {orders} orders
          </span>
          <span className="text-sm font-medium text-purple-600">
            ₹{revenue?.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  </div>
));

const TopMenuCards = memo(
  ({ topMenus, title = "Top Performing Menu Items" }) => (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-5 h-5 text-orange-500" />
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div
        className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  `}
      >
        {topMenus.map((item, index) => (
          <TopMenuCard
            key={item.menu.id || index}
            menu={item.menu}
            rank={index + 1}
            orders={item.orderCount}
            revenue={item.revenue}
          />
        ))}
        {topMenus.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No menu data available for selected period
          </div>
        )}
      </div>
    </div>
  )
);

TopMenuCards.displayName = "TopMenuCards";
export default TopMenuCards;
