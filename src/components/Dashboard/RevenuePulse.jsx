// RevenuePulse.jsx
import React, { useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Sparkles,
} from "lucide-react";

const RevenuePulse = ({
  orders = [],
  targetRevenue = 50000,
  className = "",
}) => {
  const revenueData = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayRevenue = orders
      .filter(
        (order) =>
          new Date(order.timestamp).toDateString() === today.toDateString()
      )
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    const yesterdayRevenue = orders
      .filter(
        (order) =>
          new Date(order.timestamp).toDateString() === yesterday.toDateString()
      )
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    const growth =
      yesterdayRevenue > 0
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
        : 0;
    const targetProgress = (todayRevenue / targetRevenue) * 100;

    const currentHour = today.getHours();
    const hourlyTarget = targetRevenue / 24;
    const expectedRevenue = hourlyTarget * currentHour;
    const performance =
      expectedRevenue > 0 ? (todayRevenue / expectedRevenue) * 100 : 100;

    return {
      todayRevenue,
      yesterdayRevenue,
      growth,
      targetProgress: Math.min(100, targetProgress),
      performance,
      isAhead: performance > 100,
      status:
        performance > 120
          ? "Excellent"
          : performance > 100
          ? "Good"
          : performance > 80
          ? "Fair"
          : "Below Target",
    };
  }, [orders, targetRevenue]);

  return (
    <div
      className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-100 p-6 ${className}`}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
          <DollarSign className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">💰 Revenue Pulse</h3>
          <p className="text-gray-500 text-sm">Real-time earnings tracker</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Main Revenue Display */}
        <div className="bg-white rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Today's Revenue</span>
            <div className="flex items-center space-x-2">
              {revenueData.growth >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-sm font-semibold ${
                  revenueData.growth >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {revenueData.growth >= 0 ? "+" : ""}
                {revenueData.growth.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            ₹{revenueData.todayRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-gray-500 text-sm">
            vs ₹{revenueData.yesterdayRevenue.toLocaleString("en-IN")} yesterday
          </div>
        </div>

        {/* Performance Status */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                Target Progress
              </span>
            </div>
            <div className="text-xl font-bold text-blue-600">
              {revenueData.targetProgress.toFixed(1)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, revenueData.targetProgress)}%`,
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">
                Performance
              </span>
            </div>
            <div
              className={`text-xl font-bold ${
                revenueData.status === "Excellent"
                  ? "text-green-600"
                  : revenueData.status === "Good"
                  ? "text-blue-600"
                  : revenueData.status === "Fair"
                  ? "text-orange-600"
                  : "text-red-600"
              }`}
            >
              {revenueData.status}
            </div>
            <div className="text-sm text-gray-500">
              {revenueData.isAhead ? "🚀 Ahead of pace!" : "⏰ Catching up..."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenuePulse;
