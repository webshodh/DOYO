// components/customers/CustomerOverviewStats.jsx
import React from "react";
import StatCard from "../components/Cards/StatCard";
import {
  Users,
  UserCheck,
  Award,
  DollarSign,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

const CustomerOverviewStats = ({
  totalCustomers,
  activeCustomers,
  loyalCustomers,
  totalRevenue,
  totalOrders,
  avgOrderValue,
}) => {
  const stats = [
    {
      icon: Users,
      title: "Total Customers",
      value: totalCustomers,
      color: "blue",
    },
    {
      icon: UserCheck,
      title: "Active (7d)",
      value: activeCustomers,
      color: "green",
    },
    {
      icon: Award,
      title: "Loyal (2+ orders)",
      value: loyalCustomers,
      color: "purple",
    },
    {
      icon: DollarSign,
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      color: "yellow",
    },
    {
      icon: ShoppingCart,
      title: "Total Orders",
      value: totalOrders,
      color: "orange",
    },
    {
      icon: TrendingUp,
      title: "Avg Order",
      value: `₹${avgOrderValue.toFixed(2)}`,
      color: "pink",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          icon={stat.icon}
          title={stat.title}
          value={stat.value}
          color={stat.color}
        />
      ))}
    </div>
  );
};

export default CustomerOverviewStats;
