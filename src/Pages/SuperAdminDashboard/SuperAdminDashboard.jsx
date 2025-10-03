import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "components/Cards/StatCard";
import { PageTitle, Spinner } from "atoms";
import SuperAdminDashboardLayout from "layout/SuperAdminDashboardLayout";
import { useHotel } from "../../hooks/useHotel";
import { useAdmin } from "../../hooks/useAdmin";
import {
  useSubscription,
  useHotelSubscriptions,
} from "../../hooks/useSubscriptionPlan";
import {
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
  Shield,
} from "lucide-react";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import { t } from "i18next";
import QuickActions from "atoms/Buttons/QuickActions";
import PerformanceInsights from "atoms/PerformanceInsights";
import ChartCard from "components/Charts/ChartCard";
import SuperAdminFooter from "atoms/SuperAdminFooter ";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  // Hooks for data fetching
  const {
    hotels,
    analytics: hotelAnalytics,
    hotelStats,
    loading: hotelsLoading,
    error: hotelsError,
  } = useHotel({ includeMetrics: true });

  const { admins, loading: adminsLoading, error: adminsError } = useAdmin({});

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

  // Loading and error states
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

    // Process hotel data
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

      // Revenue and metrics
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

  return (
    <SuperAdminDashboardLayout>
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
      <div className="space-y-6 sm:space-y-8 p-2">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl shadow-lg p-4 sm:p-6 text-white">
          <PageTitle
            pageTitle={t("dashboard.title")}
            className="text-xl sm:text-2xl md:text-3xl font-bold mb-2"
          />
          <p className="text-blue-100 text-sm sm:text-base">
            {t("dashboard.welcome")}
          </p>
        </div>

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

            {/* Performance Insights - Fixed prop passing */}
            <div className="p-2">
              <PerformanceInsights enhancedStats={enhancedStats} />
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

        {/* Footer Info */}
        {!loading && !error && (
          <SuperAdminFooter
            stats={{
              activeHotels: enhancedStats.activeHotels,
              activeAdmins: enhancedStats.activeAdmins,
              activeSubscriptions: enhancedStats.activeSubscriptions,
              totalStates: Object.keys(enhancedStats.geographicStats.states)
                .length,
              totalRevenue: enhancedStats.totalRevenue,
              totalHotels: enhancedStats.totalHotels,
              geographicStats: enhancedStats.geographicStats,
            }}
            loading={loading}
            platformHealth="Excellent"
            showHealthStatus={true}
            showStats={true}
            className="border-t border-gray-200 mt-8"
          />
        )}
      </div>
    </SuperAdminDashboardLayout>
  );
};

export default SuperAdminDashboard;
