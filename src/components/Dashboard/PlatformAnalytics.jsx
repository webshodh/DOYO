// components/dashboard/PlatformAnalytics.jsx
import React from "react";
import StatCard from "../Cards/StatCard";
import {
  Smartphone,
  Store,
  CreditCard,
  Truck,
  Coffee,
  ShoppingBag,
  MapPin,
} from "lucide-react";

const PlatformAnalytics = ({
  displayStats,
  platformAnalytics,
  orderTypeFilter,
  platformFilter,
  priorityFilter,
  onOrderTypeFilterChange,
  onPlatformFilterChange,
  onPriorityFilterChange,
}) => {
  if (!displayStats) return null;

  return (
    <>
      {/* Platform Overview */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Platform Performance
          </h3>
          <Smartphone className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Direct Orders"
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
            title="Platform Commission"
            value={`₹${displayStats.totalPlatformCommission.toLocaleString()}`}
            icon={CreditCard}
            color="purple"
            subtitle="Total deducted"
          />
        </div>
      </div>

      {/* Order Type Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
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

      {/* Payment Method Stats */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Payment Methods
          </h3>
          <CreditCard className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Cash Payments"
            value={displayStats.cashPayments}
            icon={CreditCard}
            color="green"
            subtitle={`${
              displayStats.total > 0
                ? Math.round(
                    (displayStats.cashPayments / displayStats.total) * 100
                  )
                : 0
            }% of orders`}
          />
          <StatCard
            title="UPI Payments"
            value={displayStats.upiPayments}
            icon={Smartphone}
            color="blue"
            subtitle={`${
              displayStats.total > 0
                ? Math.round(
                    (displayStats.upiPayments / displayStats.total) * 100
                  )
                : 0
            }% of orders`}
          />
          <StatCard
            title="Card Payments"
            value={displayStats.cardPayments}
            icon={CreditCard}
            color="purple"
            subtitle={`${
              displayStats.total > 0
                ? Math.round(
                    (displayStats.cardPayments / displayStats.total) * 100
                  )
                : 0
            }% of orders`}
          />
          <StatCard
            title="Pending Payments"
            value={displayStats.pendingPayments}
            icon={CreditCard}
            color="red"
            subtitle="Awaiting payment"
          />
        </div>
      </div>
    </>
  );
};

export default PlatformAnalytics;
