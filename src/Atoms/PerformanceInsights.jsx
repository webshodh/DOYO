import React from "react";
import { Zap, Target, DollarSign, BarChart3, TrendingUp } from "lucide-react";

// Performance Insights Component - Fixed props destructuring
const PerformanceInsights = ({ enhancedStats }) => {
  // Add safety check for undefined enhancedStats
  if (!enhancedStats || !enhancedStats.performanceMetrics) {
    return (
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Performance Insights</h3>
          <BarChart3 className="text-2xl opacity-70" />
        </div>
        <div className="text-center">
          <p className="text-white opacity-80">Loading performance data...</p>
        </div>
      </div>
    );
  }

  const insights = [
    {
      title: "Revenue Performance",
      value: `₹${(enhancedStats.totalRevenue / 1000).toFixed(1)}K`,
      subtitle: `₹${enhancedStats.performanceMetrics.revenuePerHotel} avg per hotel`,
      icon: DollarSign,
      trend: "+12.5%",
    },
    {
      title: "Subscription Rate",
      value: `${enhancedStats.performanceMetrics.subscriptionRate}%`,
      subtitle: `${enhancedStats.activeSubscriptions} active subscriptions`,
      icon: Target,
      trend: "+8.3%",
    },
    {
      title: "Platform Efficiency",
      value: `${enhancedStats.performanceMetrics.avgAdminsPerHotel}`,
      subtitle: "avg admins per hotel",
      icon: Zap,
      trend: "+5.1%",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-2xl animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Performance Insights</h3>
        <BarChart3 className="text-2xl opacity-70" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="text-center p-4 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm hover:bg-opacity-20 transition-all duration-300"
          >
            <insight.icon className="mx-auto text-2xl mb-2" />
            <p className="text-2xl font-bold">{insight.value}</p>
            <p className="text-sm opacity-80">{insight.subtitle}</p>
            <div className="flex items-center justify-center mt-2">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span className="text-xs">{insight.trend}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceInsights;
