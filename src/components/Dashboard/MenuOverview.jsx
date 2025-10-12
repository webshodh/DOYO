// components/dashboard/MenuOverview.jsx
import React from "react";
import StatCard from "../Cards/StatCard";
import { ChefHat, Package, CheckCircle, Star, BarChart3 } from "lucide-react";

const MenuOverview = ({ menuStats }) => {
  if (!menuStats) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Menu Portfolio</h3>
        <ChefHat className="w-5 h-5 text-gray-400" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Menu"
          value={menuStats.total}
          icon={Package}
          color="blue"
          subtitle="In menu"
        />
        <StatCard
          title="Available Menu"
          value={menuStats.available}
          icon={CheckCircle}
          color="green"
          subtitle={`${((menuStats.available / menuStats.total) * 100).toFixed(
            1
          )}% available`}
        />
        <StatCard
          title="Discounted Menu"
          value={menuStats.discounted}
          icon={Star}
          color="yellow"
          subtitle="Special offers"
        />
        <StatCard
          title="Total Categories"
          value={menuStats.uniqueCategories}
          icon={BarChart3}
          color="purple"
          subtitle="Menu sections"
        />
      </div>
    </div>
  );
};

export default MenuOverview;
