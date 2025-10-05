import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Bell,
  Settings,
  RefreshCw,
  Download,
  Filter,
  Eye,
  Mail,
  MessageCircle,
  Phone,
  Smartphone,
  Wifi,
  Database,
  Cloud,
  Lock,
  Unlock,
  CheckSquare,
  AlertCircle,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Circle,
  Timer,
  Bookmark,
  UserX,
} from "lucide-react";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import { t } from "i18next";
import QuickActions from "atoms/Buttons/QuickActions";
import PerformanceInsights from "components/Dashboard/PerformanceInsights";
import ChartCard from "components/Charts/ChartCard";
import SuperAdminFooter from "../../atoms/SuperAdminFooter";
import { toast } from "react-toastify";

// Enhanced Notification Center Component
const NotificationCenter = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
            </h3>
            <button
              onClick={onMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        notification.type === "warning"
                          ? "bg-yellow-100"
                          : notification.type === "error"
                          ? "bg-red-100"
                          : notification.type === "success"
                          ? "bg-green-100"
                          : "bg-blue-100"
                      }`}
                    >
                      {notification.type === "warning" && (
                        <AlertTriangle size={16} className="text-yellow-600" />
                      )}
                      {notification.type === "error" && (
                        <XCircle size={16} className="text-red-600" />
                      )}
                      {notification.type === "success" && (
                        <CheckCircle size={16} className="text-green-600" />
                      )}
                      {notification.type === "info" && (
                        <Bell size={16} className="text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          !notification.read ? "text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.timestamp}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Expiry Alert System
const ExpiryAlertSystem = ({
  expiringSubscriptions,
  onViewDetails,
  onAutoRenew,
}) => {
  if (!expiringSubscriptions || expiringSubscriptions.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Subscription Expiry Alerts
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {expiringSubscriptions.length} subscription
              {expiringSubscriptions.length !== 1 ? "s" : ""} expiring soon
            </p>
          </div>
        </div>
        <button
          onClick={() => onViewDetails()}
          className="text-sm bg-white border border-yellow-300 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-50 transition-colors"
        >
          View All
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {expiringSubscriptions.slice(0, 3).map((subscription) => (
          <div
            key={subscription.id}
            className="bg-white rounded-lg p-4 border border-yellow-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-gray-400" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {subscription.hotelName}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {subscription.planName} • Expires in {subscription.daysLeft}{" "}
                    day{subscription.daysLeft !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onAutoRenew(subscription.id)}
                  className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
                >
                  Auto-renew
                </button>
                <button
                  onClick={() => onViewDetails(subscription.id)}
                  className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  Contact
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {expiringSubscriptions.length > 3 && (
        <div className="mt-3 text-center">
          <button
            onClick={() => onViewDetails()}
            className="text-sm text-yellow-700 hover:text-yellow-800 underline"
          >
            View {expiringSubscriptions.length - 3} more expiring subscriptions
          </button>
        </div>
      )}
    </div>
  );
};

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [notifications, setNotifications] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  // Mock system metrics (in real app, fetch from monitoring service)
  const systemMetrics = {
    uptime: 99.8,
    responseTime: 120,
    databaseHealth: 98.5,
    errorRate: 0.2,
  };

  // Loading and error states
  const loading =
    hotelsLoading || adminsLoading || plansLoading || subscriptionsLoading;
  const error = hotelsError || adminsError || plansError;

  // Enhanced Analytics Calculations with more insights
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
        expiringSoon: 0,
        businessTypeStats: {},
        geographicStats: { states: {}, cities: {}, districts: {} },
        performanceMetrics: {
          avgAdminsPerHotel: 0,
          avgMenuItemsPerHotel: 0,
          subscriptionRate: 0,
          revenuePerHotel: 0,
          customerSatisfaction: 0,
          growthRate: 0,
          churnRate: 0,
          conversionRate: 0,
          averageSubscriptionValue: 0,
          customerLifetimeValue: 0,
        },
        timeBasedStats: {
          newHotelsThisMonth: 0,
          newAdminsThisMonth: 0,
          revenueGrowth: 0,
          activeHotelsToday: 0,
          subscriptionsThisMonth: 0,
          cancelledThisMonth: 0,
        },
        riskMetrics: {
          lowPerformingHotels: 0,
          expiringSoonSubscriptions: 0,
          inactiveAdmins: 0,
          lowRatedHotels: 0,
          unpaidInvoices: 0,
          supportTickets: 0,
        },
        trendAnalysis: {
          hotelGrowthTrend: "up", // up, down, stable
          revenueGrowthTrend: "up",
          subscriptionTrend: "up",
          customerSatisfactionTrend: "stable",
        },
        systemHealth: "excellent", // excellent, good, warning, critical
      };
    }

    const businessTypeStats = {};
    const geographicStats = { states: {}, cities: {}, districts: {} };

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

    // Process hotel data with enhanced calculations
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
        const hotelDate = hotel.createdAt.toDate
          ? hotel.createdAt.toDate()
          : new Date(hotel.createdAt);
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

    // Enhanced admin stats
    const activeAdmins = admins.filter(
      (admin) => admin.status === "active"
    ).length;
    const inactiveAdmins = admins.length - activeAdmins;
    const newAdminsThisMonth = admins.filter((admin) => {
      if (admin.createdAt) {
        const adminDate = admin.createdAt.toDate
          ? admin.createdAt.toDate()
          : new Date(admin.createdAt);
        return (
          adminDate.getMonth() === currentMonth &&
          adminDate.getFullYear() === currentYear
        );
      }
      return false;
    }).length;

    // Enhanced subscription calculations with expiry checking
    const now = new Date();
    const expiringSoonSubscriptions = hotelSubscriptions.filter((sub) => {
      if (sub.subscription && sub.subscription.expiresAt) {
        const expiryDate = sub.subscription.expiresAt.toDate
          ? sub.subscription.expiresAt.toDate()
          : new Date(sub.subscription.expiresAt);
        const daysDiff = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
        return daysDiff <= 7 && daysDiff > 0;
      }
      return false;
    }).length;

    // Performance metrics calculations
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

    // Advanced metrics
    const averageSubscriptionValue =
      subscriptionStats?.revenue > 0 &&
      subscriptionStats?.activeSubscriptions > 0
        ? subscriptionStats.revenue / subscriptionStats.activeSubscriptions
        : 0;
    const customerLifetimeValue = averageSubscriptionValue * 12; // Assuming 12 months average
    const conversionRate =
      hotels.length > 0
        ? (subscriptionStats?.activeSubscriptions / hotels.length) * 100
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
      expiredSubscriptions: subscriptionStats?.expiredSubscriptions || 0,
      expiringSoon: expiringSoonSubscriptions,
      businessTypeStats,
      geographicStats,
      performanceMetrics: {
        avgAdminsPerHotel: Math.round(avgAdminsPerHotel * 10) / 10,
        avgMenuItemsPerHotel: Math.round(avgMenuItemsPerHotel * 10) / 10,
        subscriptionRate: Math.round(subscriptionRate * 10) / 10,
        revenuePerHotel: Math.round(revenuePerHotel),
        customerSatisfaction: Math.round(customerSatisfaction),
        growthRate: Math.round(growthRate * 10) / 10,
        churnRate: 0, // Calculate based on cancelled subscriptions
        conversionRate: Math.round(conversionRate * 10) / 10,
        averageSubscriptionValue: Math.round(averageSubscriptionValue),
        customerLifetimeValue: Math.round(customerLifetimeValue),
      },
      timeBasedStats: {
        newHotelsThisMonth,
        newAdminsThisMonth,
        revenueGrowth: Math.round(growthRate * 10) / 10,
        activeHotelsToday: hotelStats.active,
        subscriptionsThisMonth: newHotelsThisMonth, // Assuming new hotels get subscriptions
        cancelledThisMonth: 0,
      },
      riskMetrics: {
        lowPerformingHotels,
        expiringSoonSubscriptions,
        inactiveAdmins,
        lowRatedHotels,
        unpaidInvoices: 0,
        supportTickets: 0,
      },
      trendAnalysis: {
        hotelGrowthTrend: newHotelsThisMonth > 0 ? "up" : "stable",
        revenueGrowthTrend:
          (subscriptionStats?.revenue || 0) > 0 ? "up" : "stable",
        subscriptionTrend: subscriptionRate > 50 ? "up" : "stable",
        customerSatisfactionTrend: avgRating > 4 ? "up" : "stable",
      },
      systemHealth:
        systemMetrics.uptime > 99
          ? "excellent"
          : systemMetrics.uptime > 95
          ? "good"
          : "warning",
    };
  }, [
    hotels,
    admins,
    hotelStats,
    subscriptionPlans,
    subscriptionStats,
    hotelSubscriptions,
    systemMetrics,
  ]);

  // Generate mock notifications based on system state
  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications = [];

      // Expiry warnings
      if (enhancedStats.expiringSoon > 0) {
        newNotifications.push({
          id: "expiry-warning",
          type: "warning",
          title: "Subscriptions Expiring Soon",
          message: `${enhancedStats.expiringSoon} subscription${
            enhancedStats.expiringSoon !== 1 ? "s" : ""
          } expiring within 7 days`,
          timestamp: new Date().toLocaleTimeString(),
          read: false,
        });
      }

      // Low performing hotels
      if (enhancedStats.riskMetrics.lowPerformingHotels > 0) {
        newNotifications.push({
          id: "low-performance",
          type: "warning",
          title: "Low Performing Hotels",
          message: `${enhancedStats.riskMetrics.lowPerformingHotels} hotel${
            enhancedStats.riskMetrics.lowPerformingHotels !== 1 ? "s" : ""
          } need attention`,
          timestamp: new Date().toLocaleTimeString(),
          read: false,
        });
      }

      // System health
      if (enhancedStats.systemHealth === "warning") {
        newNotifications.push({
          id: "system-health",
          type: "error",
          title: "System Performance Alert",
          message: "System performance is below optimal levels",
          timestamp: new Date().toLocaleTimeString(),
          read: false,
        });
      }

      // Growth notifications
      if (enhancedStats.timeBasedStats.newHotelsThisMonth > 0) {
        newNotifications.push({
          id: "growth",
          type: "success",
          title: "New Hotels Added",
          message: `${
            enhancedStats.timeBasedStats.newHotelsThisMonth
          } new hotel${
            enhancedStats.timeBasedStats.newHotelsThisMonth !== 1 ? "s" : ""
          } joined this month`,
          timestamp: new Date().toLocaleTimeString(),
          read: false,
        });
      }

      setNotifications(newNotifications);
    };

    generateNotifications();
  }, [enhancedStats, refreshTrigger]);

  // Enhanced action handlers
  const handleQuickAction = useCallback(
    (actionId) => {
      switch (actionId) {
        case "add-hotel":
          navigate("/super-admin/add-hotel");
          break;
        case "add-admin":
          navigate("/super-admin/add-admin");
          break;
        case "create-plan":
          navigate("/super-admin/subscription-plans");
          break;
        case "expiry-alerts":
          navigate("/super-admin/subscription-alerts");
          break;
        case "revenue-report":
          generateRevenueReport();
          break;
        case "system-health":
          setActiveTab("system");
          break;
        default:
          console.log("Action not implemented:", actionId);
      }
    },
    [navigate]
  );

  const generateRevenueReport = useCallback(() => {
    const reportData = {
      totalRevenue: enhancedStats.totalRevenue,
      monthlyRevenue: enhancedStats.monthlyRevenue,
      subscriptionRevenue: enhancedStats.monthlyRevenue,
      averageRevenuePerHotel: enhancedStats.performanceMetrics.revenuePerHotel,
      revenueGrowth: enhancedStats.timeBasedStats.revenueGrowth,
      date: new Date().toISOString(),
    };

    // In a real app, this would generate and download a PDF/Excel report
    console.log("Revenue Report Generated:", reportData);
    toast.success("Revenue report generated successfully!");
  }, [enhancedStats]);

  const handleNotificationMarkAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const handleNotificationMarkAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Mock expiring subscriptions for the alert system
  const expiringSubscriptions = useMemo(() => {
    return hotelSubscriptions
      .filter((sub) => {
        if (sub.subscription && sub.subscription.expiresAt) {
          const expiryDate = sub.subscription.expiresAt.toDate
            ? sub.subscription.expiresAt.toDate()
            : new Date(sub.subscription.expiresAt);
          const daysDiff = Math.ceil(
            (expiryDate - new Date()) / (1000 * 60 * 60 * 24)
          );
          return daysDiff <= 7 && daysDiff > 0;
        }
        return false;
      })
      .map((sub) => ({
        id: sub.hotelId,
        hotelName: sub.hotelName,
        planName: sub.subscription.planName,
        daysLeft: Math.ceil(
          (new Date(sub.subscription.expiresAt) - new Date()) /
            (1000 * 60 * 60 * 24)
        ),
      }));
  }, [hotelSubscriptions]);

  const handleAutoRenew = useCallback((subscriptionId) => {
    // Implement auto-renewal logic
    toast.success("Auto-renewal enabled successfully!");
  }, []);

  const handleViewExpiryDetails = useCallback(
    (subscriptionId = null) => {
      if (subscriptionId) {
        navigate(`/super-admin/subscription/${subscriptionId}`);
      } else {
        navigate("/super-admin/subscription-alerts");
      }
    },
    [navigate]
  );

  return (
    <SuperAdminDashboardLayout>
      {/* Loading State */}
      {/* {loading && !hotels.length && <Spinner />} */}

      {/* Error State */}
      {error && (
        <div className="py-8">
          <ErrorMessage
            error={error}
            title="Dashboard Error"
            showRetryButton={true}
            onRetry={() => setRefreshTrigger((prev) => prev + 1)}
          />
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 p-4">
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl shadow-lg p-4 sm:p-6 text-white">
          <PageTitle
            pageTitle={t("dashboard.title")}
            className="text-xl sm:text-2xl md:text-3xl font-bold mb-2"
          />
        </div>
        {/* Main Content */}
        {/* {(!loading || enhancedStats.totalHotels > 0) && !error && ( */}
        <div className=" py-6 sm:py-8 space-y-8">
          {/* Expiry Alert System */}
          <ExpiryAlertSystem
            expiringSubscriptions={expiringSubscriptions}
            onViewDetails={handleViewExpiryDetails}
            onAutoRenew={handleAutoRenew}
          />

          {/* Enhanced Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {[
                  {
                    id: "overview",
                    name: "Overview",
                    icon: BarChart3,
                    badge: null,
                  },
                  {
                    id: "performance",
                    name: "Performance",
                    icon: TrendingUp,
                    badge: null,
                  },
                  {
                    id: "analytics",
                    name: "Analytics",
                    icon: PieChart,
                    badge: null,
                  },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors relative ${
                        activeTab === tab.id
                          ? "border-orange-500 text-orange-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.name}</span>
                      {tab.badge && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Overview Tab - Enhanced with more insights */}
          {activeTab === "overview" && (
            <>
              {/* Key Metrics Grid with Enhanced Cards */}
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
                  onClick={() => handleQuickAction("revenue-report")}
                />

                <StatCard
                  title="Active Properties"
                  value={enhancedStats.activeHotels}
                  color="blue"
                  icon={Building2}
                  subtitle={`${enhancedStats.inactiveHotels} inactive • ${enhancedStats.performanceMetrics.conversionRate}% conversion`}
                  loading={loading}
                  trend={{
                    value: enhancedStats.timeBasedStats.newHotelsThisMonth,
                    isPositive: true,
                    suffix: " this month",
                  }}
                  onClick={() => navigate("/super-admin/hotels")}
                />

                <StatCard
                  title="Customer Rating"
                  value={enhancedStats.avgRating || "N/A"}
                  color="yellow"
                  icon={Star}
                  subtitle={`${enhancedStats.performanceMetrics.customerSatisfaction}% satisfaction • ${enhancedStats.riskMetrics.lowRatedHotels} need attention`}
                  loading={loading}
                  trend={{
                    value: enhancedStats.avgRating,
                    isPositive: enhancedStats.avgRating >= 4,
                    suffix: "/5.0",
                  }}
                />

                <StatCard
                  title="Subscription Rate"
                  value={`${enhancedStats.performanceMetrics.subscriptionRate}%`}
                  color="purple"
                  icon={Target}
                  subtitle={`${enhancedStats.activeSubscriptions} active • ₹${enhancedStats.performanceMetrics.averageSubscriptionValue} avg value`}
                  loading={loading}
                  trend={{
                    value: enhancedStats.performanceMetrics.subscriptionRate,
                    isPositive:
                      enhancedStats.performanceMetrics.subscriptionRate > 50,
                  }}
                  onClick={() => navigate("/super-admin/subscription-plans")}
                />
              </div>

              {/* Enhanced Business Intelligence Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Intelligence */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      Revenue Intelligence
                    </h3>
                    <button
                      onClick={() => handleQuickAction("revenue-report")}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Download size={14} />
                      Export
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="text-2xl font-bold text-green-700">
                        ₹
                        {enhancedStats.performanceMetrics.customerLifetimeValue.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-600">Customer LTV</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="text-2xl font-bold text-blue-700">
                        ₹
                        {
                          enhancedStats.performanceMetrics
                            .averageSubscriptionValue
                        }
                      </div>
                      <div className="text-sm text-blue-600">
                        Avg Subscription
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Monthly Recurring Revenue
                      </span>
                      <span className="font-semibold text-gray-900">
                        ₹{(enhancedStats.monthlyRevenue / 1000).toFixed(1)}K
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Revenue Growth Rate</span>
                      <span
                        className={`font-semibold ${
                          enhancedStats.timeBasedStats.revenueGrowth > 0
                            ? "text-green-600"
                            : "text-gray-900"
                        }`}
                      >
                        {enhancedStats.timeBasedStats.revenueGrowth > 0
                          ? "+"
                          : ""}
                        {enhancedStats.timeBasedStats.revenueGrowth}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Conversion Rate</span>
                      <span className="font-semibold text-gray-900">
                        {enhancedStats.performanceMetrics.conversionRate}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operational Intelligence */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-500" />
                      Operational Intelligence
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">
                          High Performers
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {enhancedStats.totalHotels -
                          enhancedStats.riskMetrics.lowPerformingHotels}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">
                          Need Attention
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-yellow-600">
                        {enhancedStats.riskMetrics.lowPerformingHotels}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">
                          Expiring Soon
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-red-600">
                        {enhancedStats.expiringSoon}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-2">
                        Average Metrics per Property
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Admins: </span>
                          <span className="font-semibold">
                            {enhancedStats.performanceMetrics.avgAdminsPerHotel}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Menu Items: </span>
                          <span className="font-semibold">
                            {
                              enhancedStats.performanceMetrics
                                .avgMenuItemsPerHotel
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Business Type Distribution */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-orange-500" />
                    Business Distribution & Performance
                  </h3>
                  <div className="text-sm text-gray-500">
                    Total: {enhancedStats.totalHotels} properties across{" "}
                    {Object.keys(enhancedStats.businessTypeStats).length}{" "}
                    categories
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <StatCard
                    title="Hotels"
                    value={enhancedStats.businessTypeStats.hotel || 0}
                    color="blue"
                    icon={Building2}
                    loading={loading}
                    compact
                    onClick={() => navigate("/super-admin/hotels?type=hotel")}
                  />
                  <StatCard
                    title="Restaurants"
                    value={enhancedStats.businessTypeStats.restaurant || 0}
                    color="orange"
                    icon={Utensils}
                    loading={loading}
                    compact
                    onClick={() =>
                      navigate("/super-admin/hotels?type=restaurant")
                    }
                  />
                  <StatCard
                    title="Cafes"
                    value={enhancedStats.businessTypeStats.cafe || 0}
                    color="green"
                    icon={Coffee}
                    loading={loading}
                    compact
                    onClick={() => navigate("/super-admin/hotels?type=cafe")}
                  />
                  <StatCard
                    title="Bars"
                    value={enhancedStats.businessTypeStats.bar || 0}
                    color="purple"
                    icon={Wine}
                    loading={loading}
                    compact
                    onClick={() => navigate("/super-admin/hotels?type=bar")}
                  />
                  <StatCard
                    title="Cloud Kitchens"
                    value={enhancedStats.businessTypeStats.cloud_kitchen || 0}
                    color="red"
                    icon={Home}
                    loading={loading}
                    compact
                    onClick={() =>
                      navigate("/super-admin/hotels?type=cloud_kitchen")
                    }
                  />
                  <StatCard
                    title="Others"
                    value={enhancedStats.businessTypeStats.other || 0}
                    color="gray"
                    icon={Package}
                    loading={loading}
                    compact
                    onClick={() => navigate("/super-admin/hotels?type=other")}
                  />
                </div>
              </div>

              {/* Enhanced Monthly Insights and Risk Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      Growth & Trends
                    </h3>
                    <div className="flex items-center gap-2 text-sm">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          enhancedStats.trendAnalysis.hotelGrowthTrend === "up"
                            ? "bg-green-500"
                            : enhancedStats.trendAnalysis.hotelGrowthTrend ===
                              "down"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                        }`}
                      ></div>
                      <span className="text-gray-600">
                        {enhancedStats.trendAnalysis.hotelGrowthTrend === "up"
                          ? "Growing"
                          : enhancedStats.trendAnalysis.hotelGrowthTrend ===
                            "down"
                          ? "Declining"
                          : "Stable"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard
                      title="New Properties"
                      value={enhancedStats.timeBasedStats.newHotelsThisMonth}
                      color="green"
                      icon={Zap}
                      subtitle="This month"
                      loading={loading}
                      compact
                    />
                    <StatCard
                      title="New Admins"
                      value={enhancedStats.timeBasedStats.newAdminsThisMonth}
                      color="blue"
                      icon={UserCheck}
                      subtitle="This month"
                      loading={loading}
                      compact
                    />
                    <StatCard
                      title="New Subscriptions"
                      value={
                        enhancedStats.timeBasedStats.subscriptionsThisMonth
                      }
                      color="purple"
                      icon={CreditCard}
                      subtitle="This month"
                      loading={loading}
                      compact
                    />
                    <StatCard
                      title="Growth Rate"
                      value={`${enhancedStats.performanceMetrics.growthRate}%`}
                      color="emerald"
                      icon={TrendingUp}
                      subtitle="Monthly"
                      loading={loading}
                      compact
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      Risk Management
                    </h3>
                    <button
                      onClick={() => navigate("/super-admin/alerts")}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Eye size={14} />
                      View All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard
                      title="Expiring Soon"
                      value={
                        enhancedStats.riskMetrics.expiringSoonSubscriptions
                      }
                      color="red"
                      icon={Clock}
                      subtitle="≤ 7 days"
                      loading={loading}
                      compact
                      onClick={() => handleViewExpiryDetails()}
                    />
                    <StatCard
                      title="Low Performance"
                      value={enhancedStats.riskMetrics.lowPerformingHotels}
                      color="yellow"
                      icon={AlertTriangle}
                      subtitle="Need attention"
                      loading={loading}
                      compact
                    />
                    <StatCard
                      title="Inactive Admins"
                      value={enhancedStats.riskMetrics.inactiveAdmins}
                      color="gray"
                      icon={UserX}
                      subtitle="No recent activity"
                      loading={loading}
                      compact
                    />
                    <StatCard
                      title="Low Ratings"
                      value={enhancedStats.riskMetrics.lowRatedHotels}
                      color="orange"
                      icon={Star}
                      subtitle="< 3.5 rating"
                      loading={loading}
                      compact
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Performance Tab - Enhanced */}
          {activeTab === "performance" && (
            <>
              {/* Enhanced Admin & Management */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Team Management & Performance
                  </h3>
                  <button
                    onClick={() => navigate("/super-admin/admins")}
                    className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <Users size={14} />
                    Manage Admins
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Admins"
                    value={enhancedStats.totalAdmins}
                    color="blue"
                    icon={Users}
                    subtitle="Platform wide"
                    loading={loading}
                    trend={{
                      value: enhancedStats.timeBasedStats.newAdminsThisMonth,
                      isPositive: true,
                      suffix: " new",
                    }}
                  />
                  <StatCard
                    title="Active Admins"
                    value={enhancedStats.activeAdmins}
                    color="green"
                    icon={UserCheck}
                    subtitle={`${Math.round(
                      (enhancedStats.activeAdmins / enhancedStats.totalAdmins) *
                        100
                    )}% active rate`}
                    loading={loading}
                  />
                  <StatCard
                    title="Inactive Admins"
                    value={enhancedStats.inactiveAdmins}
                    color="red"
                    icon={XCircle}
                    subtitle="Need reactivation"
                    loading={loading}
                  />
                  <StatCard
                    title="Avg per Hotel"
                    value={enhancedStats.performanceMetrics.avgAdminsPerHotel}
                    color="purple"
                    icon={Award}
                    subtitle="Efficiency metric"
                    loading={loading}
                  />
                </div>

                {/* Admin Performance Insights */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Performance Insights
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield size={14} className="text-blue-600" />
                        <span className="font-medium text-blue-900">
                          Access Distribution
                        </span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Super Admins</span>
                          <span className="font-semibold text-blue-900">2</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Hotel Admins</span>
                          <span className="font-semibold text-blue-900">
                            {enhancedStats.activeAdmins - 2}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity size={14} className="text-green-600" />
                        <span className="font-medium text-green-900">
                          Activity Levels
                        </span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-green-700">Highly Active</span>
                          <span className="font-semibold text-green-900">
                            {Math.floor(enhancedStats.activeAdmins * 0.7)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">
                            Moderately Active
                          </span>
                          <span className="font-semibold text-green-900">
                            {Math.floor(enhancedStats.activeAdmins * 0.3)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Award size={14} className="text-purple-600" />
                        <span className="font-medium text-purple-900">
                          Performance Score
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-purple-900 mb-1">
                        92%
                      </div>
                      <div className="text-xs text-purple-700">
                        Overall efficiency
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Subscription Performance */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-500" />
                    Subscription Analytics & Performance
                  </h3>
                  <button
                    onClick={() => navigate("/super-admin/subscription-plans")}
                    className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
                  >
                    <Package size={14} />
                    Manage Plans
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard
                    title="Active Subscriptions"
                    value={enhancedStats.activeSubscriptions}
                    color="green"
                    icon={CheckCircle}
                    subtitle={`${enhancedStats.performanceMetrics.subscriptionRate}% conversion rate`}
                    loading={loading}
                  />
                  <StatCard
                    title="Monthly Revenue"
                    value={`₹${(enhancedStats.monthlyRevenue / 1000).toFixed(
                      1
                    )}K`}
                    color="blue"
                    icon={DollarSign}
                    subtitle="Recurring revenue"
                    loading={loading}
                    trend={{
                      value: enhancedStats.timeBasedStats.revenueGrowth,
                      isPositive:
                        enhancedStats.timeBasedStats.revenueGrowth > 0,
                      suffix: "% growth",
                    }}
                  />
                  <StatCard
                    title="Expired Plans"
                    value={enhancedStats.expiredSubscriptions}
                    color="red"
                    icon={XCircle}
                    subtitle="Need renewal"
                    loading={loading}
                  />
                  <StatCard
                    title="Avg Plan Value"
                    value={`₹${enhancedStats.performanceMetrics.averageSubscriptionValue}`}
                    color="purple"
                    icon={Target}
                    subtitle="Per subscription"
                    loading={loading}
                  />
                </div>

                {/* Subscription Performance Insights */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Revenue Intelligence
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={14} className="text-green-600" />
                        <span className="font-medium text-green-900">
                          Growth Metrics
                        </span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-green-700">MRR Growth</span>
                          <span className="font-semibold text-green-900">
                            +{enhancedStats.timeBasedStats.revenueGrowth}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Churn Rate</span>
                          <span className="font-semibold text-green-900">
                            {enhancedStats.performanceMetrics.churnRate}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign size={14} className="text-blue-600" />
                        <span className="font-medium text-blue-900">
                          Value Metrics
                        </span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Customer LTV</span>
                          <span className="font-semibold text-blue-900">
                            ₹
                            {(
                              enhancedStats.performanceMetrics
                                .customerLifetimeValue / 1000
                            ).toFixed(1)}
                            K
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">ARPU</span>
                          <span className="font-semibold text-blue-900">
                            ₹
                            {
                              enhancedStats.performanceMetrics
                                .averageSubscriptionValue
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={14} className="text-purple-600" />
                        <span className="font-medium text-purple-900">
                          Conversion
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-purple-900 mb-1">
                        {enhancedStats.performanceMetrics.conversionRate}%
                      </div>
                      <div className="text-xs text-purple-700">
                        Hotel to subscriber
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Performance Insights */}
              <div className="p-2">
                <PerformanceInsights
                  enhancedStats={enhancedStats}
                  onActionClick={handleQuickAction}
                />
              </div>
            </>
          )}

          {/* Analytics Tab - Enhanced */}
          {activeTab === "analytics" && (
            <>
              {/* Enhanced Geographic Analytics */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-500" />
                    Geographic Intelligence & Market Penetration
                  </h3>
                  <div className="text-sm text-gray-500">
                    Coverage:{" "}
                    {Object.keys(enhancedStats.geographicStats.states).length}{" "}
                    states,{" "}
                    {Object.keys(enhancedStats.geographicStats.cities).length}{" "}
                    cities
                  </div>
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
                    onClick={() =>
                      navigate("/super-admin/analytics/geographic")
                    }
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
                    title="Market Density"
                    value={`${
                      Math.round(
                        (enhancedStats.totalHotels /
                          Math.max(
                            Object.keys(enhancedStats.geographicStats.cities)
                              .length,
                            1
                          )) *
                          10
                      ) / 10
                    }`}
                    color="rose"
                    icon={Building2}
                    subtitle="Properties per city"
                    loading={loading}
                  />
                </div>

                {/* Market Intelligence */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Market Intelligence
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Top States */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">
                        Top Performing States
                      </h5>
                      <div className="space-y-2">
                        {Object.entries(enhancedStats.geographicStats.states)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 3)
                          .map(([state, count]) => (
                            <div
                              key={state}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm text-gray-600">
                                {state}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-gray-200 rounded-full">
                                  <div
                                    className="h-2 bg-indigo-500 rounded-full"
                                    style={{
                                      width: `${
                                        (count /
                                          Math.max(
                                            ...Object.values(
                                              enhancedStats.geographicStats
                                                .states
                                            )
                                          )) *
                                        100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                                  {count}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Market Opportunities */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h5 className="text-sm font-medium text-blue-900 mb-3">
                        Growth Opportunities
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-blue-800">
                            Tier-2 cities expansion
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-blue-800">
                            Rural market penetration
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-blue-800">
                            Premium segment growth
                          </span>
                        </div>
                      </div>
                      <button className="mt-3 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors">
                        View Market Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Data Visualization Charts */}
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
                  showPercentage={true}
                  total={enhancedStats.totalHotels}
                />
                <ChartCard
                  title="Business Type Distribution"
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
                  showPercentage={true}
                  total={enhancedStats.totalHotels}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                  title="Top Cities by Properties"
                  data={Object.fromEntries(
                    Object.entries(enhancedStats.geographicStats.cities)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 10)
                  )}
                  color="bg-purple-500"
                  maxValue={Math.max(
                    ...Object.values(enhancedStats.geographicStats.cities),
                    1
                  )}
                  icon={MapPin}
                  delay={400}
                  onItemClick={(city) =>
                    navigate(`/super-admin/hotels?city=${city}`)
                  }
                  showPercentage={true}
                  total={enhancedStats.totalHotels}
                />
                <ChartCard
                  title="Admin Role Distribution"
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
                  showPercentage={true}
                  total={enhancedStats.totalAdmins}
                />
              </div>

              {/* Advanced Analytics Insights */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                    Advanced Business Intelligence
                  </h3>
                  <button
                    onClick={() => handleQuickAction("revenue-report")}
                    className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                  >
                    <Download size={14} />
                    Export Analytics
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Trend Analysis */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <TrendingUp size={14} />
                      Trend Analysis
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-700">Hotel Growth</span>
                        <div className="flex items-center gap-1">
                          {enhancedStats.trendAnalysis.hotelGrowthTrend ===
                          "up" ? (
                            <ArrowUp size={12} className="text-green-600" />
                          ) : enhancedStats.trendAnalysis.hotelGrowthTrend ===
                            "down" ? (
                            <ArrowDown size={12} className="text-red-600" />
                          ) : (
                            <Circle
                              size={8}
                              className="text-yellow-600 fill-current"
                            />
                          )}
                          <span
                            className={`font-semibold ${
                              enhancedStats.trendAnalysis.hotelGrowthTrend ===
                              "up"
                                ? "text-green-600"
                                : enhancedStats.trendAnalysis
                                    .hotelGrowthTrend === "down"
                                ? "text-red-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {enhancedStats.trendAnalysis.hotelGrowthTrend ===
                            "up"
                              ? "Growing"
                              : enhancedStats.trendAnalysis.hotelGrowthTrend ===
                                "down"
                              ? "Declining"
                              : "Stable"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-blue-700">Revenue Growth</span>
                        <div className="flex items-center gap-1">
                          {enhancedStats.trendAnalysis.revenueGrowthTrend ===
                          "up" ? (
                            <ArrowUp size={12} className="text-green-600" />
                          ) : (
                            <Circle
                              size={8}
                              className="text-yellow-600 fill-current"
                            />
                          )}
                          <span
                            className={`font-semibold ${
                              enhancedStats.trendAnalysis.revenueGrowthTrend ===
                              "up"
                                ? "text-green-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {enhancedStats.trendAnalysis.revenueGrowthTrend ===
                            "up"
                              ? "Growing"
                              : "Stable"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-blue-700">Satisfaction</span>
                        <div className="flex items-center gap-1">
                          {enhancedStats.trendAnalysis
                            .customerSatisfactionTrend === "up" ? (
                            <ArrowUp size={12} className="text-green-600" />
                          ) : (
                            <Circle
                              size={8}
                              className="text-yellow-600 fill-current"
                            />
                          )}
                          <span
                            className={`font-semibold ${
                              enhancedStats.trendAnalysis
                                .customerSatisfactionTrend === "up"
                                ? "text-green-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {enhancedStats.avgRating}/5.0
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Score */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <Award size={14} />
                      Platform Score
                    </h4>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-700 mb-2">
                        {Math.round(
                          enhancedStats.performanceMetrics.subscriptionRate *
                            0.3 +
                            enhancedStats.performanceMetrics
                              .customerSatisfaction *
                              0.3 +
                            (enhancedStats.activeHotels /
                              enhancedStats.totalHotels) *
                              100 *
                              0.2 +
                            Math.min(
                              enhancedStats.performanceMetrics.growthRate,
                              20
                            ) *
                              0.2
                        )}
                      </div>
                      <div className="text-sm text-green-600 mb-3">
                        Overall Performance
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                          style={{
                            width: `${Math.round(
                              enhancedStats.performanceMetrics
                                .subscriptionRate *
                                0.3 +
                                enhancedStats.performanceMetrics
                                  .customerSatisfaction *
                                  0.3 +
                                (enhancedStats.activeHotels /
                                  enhancedStats.totalHotels) *
                                  100 *
                                  0.2 +
                                Math.min(
                                  enhancedStats.performanceMetrics.growthRate,
                                  20
                                ) *
                                  0.2
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-green-700 mt-2">
                        Based on subscription, satisfaction, activity & growth
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics Summary */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                    <h4 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                      <Bookmark size={14} />
                      Key Insights
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="text-purple-900 font-medium">
                            Top Market:{" "}
                          </span>
                          <span className="text-purple-700">
                            {Object.entries(
                              enhancedStats.geographicStats.states
                            ).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="text-purple-900 font-medium">
                            Dominant Type:{" "}
                          </span>
                          <span className="text-purple-700">
                            {Object.entries(
                              enhancedStats.businessTypeStats
                            ).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="text-purple-900 font-medium">
                            Growth Rate:{" "}
                          </span>
                          <span className="text-purple-700">
                            +{enhancedStats.performanceMetrics.growthRate}%
                            monthly
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="text-purple-900 font-medium">
                            Conversion:{" "}
                          </span>
                          <span className="text-purple-700">
                            {enhancedStats.performanceMetrics.conversionRate}%
                            to paid
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Enhanced Footer */}

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
            systemHealth: enhancedStats.systemHealth,
            lastUpdated: new Date().toLocaleString(),
          }}
          loading={loading}
          platformHealth={enhancedStats.systemHealth}
          showHealthStatus={true}
          showStats={true}
          className="border-t border-gray-200 mt-8"
        />
        {/* )} */}
      </div>
    </SuperAdminDashboardLayout>
  );
};

export default SuperAdminDashboard;
