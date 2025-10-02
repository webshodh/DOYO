// Enhanced SuperAdmin Dashboard - pages/SuperAdminDashboard.jsx

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "components/Cards/StatCard";
import { Spinner } from "atoms";
import SuperAdminDashboardLayout from "layout/SuperAdminDashboardLayout";
import { useHotel } from "../../hooks/useHotel";
import { useAdmin } from "../../hooks/useAdmin";
import {
  useSubscription,
  useHotelSubscriptions,
} from "../../hooks/useSubscriptionPlan";
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  Coffee,
  DollarSign,
  Globe,
  Home,
  MapPin,
  Package,
  Star,
  TrendingUp,
  Users,
  Utensils,
  Wine,
  UserCheck,
  UserX,
  Shield,
  CreditCard,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  Target,
  Zap,
} from "lucide-react";
import ErrorMessage from "atoms/Messages/ErrorMessage";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  // Get comprehensive hotel data with metrics
  const {
    hotels,
    analytics: hotelAnalytics,
    hotelStats,
    loading: hotelsLoading,
    error: hotelsError,
  } = useHotel({ includeMetrics: true });

  // Get admin management data
  const { admins, loading: adminsLoading, error: adminsError } = useAdmin({});

  // Get subscription plans and hotel subscriptions
  const {
    plans: subscriptionPlans,
    loading: plansLoading,
    error: plansError,
  } = useSubscription({});

  const {
    hotelSubscriptions,
    subscriptionStats,
    loading: subscriptionsLoading,
  } = useHotelSubscriptions();

  // Comprehensive loading state
  const loading =
    hotelsLoading || adminsLoading || plansLoading || subscriptionsLoading;
  const error = hotelsError || adminsError || plansError;

  // Enhanced Analytics Calculations
  const enhancedStats = useMemo(() => {
    if (!hotels.length) {
      return {
        totalHotels: 0,
        activeHotels: 0,
        inactiveHotels: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalOrders: 0,
        avgRating: 0,
        totalAdmins: 0,
        activeAdmins: 0,
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        businessTypeStats: {},
        geographicStats: {
          states: {},
          cities: {},
          districts: {},
        },
        performanceMetrics: {
          avgAdminsPerHotel: 0,
          avgMenuItemsPerHotel: 0,
          subscriptionRate: 0,
          revenuePerHotel: 0,
        },
      };
    }

    // Business type breakdown
    const businessTypeStats = {};
    const geographicStats = {
      states: {},
      cities: {},
      districts: {},
    };

    let totalRevenue = 0;
    let totalMenuItems = 0;
    let totalAdminsCount = 0;
    let totalOrders = 0;
    let ratingsSum = 0;
    let ratingsCount = 0;

    hotels.forEach((hotel) => {
      // Business type stats
      const businessType = hotel.businessType || "other";
      businessTypeStats[businessType] =
        (businessTypeStats[businessType] || 0) + 1;

      // Geographic stats
      if (hotel.state) {
        geographicStats.states[hotel.state] =
          (geographicStats.states[hotel.state] || 0) + 1;
      }
      if (hotel.city) {
        geographicStats.cities[hotel.city] =
          (geographicStats.cities[hotel.city] || 0) + 1;
      }
      if (hotel.area) {
        geographicStats.districts[hotel.area] =
          (geographicStats.districts[hotel.area] || 0) + 1;
      }

      // Revenue and performance metrics
      totalRevenue += hotel.totalRevenue || hotel.monthlyRevenue || 0;

      if (hotel.metrics) {
        totalMenuItems += hotel.metrics.totalMenuItems || 0;
        totalAdminsCount += hotel.metrics.totalAdmins || 0;
        totalOrders += hotel.metrics.totalOrders || 0;
      }

      // Rating calculation
      if (hotel.averageRating) {
        ratingsSum += hotel.averageRating;
        ratingsCount++;
      }
    });

    // Admin stats
    const activeAdmins = admins.filter(
      (admin) => admin.status === "active"
    ).length;

    // Performance metrics
    const avgAdminsPerHotel =
      hotels.length > 0 ? totalAdminsCount / hotels.length : 0;
    const avgMenuItemsPerHotel =
      hotels.length > 0 ? totalMenuItems / hotels.length : 0;
    const subscriptionRate =
      hotels.length > 0
        ? ((subscriptionStats?.activeSubscriptions || 0) / hotels.length) * 100
        : 0;
    const revenuePerHotel =
      hotels.length > 0 ? totalRevenue / hotels.length : 0;
    const avgRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;

    return {
      totalHotels: hotels.length,
      activeHotels: hotelStats.active,
      inactiveHotels: hotelStats.inactive,
      totalRevenue,
      monthlyRevenue: subscriptionStats?.revenue || 0,
      totalOrders,
      avgRating: Math.round(avgRating * 10) / 10,
      totalAdmins: admins.length,
      activeAdmins,
      totalSubscriptions: subscriptionPlans.length,
      activeSubscriptions: subscriptionStats?.activeSubscriptions || 0,
      businessTypeStats,
      geographicStats,
      performanceMetrics: {
        avgAdminsPerHotel: Math.round(avgAdminsPerHotel * 10) / 10,
        avgMenuItemsPerHotel: Math.round(avgMenuItemsPerHotel * 10) / 10,
        subscriptionRate: Math.round(subscriptionRate * 10) / 10,
        revenuePerHotel: Math.round(revenuePerHotel),
      },
    };
  }, [hotels, admins, hotelStats, subscriptionPlans, subscriptionStats]);

  // Enhanced Chart Component
  const ChartCard = ({
    title,
    data,
    color,
    maxValue,
    icon: Icon,
    delay = 0,
    onItemClick,
  }) => (
    <div
      className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 animate-fade-in-up overflow-hidden`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
              <Icon className={`text-lg ${color.replace("bg-", "text-")}`} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {Object.keys(data || {}).length} items
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {Object.entries(data || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count], index) => (
              <div
                key={name}
                className="group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200 cursor-pointer"
                onClick={() => onItemClick && onItemClick(name, count)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[200px] group-hover:text-gray-900 transition-colors capitalize">
                    {name.replace("_", " ")}
                  </span>
                  <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                    {count}
                  </span>
                </div>
                <div className="flex-1 bg-gray-200 h-3 rounded-full overflow-hidden">
                  <div
                    className={`${color} h-3 rounded-full transition-all duration-1000 ease-out`}
                    style={{
                      width: `${(count / Math.max(maxValue, 1)) * 100}%`,
                      animationDelay: `${index * 100}ms`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
        </div>
        {Object.keys(data || {}).length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Icon className="mx-auto text-4xl mb-2 opacity-20" />
            <p>No data available</p>
          </div>
        )}
      </div>
    </div>
  );

  // Performance Insights Component
  const PerformanceInsights = () => {
    const insights = [
      {
        title: "Revenue Performance",
        value: `₹${(enhancedStats.totalRevenue / 1000).toFixed(1)}K`,
        subtitle: `₹${enhancedStats.performanceMetrics.revenuePerHotel} avg per hotel`,
        icon: DollarSign,
        color: "text-green-600",
        trend: "+12.5%",
      },
      {
        title: "Subscription Rate",
        value: `${enhancedStats.performanceMetrics.subscriptionRate}%`,
        subtitle: `${enhancedStats.activeSubscriptions} active subscriptions`,
        icon: Target,
        color: "text-blue-600",
        trend: "+8.3%",
      },
      {
        title: "Platform Efficiency",
        value: `${enhancedStats.performanceMetrics.avgAdminsPerHotel}`,
        subtitle: "avg admins per hotel",
        icon: Zap,
        color: "text-purple-600",
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

  // Quick Actions Component
  const QuickActions = () => {
    const actions = [
      {
        title: "Add New Hotel",
        description: "Register a new hotel property",
        icon: Building2,
        color: "bg-green-500",
        onClick: () => navigate("/super-admin/hotels"),
      },
      {
        title: "Manage Admins",
        description: "Add or manage admin users",
        icon: Users,
        color: "bg-blue-500",
        onClick: () => navigate("/super-admin/admins"),
      },
      {
        title: "Subscription Plans",
        description: "Create and manage plans",
        icon: Package,
        color: "bg-purple-500",
        onClick: () => navigate("/super-admin/subscriptions"),
      },
      {
        title: "View Reports",
        description: "Generate detailed analytics",
        icon: BarChart3,
        color: "bg-orange-500",
        onClick: () => navigate("/super-admin/reports"),
      },
    ];

    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Zap className="mr-2" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all duration-200 text-left group"
            >
              <div
                className={`p-2 rounded-lg ${action.color} bg-opacity-20 mb-3 w-fit`}
              >
                <action.icon
                  className={`text-lg ${action.color.replace("bg-", "text-")}`}
                />
              </div>
              <h4 className="font-semibold text-gray-800 group-hover:text-gray-900">
                {action.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">{action.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <SuperAdminDashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Enhanced Header Section */}
        <div className="animate-fade-in-down p-2">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                Super Admin Dashboard
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed max-w-3xl">
                Comprehensive platform management with real-time insights across{" "}
                {enhancedStats.totalHotels} hotels,
                {enhancedStats.totalAdmins} admins, and{" "}
                {enhancedStats.activeSubscriptions} active subscriptions.
              </p>
            </div>
           
          </div>
        </div>

        {/* Loading State */}
        {loading && <Spinner />}

        {/* Error State */}
        {error && (
          <div className="py-8">
            <ErrorMessage
              error={error}
              title="Dashboard Error"
              showRetryButton={true}
            />
          </div>
        )}

        {/* Main Content */}
        {(!loading || enhancedStats.totalHotels > 0) && !error && (
          <>
            {/* Key Performance Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 p-2">
              <StatCard
                title="Total Revenue"
                value={`₹${(enhancedStats.totalRevenue / 1000).toFixed(1)}K`}
                color="green"
                icon={DollarSign}
                subtitle="Across all properties"
                loading={loading}
              />
              <StatCard
                title="Total Orders"
                value={enhancedStats.totalOrders.toLocaleString()}
                color="blue"
                icon={Package}
                subtitle="Platform wide"
                loading={loading}
              />
              <StatCard
                title="Average Rating"
                value={enhancedStats.avgRating || "N/A"}
                color="yellow"
                icon={Star}
                subtitle="Customer satisfaction"
                loading={loading}
              />
              <StatCard
                title="Monthly Revenue"
                value={`₹${(enhancedStats.monthlyRevenue / 1000).toFixed(1)}K`}
                color="purple"
                icon={TrendingUp}
                subtitle="From subscriptions"
                loading={loading}
              />
            </div>

            {/* Business Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 p-2">
              <StatCard
                title="Hotels"
                value={enhancedStats.businessTypeStats.hotel || 0}
                color="blue"
                icon={Building2}
                loading={loading}
              />
              <StatCard
                title="Restaurants"
                value={enhancedStats.businessTypeStats.restaurant || 0}
                color="orange"
                icon={Utensils}
                loading={loading}
              />
              <StatCard
                title="Cafes"
                value={enhancedStats.businessTypeStats.cafe || 0}
                color="green"
                icon={Coffee}
                loading={loading}
              />
              <StatCard
                title="Bars"
                value={enhancedStats.businessTypeStats.bar || 0}
                color="purple"
                icon={Wine}
                loading={loading}
              />
              <StatCard
                title="Cloud Kitchens"
                value={enhancedStats.businessTypeStats.cloud_kitchen || 0}
                color="red"
                icon={Home}
                loading={loading}
              />
              <StatCard
                title="Others"
                value={enhancedStats.businessTypeStats.other || 0}
                color="gray"
                icon={Building2}
                loading={loading}
              />
            </div>

            {/* Admin & Subscription Management */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 p-2">
              <StatCard
                title="Total Admins"
                value={enhancedStats.totalAdmins}
                color="blue"
                icon={Users}
                subtitle={`${enhancedStats.activeAdmins} active`}
                loading={loading}
              />
              <StatCard
                title="Active Subscriptions"
                value={enhancedStats.activeSubscriptions}
                color="green"
                icon={CheckCircle}
                subtitle={`${enhancedStats.performanceMetrics.subscriptionRate}% rate`}
                loading={loading}
              />
              <StatCard
                title="Avg Admins/Hotel"
                value={enhancedStats.performanceMetrics.avgAdminsPerHotel}
                color="purple"
                icon={UserCheck}
                subtitle="Management efficiency"
                loading={loading}
              />
              <StatCard
                title="Avg Menu Items"
                value={enhancedStats.performanceMetrics.avgMenuItemsPerHotel}
                color="orange"
                icon={Utensils}
                subtitle="Per hotel"
                loading={loading}
              />
            </div>

            {/* Geographic Coverage */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 p-2">
              <StatCard
                title="States Covered"
                value={Object.keys(enhancedStats.geographicStats.states).length}
                color="indigo"
                icon={Globe}
                subtitle="Geographic reach"
                loading={loading}
              />
              <StatCard
                title="Cities Covered"
                value={Object.keys(enhancedStats.geographicStats.cities).length}
                color="teal"
                icon={MapPin}
                subtitle="Urban presence"
                loading={loading}
              />
              <StatCard
                title="Areas Covered"
                value={
                  Object.keys(enhancedStats.geographicStats.districts).length
                }
                color="rose"
                icon={Users}
                subtitle="Local coverage"
                loading={loading}
              />
            </div>

            {/* Performance Insights */}
            <div className="p-2">
              <PerformanceInsights />
            </div>

            {/* Quick Actions */}
            <div className="p-2">
              <QuickActions />
            </div>

            {/* Data Visualization Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 p-2">
              <ChartCard
                title="Properties by State"
                data={enhancedStats.geographicStats.states}
                color="bg-blue-500"
                maxValue={Math.max(
                  ...Object.values(enhancedStats.geographicStats.states),
                  1
                )}
                icon={MapPin}
                delay={0}
                onItemClick={(state) =>
                  navigate(`/super-admin/hotels?state=${state}`)
                }
              />
              <ChartCard
                title="Properties by Business Type"
                data={enhancedStats.businessTypeStats}
                color="bg-green-500"
                maxValue={Math.max(
                  ...Object.values(enhancedStats.businessTypeStats),
                  1
                )}
                icon={Building2}
                delay={200}
                onItemClick={(type) =>
                  navigate(`/super-admin/hotels?type=${type}`)
                }
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 p-2">
              <ChartCard
                title="Properties by City"
                data={enhancedStats.geographicStats.cities}
                color="bg-purple-500"
                maxValue={Math.max(
                  ...Object.values(enhancedStats.geographicStats.cities),
                  1
                )}
                icon={Users}
                delay={400}
                onItemClick={(city) =>
                  navigate(`/super-admin/hotels?city=${city}`)
                }
              />
              <ChartCard
                title="Admin Distribution"
                data={admins.reduce((acc, admin) => {
                  const role = admin.role || "unassigned";
                  acc[role] = (acc[role] || 0) + 1;
                  return acc;
                }, {})}
                color="bg-orange-500"
                maxValue={Math.max(
                  ...Object.values(
                    admins.reduce((acc, admin) => {
                      const role = admin.role || "unassigned";
                      acc[role] = (acc[role] || 0) + 1;
                      return acc;
                    }, {})
                  ),
                  1
                )}
                icon={Shield}
                delay={600}
                onItemClick={(role) =>
                  navigate(`/super-admin/admins?role=${role}`)
                }
              />
            </div>
          </>
        )}

        {/* Enhanced Footer Info */}
        {!loading && !error && (
          <div className="text-center py-6 animate-fade-in-up">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm text-gray-600 mb-4">
              <div>
                <span className="font-semibold text-green-600">
                  {enhancedStats.activeHotels}
                </span>{" "}
                Active Hotels
              </div>
              <div>
                <span className="font-semibold text-blue-600">
                  {enhancedStats.activeAdmins}
                </span>{" "}
                Active Admins
              </div>
              <div>
                <span className="font-semibold text-purple-600">
                  {enhancedStats.activeSubscriptions}
                </span>{" "}
                Subscriptions
              </div>
              <div>
                <span className="font-semibold text-orange-600">
                  {Object.keys(enhancedStats.geographicStats.states).length}
                </span>{" "}
                States
              </div>
              <div>
                <span className="font-semibold text-red-600">
                  ₹{(enhancedStats.totalRevenue / 1000).toFixed(1)}K
                </span>{" "}
                Revenue
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Dashboard powered by Real-time Firestore Analytics • Data
              refreshed automatically • Platform Health:{" "}
              <span className="font-semibold text-green-600">Excellent</span> •
              Total Properties:{" "}
              <span className="font-semibold">{enhancedStats.totalHotels}</span>
            </p>
          </div>
        )}
      </div>
    </SuperAdminDashboardLayout>
  );
};

export default SuperAdminDashboard;
