import { Clock } from "lucide-react";
import { memo, useMemo } from "react";

// Peak Hours Chart Component
const PeakHoursChart = memo(({ orders }) => {
  const hourlyData = useMemo(() => {
    const hours = Array(24).fill(0);

    orders.forEach((order) => {
      const orderTime = new Date(
        order.timestamps?.orderPlaced || order.orderTime,
      );
      if (!isNaN(orderTime.getTime())) {
        hours[orderTime.getHours()]++;
      }
    });

    const peakHour = hours.indexOf(Math.max(...hours));

    return {
      peakHour: `${peakHour}:00 - ${peakHour + 1}:00`,
      peakOrders: Math.max(...hours),
      hourlyBreakdown: hours.map((count, hour) => ({
        hour: `${hour}:00`,
        orders: count,
        isPeak: hour === peakHour,
      })),
    };
  }, [orders]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-500" />
        Peak Hours Analysis
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {hourlyData.peakHour}
          </p>
          <p className="text-sm text-gray-600">Peak Hour</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {hourlyData.peakOrders}
          </p>
          <p className="text-sm text-gray-600">Orders in Peak Hour</p>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-1 mt-4">
        {hourlyData.hourlyBreakdown.slice(6, 24).map((data, index) => (
          <div key={index} className="text-center">
            <div
              className={`h-16 rounded mb-1 ${
                data.isPeak
                  ? "bg-blue-500"
                  : data.orders > 0
                    ? "bg-blue-200"
                    : "bg-gray-100"
              }`}
              style={{
                height: `${Math.max(
                  8,
                  (data.orders / hourlyData.peakOrders) * 60,
                )}px`,
              }}
            />
            <p className="text-xs text-gray-500">{data.hour.split(":")}</p>
          </div>
        ))}
      </div>
    </div>
  );
});

PeakHoursChart.displayName = "PeakHoursChart";
export default PeakHoursChart;
