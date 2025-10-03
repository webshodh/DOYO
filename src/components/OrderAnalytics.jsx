// components/dashboard/OrderAnalytics.jsx
import React from "react";
import StatCard from "../components/Cards/StatCard";
import {
  ShoppingBag,
  CheckCircle,
  Timer,
  AlertCircle,
  Activity,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const OrderAnalytics = ({ displayStats }) => {
  const { t } = useTranslation();

  if (!displayStats) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Order Analytics</h3>
        <Activity className="w-5 h-5 text-gray-400" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("dashboard.totalOrders")}
          value={displayStats.total}
          icon={ShoppingBag}
          color="blue"
          trend={{
            value: displayStats.trends?.totalTrend || 0,
            isPositive: (displayStats.trends?.totalTrend || 0) > 0,
          }}
        />
        <StatCard
          title={t("dashboard.completedOrders")}
          value={displayStats.completed}
          icon={CheckCircle}
          color="green"
          subtitle={`${displayStats.completionRate}% success rate`}
        />
        <StatCard
          title="Pending Orders"
          value={displayStats.pendingOrders}
          icon={Timer}
          color="yellow"
          subtitle="Needs attention"
        />
        <StatCard
          title="Rejected Orders"
          value={displayStats.rejected}
          icon={AlertCircle}
          color="red"
          subtitle={`${displayStats.rejectionRate}% rejection`}
        />
      </div>
    </div>
  );
};

export default OrderAnalytics;
