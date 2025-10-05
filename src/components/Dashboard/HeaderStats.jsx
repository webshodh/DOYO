import React, { memo } from "react";
import { Clock, ChefHat, Bell, CheckCircle, XCircle } from "lucide-react";

const HeaderStats = memo(({ stats }) => {
  const statCards = [
    {
      key: "pending",
      label: "Pending",
      value: stats.pending,
      color: "text-yellow-600",
      icon: Clock,
      iconColor: "text-yellow-500",
    },
    {
      key: "preparing",
      label: "Preparing",
      value: stats.preparing,
      color: "text-blue-600",
      icon: ChefHat,
      iconColor: "text-blue-500",
    },
    {
      key: "ready",
      label: "Ready",
      value: stats.ready,
      color: "text-green-600",
      icon: Bell,
      iconColor: "text-green-500",
    },
    {
      key: "completed",
      label: "Completed",
      value: stats.completed,
      color: "text-gray-600",
      icon: CheckCircle,
      iconColor: "text-gray-500",
    },
    {
      key: "rejected",
      label: "Rejected",
      value: stats.rejected,
      color: "text-red-600",
      icon: XCircle,
      iconColor: "text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.key}
            className="bg-white p-4 rounded-lg shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <Icon className={stat.iconColor} size={24} />
            </div>
          </div>
        );
      })}
    </div>
  );
});

HeaderStats.displayName = "HeaderStats";

export default HeaderStats;
