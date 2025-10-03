// components/customers/TopCustomers.jsx
import React from "react";
import { Trophy, Star, Phone } from "lucide-react";

const TopCustomers = ({ topCustomersByValue, topCustomersByVisits }) => {
  const getCustomerRankIcon = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return index + 1;
  };

  const getRankColors = (index) => {
    const colors = [
      "bg-gradient-to-br from-yellow-400 to-yellow-500",
      "bg-gradient-to-br from-gray-300 to-gray-400",
      "bg-gradient-to-br from-orange-400 to-orange-500",
      "bg-gradient-to-br from-blue-400 to-blue-500",
    ];
    return colors[index] || colors[3];
  };

  const CustomerCard = ({
    customers,
    title,
    subtitle,
    icon: Icon,
    gradientColors,
    bgColors,
  }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div
          className={`p-2 bg-gradient-to-br ${gradientColors} rounded-xl shadow-sm`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="text-gray-500 text-sm">{subtitle}</p>
        </div>
      </div>

      <div className="space-y-4">
        {customers.map((customer, index) => (
          <div
            key={customer.id}
            className={`flex items-center justify-between p-4 bg-gradient-to-r ${bgColors} rounded-xl border hover:shadow-md transition-all duration-200`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md text-white ${getRankColors(
                  index
                )}`}
              >
                {getCustomerRankIcon(index)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {customer.name || "Unknown"}
                </p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Phone className="w-3 h-3" />
                  <span>{customer.mobile || "N/A"}</span>
                  <span>•</span>
                  <span>{customer.orderCount || 0} orders</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              {title.includes("Revenue") ? (
                <>
                  <p className="font-bold text-gray-900 text-lg">
                    ₹
                    {customer.totalOrderValue?.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    }) || "0"}
                  </p>
                  <p className="text-xs text-green-600 font-medium">
                    ₹
                    {(
                      (customer.totalOrderValue || 0) /
                      (customer.orderCount || 1)
                    ).toFixed(0)}{" "}
                    avg
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold text-gray-900 text-lg">
                    {customer.orderCount || 0} visits
                  </p>
                  <p className="text-xs text-green-600 font-medium">
                    ₹
                    {customer.totalOrderValue?.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    }) || "0"}
                  </p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CustomerCard
        customers={topCustomersByValue}
        title="🏆 Top Customers by Revenue"
        subtitle="Highest value customers"
        icon={Trophy}
        gradientColors="from-yellow-400 to-orange-500"
        bgColors="from-yellow-50 to-orange-50 border-yellow-100"
      />

      <CustomerCard
        customers={topCustomersByVisits}
        title="⭐ Most Frequent Visitors"
        subtitle="Regular customers by visits"
        icon={Star}
        gradientColors="from-green-400 to-green-500"
        bgColors="from-green-50 to-emerald-50 border-green-100"
      />
    </div>
  );
};

export default TopCustomers;
