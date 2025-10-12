// components/dashboard/OrderAnalytics.jsx
import React from "react";
import StatCard from "../Cards/StatCard";
import {
  ShoppingBag,
  CheckCircle,
  Timer,
  AlertCircle,
  Activity,
  Store,
  Smartphone,
  CreditCard,
  Truck,
  Coffee,
  MapPin,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const OrderAnalytics = ({ displayStats }) => {
  const { t } = useTranslation();

  if (!displayStats) return null;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Order Analytics
          </h3>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <StatCard
            title="DOYO Orders"
            value={displayStats.directOrders}
            icon={Store}
            color="blue"
            subtitle={`₹${displayStats.directRevenue.toLocaleString()} revenue`}
          />
          <StatCard
            title="Swiggy Orders"
            value={displayStats.swiggyOrders}
            icon={Smartphone}
            color="orange"
            subtitle={`₹${displayStats.swiggyRevenue.toLocaleString()} revenue`}
          />
          <StatCard
            title="Zomato Orders"
            value={displayStats.zomatoOrders}
            icon={Smartphone}
            color="red"
            subtitle={`₹${displayStats.zomatoRevenue.toLocaleString()} revenue`}
          />
          <StatCard
            title="Uber-eats Orders"
            value={`${displayStats.uberEatsRevenue}`}
            icon={CreditCard}
            color="purple"
            subtitle="Total deducted"
          />
        </div>
      </div>
      {/* Order Type Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mt-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Order Type Distribution
          </h3>
          <MapPin className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <Coffee className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-green-600 mb-2">
              {displayStats.dineInOrders}
            </div>
            <div className="text-sm text-green-700 font-medium">
              Dine-In Orders
            </div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <ShoppingBag className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {displayStats.takeawayOrders}
            </div>
            <div className="text-sm text-blue-700 font-medium">
              Takeaway Orders
            </div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <Truck className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {displayStats.deliveryOrders}
            </div>
            <div className="text-sm text-purple-700 font-medium">
              Delivery Orders
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderAnalytics;
