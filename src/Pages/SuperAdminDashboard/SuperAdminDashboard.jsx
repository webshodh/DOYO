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
  Activity,
  Calendar,
  Clock,
  CreditCard,
  AlertTriangle,
  Target,
  Zap,
  Award,
  BarChart3,
  PieChart,
  XCircle,
} from "lucide-react";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import { t } from "i18next";
import QuickActions from "atoms/Buttons/QuickActions";
import PerformanceInsights from "atoms/PerformanceInsights";
import ChartCard from "components/Charts/ChartCard";
import SuperAdminFooter from "atoms/SuperAdminFooter ";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

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
        inactiveAdmins: 0,
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        expiredSubscriptions: 0,
        pendingSubscriptions: 0,
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
          customerSatisfaction: 0,
          growthRate: 0,
          churnRate: 0,
        },
        timeBasedStats: {
          newHotelsThisMonth: 0,
          newAdminsThisMonth: 0,
          revenueGrowth: 0,
          activeHotelsToday: 0,
        },
        riskMetrics: {
          lowPerformingHotels: 0,
          expiringSoonSubscriptions: 0,
          inactiveAdmins: 0,
          lowRatedHotels: 0,
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
    let newHotelsThisMonth = 0;
    let lowRatedHotels = 0;
    let lowPerformingHotels = 0;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

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
        if (hotel.averageRating < 3.5) {
          lowRatedHotels++;
        }
      }

      // Time-based calculations
      if (hotel.createdAt) {
        const hotelDate = new Date(hotel.createdAt);
        if (
          hotelDate.getMonth() === currentMonth &&
          hotelDate.getFullYear() === currentYear
        ) {
          newHotelsThisMonth++;
        }
      }

      // Performance metrics
      if (hotel.totalRevenue && hotel.totalRevenue < 10000) {
        lowPerformingHotels++;
      }
    });

    // Admin stats
    const activeAdmins = admins.filter(
      (admin) => admin.status === "active"
    ).length;
    const inactiveAdmins = admins.length - activeAdmins;
    const newAdminsThisMonth = admins.filter((admin) => {
      if (admin.createdAt) {
        const adminDate = new Date(admin.createdAt);
        return (
          adminDate.getMonth() === currentMonth &&
          adminDate.getFullYear() === currentYear
        );
      }
      return false;
    }).length;

    // Subscription calculations
    const expiredSubscriptions = hotelSubscriptions.filter(
      (sub) => sub.status === "expired"
    ).length;
    const pendingSubscriptions = hotelSubscriptions.filter(
      (sub) => sub.status === "pending"
    ).length;
    const expiringSoonSubscriptions = hotelSubscriptions.filter((sub) => {
      if (sub.expiryDate) {
        const expiryDate = new Date(sub.expiryDate);
        const daysDiff = Math.ceil(
          (expiryDate - currentDate) / (1000 * 60 * 60 * 24)
        );
        return daysDiff <= 7 && daysDiff > 0;
      }
      return false;
    }).length;

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
    const customerSatisfaction =
      avgRating >= 4 ? 95 : avgRating >= 3.5 ? 80 : 65;
    const growthRate =
      newHotelsThisMonth > 0 ? (newHotelsThisMonth / hotels.length) * 100 : 0;
    const churnRate =
      expiredSubscriptions > 0
        ? (expiredSubscriptions / hotelSubscriptions.length) * 100
        : 0;

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
      inactiveAdmins,
      totalSubscriptions: subscriptionPlans.length,
      activeSubscriptions: subscriptionStats?.activeSubscriptions || 0,
      expiredSubscriptions,
      pendingSubscriptions,
      businessTypeStats,
      geographicStats,
      performanceMetrics: {
        avgAdminsPerHotel: Math.round(avgAdminsPerHotel * 10) / 10,
        avgMenuItemsPerHotel: Math.round(avgMenuItemsPerHotel * 10) / 10,
        subscriptionRate: Math.round(subscriptionRate * 10) / 10,
        revenuePerHotel: Math.round(revenuePerHotel),
        customerSatisfaction: Math.round(customerSatisfaction),
        growthRate: Math.round(growthRate * 10) / 10,
        churnRate: Math.round(churnRate * 10) / 10,
      },
      timeBasedStats: {
        newHotelsThisMonth,
        newAdminsThisMonth,
        revenueGrowth: Math.round(growthRate * 10) / 10,
        activeHotelsToday: hotelStats.active,
      },
      riskMetrics: {
        lowPerformingHotels,
        expiringSoonSubscriptions,
        inactiveAdmins,
        lowRatedHotels,
      },
    };
  }, [
    hotels,
    admins,
    hotelStats,
    subscriptionPlans,
    subscriptionStats,
    hotelSubscriptions,
  ]);

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

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        {!loading && (
          <div className="relative bg-gradient-to-br from-orange-600 via-orange-700 to-red-600 overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
              <div className="max-w-7xl mx-auto">
                <div className="text-center sm:text-left">
                  <PageTitle
                    pageTitle={t("dashboard.title")}
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3"
                  />
                  <p className="text-orange-100 text-sm sm:text-base lg:text-lg max-w-2xl">
                    {t("dashboard.welcome")} - Comprehensive business insights
                    at your fingertips
                  </p>
                </div>

                {/* Hero Stats */}
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      {enhancedStats.totalHotels}
                    </div>
                    <div className="text-orange-100 text-xs sm:text-sm">
                      Total Properties
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      ₹{(enhancedStats.totalRevenue / 100000).toFixed(1)}L
                    </div>
                    <div className="text-orange-100 text-xs sm:text-sm">
                      Total Revenue
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      {enhancedStats.activeAdmins}
                    </div>
                    <div className="text-orange-100 text-xs sm:text-sm">
                      Active Admins
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      {enhancedStats.performanceMetrics.customerSatisfaction}%
                    </div>
                    <div className="text-orange-100 text-xs sm:text-sm">
                      Satisfaction
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {(!loading || enhancedStats.totalHotels > 0) && !error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {[
                    { id: "overview", name: "Overview", icon: BarChart3 },
                    {
                      id: "performance",
                      name: "Performance",
                      icon: TrendingUp,
                    },
                    { id: "analytics", name: "Analytics", icon: PieChart },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                          activeTab === tab.id
                            ? "border-orange-500 text-orange-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <>
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Revenue"
                    value={`₹${(enhancedStats.totalRevenue / 100000).toFixed(
                      1
                    )}L`}
                    color="green"
                    icon={DollarSign}
                    subtitle={`₹${(
                      enhancedStats.performanceMetrics.revenuePerHotel / 1000
                    ).toFixed(1)}K per hotel`}
                    loading={loading}
                    trend={{
                      value: enhancedStats.performanceMetrics.growthRate,
                      isPositive: true,
                    }}
                  />
                  <StatCard
                    title="Active Properties"
                    value={enhancedStats.activeHotels}
                    color="blue"
                    icon={Building2}
                    subtitle={`${enhancedStats.inactiveHotels} inactive`}
                    loading={loading}
                    trend={{
                      value: enhancedStats.timeBasedStats.newHotelsThisMonth,
                      isPositive: true,
                    }}
                  />
                  <StatCard
                    title="Customer Rating"
                    value={enhancedStats.avgRating || "N/A"}
                    color="yellow"
                    icon={Star}
                    subtitle={`${enhancedStats.performanceMetrics.customerSatisfaction}% satisfaction`}
                    loading={loading}
                  />
                  <StatCard
                    title="Subscription Rate"
                    value={`${enhancedStats.performanceMetrics.subscriptionRate}%`}
                    color="purple"
                    icon={Target}
                    subtitle={`${enhancedStats.activeSubscriptions} active`}
                    loading={loading}
                  />
                </div>

                {/* Business Type Overview */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Business Distribution
                    </h3>
                    <Utensils className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatCard
                      title="Hotels"
                      value={enhancedStats.businessTypeStats.hotel || 0}
                      color="blue"
                      icon={Building2}
                      loading={loading}
                      compact
                    />
                    <StatCard
                      title="Restaurants"
                      value={enhancedStats.businessTypeStats.restaurant || 0}
                      color="orange"
                      icon={Utensils}
                      loading={loading}
                      compact
                    />
                    <StatCard
                      title="Cafes"
                      value={enhancedStats.businessTypeStats.cafe || 0}
                      color="green"
                      icon={Coffee}
                      loading={loading}
                      compact
                    />
                    <StatCard
                      title="Bars"
                      value={enhancedStats.businessTypeStats.bar || 0}
                      color="purple"
                      icon={Wine}
                      loading={loading}
                      compact
                    />
                    <StatCard
                      title="Cloud Kitchens"
                      value={enhancedStats.businessTypeStats.cloud_kitchen || 0}
                      color="red"
                      icon={Home}
                      loading={loading}
                      compact
                    />
                    <StatCard
                      title="Others"
                      value={enhancedStats.businessTypeStats.other || 0}
                      color="gray"
                      icon={Package}
                      loading={loading}
                      compact
                    />
                  </div>
                </div>

                {/* Monthly Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        This Month's Growth
                      </h3>
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <StatCard
                        title="New Properties"
                        value={enhancedStats.timeBasedStats.newHotelsThisMonth}
                        color="green"
                        icon={Zap}
                        loading={loading}
                        compact
                      />
                      <StatCard
                        title="New Admins"
                        value={enhancedStats.timeBasedStats.newAdminsThisMonth}
                        color="blue"
                        icon={UserCheck}
                        loading={loading}
                        compact
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Risk Alerts
                      </h3>
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <StatCard
                        title="Expiring Soon"
                        value={
                          enhancedStats.riskMetrics.expiringSoonSubscriptions
                        }
                        color="red"
                        icon={Clock}
                        loading={loading}
                        compact
                      />
                      <StatCard
                        title="Low Performing"
                        value={enhancedStats.riskMetrics.lowPerformingHotels}
                        color="yellow"
                        icon={AlertTriangle}
                        loading={loading}
                        compact
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Performance Tab */}
            {activeTab === "performance" && (
              <>
                {/* Admin & Management */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Team Management
                    </h3>
                    <Users className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard
                      title="Total Admins"
                      value={enhancedStats.totalAdmins}
                      color="blue"
                      icon={Users}
                      subtitle="Platform wide"
                      loading={loading}
                    />
                    <StatCard
                      title="Active Admins"
                      value={enhancedStats.activeAdmins}
                      color="green"
                      icon={UserCheck}
                      subtitle={`${(
                        (enhancedStats.activeAdmins /
                          enhancedStats.totalAdmins) *
                        100
                      ).toFixed(1)}% active rate`}
                      loading={loading}
                    />
                    <StatCard
                      title="Inactive Admins"
                      value={enhancedStats.inactiveAdmins}
                      color="red"
                      icon={XCircle}
                      subtitle="Need attention"
                      loading={loading}
                    />
                    <StatCard
                      title="Avg Admins/Hotel"
                      value={enhancedStats.performanceMetrics.avgAdminsPerHotel}
                      color="purple"
                      icon={Award}
                      subtitle="Efficiency metric"
                      loading={loading}
                    />
                  </div>
                </div>

                {/* Subscription Performance */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Subscription Analytics
                    </h3>
                    <CreditCard className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard
                      title="Active Subscriptions"
                      value={enhancedStats.activeSubscriptions}
                      color="green"
                      icon={CheckCircle}
                      subtitle={`${enhancedStats.performanceMetrics.subscriptionRate}% rate`}
                      loading={loading}
                    />
                    <StatCard
                      title="Expired"
                      value={enhancedStats.expiredSubscriptions}
                      color="red"
                      icon={XCircle}
                      subtitle="Renewal needed"
                      loading={loading}
                    />
                    <StatCard
                      title="Pending"
                      value={enhancedStats.pendingSubscriptions}
                      color="yellow"
                      icon={Clock}
                      subtitle="Awaiting activation"
                      loading={loading}
                    />
                    <StatCard
                      title="Churn Rate"
                      value={`${enhancedStats.performanceMetrics.churnRate}%`}
                      color="purple"
                      icon={TrendingUp}
                      subtitle="Monthly metric"
                      loading={loading}
                    />
                  </div>
                </div>

                {/* Performance Insights */}
                <div className="p-2">
                  <PerformanceInsights enhancedStats={enhancedStats} />
                </div>
              </>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <>
                {/* Geographic Analytics */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Geographic Reach
                    </h3>
                    <Globe className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <StatCard
                      title="States Covered"
                      value={
                        Object.keys(enhancedStats.geographicStats.states).length
                      }
                      color="indigo"
                      icon={Globe}
                      subtitle="National presence"
                      loading={loading}
                    />
                    <StatCard
                      title="Cities Covered"
                      value={
                        Object.keys(enhancedStats.geographicStats.cities).length
                      }
                      color="teal"
                      icon={MapPin}
                      subtitle="Urban coverage"
                      loading={loading}
                    />
                    <StatCard
                      title="Areas Covered"
                      value={
                        Object.keys(enhancedStats.geographicStats.districts)
                          .length
                      }
                      color="rose"
                      icon={Building2}
                      subtitle="Local penetration"
                      loading={loading}
                    />
                  </div>
                </div>

                {/* Data Visualization Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          </div>
        )}

        {/* Footer */}
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
