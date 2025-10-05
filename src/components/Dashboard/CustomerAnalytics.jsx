// components/customers/CustomerAnalytics.jsx
import React from "react";
import { Activity, Target, Gift, Zap } from "lucide-react";

const CustomerAnalytics = ({ analytics }) => {
  const analyticsCards = [
    {
      icon: Activity,
      label: "Customer Growth",
      value: `+${analytics.customerGrowth}%`,
      subtitle: "vs last month",
      color: "blue",
    },
    {
      icon: Target,
      label: "Retention Rate",
      value: `${analytics.retentionRate}%`,
      subtitle: "customer loyalty",
      color: "green",
    },
    {
      icon: Gift,
      label: "Avg LTV",
      value: `₹${(analytics.avgLifetimeValue / 1000).toFixed(1)}K`,
      subtitle: "lifetime value",
      color: "purple",
    },
    {
      icon: Zap,
      label: "Return Rate",
      value: `${analytics.returningCustomersRate}%`,
      subtitle: "customers return",
      color: "orange",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {analyticsCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Icon className={`w-5 h-5 text-${card.color}-500`} />
              <span className="text-sm font-medium text-gray-600">
                {card.label}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {card.value}
            </div>
            <div className="text-xs text-gray-500">{card.subtitle}</div>
          </div>
        );
      })}
    </div>
  );
};

export default CustomerAnalytics;
