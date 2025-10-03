// PeakHoursAnalyzer.jsx
import React, { useMemo } from "react";
import { Clock, TrendingUp, Users, Flame, Zap } from "lucide-react";

const PeakHoursAnalyzer = ({ orders = [], className = "" }) => {
  const peakHoursData = useMemo(() => {
    const hourlyOrders = {};
    const today = new Date().toDateString();

    orders
      .filter((order) => new Date(order.timestamp).toDateString() === today)
      .forEach((order) => {
        const hour = new Date(order.timestamp).getHours();
        hourlyOrders[hour] = (hourlyOrders[hour] || 0) + 1;
      });

    const peakHour = Object.entries(hourlyOrders).reduce(
      (peak, [hour, count]) =>
        count > peak.count ? { hour: parseInt(hour), count } : peak,
      { hour: 12, count: 0 }
    );

    const formatHour = (hour) => {
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:00 ${period}`;
    };

    return {
      peakHour: formatHour(peakHour.hour),
      peakOrders: peakHour.count,
      hourlyData: hourlyOrders,
      currentLoad:
        peakHour.count > 15 ? "High" : peakHour.count > 8 ? "Medium" : "Low",
    };
  }, [orders]);

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            🔥 Peak Hours Analysis
          </h3>
          <p className="text-gray-500 text-sm">Rush hour insights</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-red-500" />
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                peakHoursData.currentLoad === "High"
                  ? "bg-red-100 text-red-700"
                  : peakHoursData.currentLoad === "Medium"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {peakHoursData.currentLoad} Load
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {peakHoursData.peakHour}
          </div>
          <div className="text-red-600 text-sm font-medium">Busiest Hour</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <Zap className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {peakHoursData.peakOrders}
          </div>
          <div className="text-blue-600 text-sm font-medium">Peak Orders</div>
        </div>
      </div>

      {/* Hour by hour mini chart */}
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-700 text-sm">
          Today's Order Pattern
        </h4>
        <div className="flex space-x-1">
          {Array.from({ length: 24 }, (_, hour) => {
            const orders = peakHoursData.hourlyData[hour] || 0;
            const maxOrders = Math.max(
              ...Object.values(peakHoursData.hourlyData),
              1
            );
            const height = Math.max(4, (orders / maxOrders) * 32);
            const isPeak =
              hour === parseInt(peakHoursData.peakHour.split(":")[0]);

            return (
              <div
                key={hour}
                className="flex flex-col items-center flex-1 min-w-0"
                title={`${hour}:00 - ${orders} orders`}
              >
                <div
                  className={`w-full rounded-t ${
                    isPeak
                      ? "bg-red-500"
                      : orders > 0
                      ? "bg-blue-400"
                      : "bg-gray-200"
                  }`}
                  style={{ height: `${height}px` }}
                />
                {hour % 6 === 0 && (
                  <span className="text-xs text-gray-400 mt-1">{hour}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PeakHoursAnalyzer;
