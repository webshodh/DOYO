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
            title="DOYO revenue"
            value={`₹${displayStats.directRevenue} `}
            icon={Store}
            color="blue"
            subtitle={`₹${displayStats.directRevenue.toLocaleString()} `}
          />
          <StatCard
            title="Swiggy revenue"
            value={`₹${displayStats.swiggyRevenue} `}
            icon={Smartphone}
            color="orange"
            subtitle={`₹${displayStats.swiggyRevenue.toLocaleString()} `}
          />
          <StatCard
            title="Zomato revenue"
            value={`₹${displayStats.zomatoRevenue} `}
            icon={Smartphone}
            color="red"
            subtitle={`₹${displayStats.zomatoRevenue.toLocaleString()} `}
          />
          <StatCard
            title="Uber-eats revenue"
            value={`₹${displayStats.uberEatsRevenue} `}
            icon={CreditCard}
            color="purple"
            subtitle="Total deducted"
          />
          {/* <StatCard
            title="Total revenue"
            value={`₹${displayStats.reve} revenue`}
            icon={CreditCard}
            color="purple"
            subtitle="Total deducted"
          /> */}
        </div>
      </div>
    </>
  );
};

export default PlatformAnalytics;
