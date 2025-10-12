// components/dashboard/TopMenusByOrders.jsx
import React from "react";
import { Award, TrendingUp, ShoppingBag } from "lucide-react";

const TopMenusByOrders = ({ topMenusByOrders = [] }) => {
  if (!topMenusByOrders.length) return null;

  const rankColors = [
    { gradient: "from-yellow-400 to-orange-500", text: "text-yellow-600" },
    { gradient: "from-gray-400 to-gray-600", text: "text-gray-600" },
    { gradient: "from-orange-400 to-red-500", text: "text-orange-600" },
    { gradient: "from-blue-400 to-blue-600", text: "text-blue-600" },
    { gradient: "from-purple-400 to-purple-600", text: "text-purple-600" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-sm">
          <Award className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-base sm:text-lg font-bold text-gray-900">
          Top 5 Menu Items by Orders
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-3">
        {topMenusByOrders.map((menu, index) => {
          const color = rankColors[index] || rankColors[0];

          return (
            <article key={menu.menuId} className="w-full h-28 sm:h-32">
              <div className="h-full bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:-translate-y-1 border border-gray-100 hover:border-orange-300 cursor-pointer">
                <div className="flex h-full">
                  {/* Rank Section */}
                  <div
                    className={`w-24 sm:w-32 flex-shrink-0 bg-gradient-to-br ${color.gradient} relative flex items-center justify-center`}
                  >
                    <div className="text-center z-10">
                      <div className="text-3xl sm:text-4xl font-black text-white mb-1">
                        #{index + 1}
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full">
                        Top Seller
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full -ml-6 -mb-6"></div>
                  </div>

                  {/* Order Count Badge */}
                  <div className="absolute top-2 right-2 z-10">
                    <div className="flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                      <TrendingUp className="w-3 h-3" />
                      <span>{menu.orderCount} orders</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-3 flex flex-col justify-between relative min-w-0">
                    <div className="flex-1 pr-16">
                      <h3 className="text-sm sm:text-base font-bold text-gray-800 leading-tight mb-2 line-clamp-2">
                        {menu.menuName}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">
                          Total Revenue
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg sm:text-xl font-bold text-green-600">
                            ₹
                            {parseFloat(menu.revenue).toLocaleString(
                              "en-IN",
                              { maximumFractionDigits: 0 }
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3 text-blue-500" />
                          <span className="font-medium">
                            {menu.orderCount} QTY
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-transparent to-red-50 opacity-0 group-hover:opacity-40 transition-all duration-500 pointer-events-none" />
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-red-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none blur-sm" />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default TopMenusByOrders;
