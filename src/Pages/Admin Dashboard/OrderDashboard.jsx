import React, { useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  BarChart3,
  ShoppingBag,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  Award,
  DollarSign,
  Calendar,
  Star,
  Activity,
  Target,
  Eye,
  ChefHat,
  Zap,
  Flame,
  ArrowUp,
  ArrowDown,
  Package,
  Timer,
  Coffee,
  Store,
  Truck,
  Smartphone,
  CreditCard,
  MapPin,
  RefreshCw,
  Download,
} from "lucide-react";

// Hooks and utilities
import { useOrder } from "../../hooks/useOrder";
import { useHotelSelection } from "../../context/HotelSelectionContext";

// Layout and UI components
import AdminDashboardLayout from "../../layout/AdminDashboardLayout";
import StatCard from "../../components/Cards/StatCard";
import TopMenuCards from "../../components/Cards/TopMenuCard";
import { DynamicTable, HorizontalMenuCard } from "../../components";
import { OrderInsights } from "../../molecules/OrderInsights";
import TimePeriodSelector from "../../atoms/TimePeriodSelector";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import ErrorState from "../../atoms/Messages/ErrorState";
import OrderDetailsModal from "../../components/order-dashboard/OrderDetailsModal";
import OrderDetailsTable from "../../components/order-dashboard/OrderDetailsTable";
import PrintBill from "Pages/Captain/PrintBill";

// Constants
import {
  OrdersByCategoryColumn,
  OrdersByMenuColumn,
} from "../../Constants/Columns";
import { useMenu } from "hooks/useMenu";
import { useCategory } from "hooks/useCategory";
import { useMainCategory } from "hooks/useMainCategory";
import { PageTitle } from "atoms";
import { useTranslation } from "react-i18next";
import { useTheme } from "context/ThemeContext";
import useColumns from "../../Constants/Columns";

/**
 * Enhanced Order Dashboard with AdminDashboard Design
 */
const OrderDashboard = () => {
  const { t } = useTranslation();
  const { currentTheme, isDark } = useTheme();
  const { hotelName } = useParams();
  const { selectedHotel } = useHotelSelection();
  const [activeTab, setActiveTab] = useState("overview");

  // Columns for tables
  const { OrdersByCategoryColumn, OrdersByMenuColumn } = useColumns();

  // Modal & UI state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPrintBill, setShowPrintBill] = useState(false);
  const [selectedOrderForBill, setSelectedOrderForBill] = useState(null);

  // Enhanced order data hook with comprehensive analytics
  const {
    orders,
    filteredOrders,
    timeFilteredOrders,
    menuData,
    orderStats,
    todayStats,
    menuAnalytics,
    categoryAnalytics,
    platformAnalytics, // New platform analytics

    // State management
    loading,
    submitting,
    error,
    connectionStatus,
    lastUpdated,

    // Enhanced filter state
    selectedDate,
    selectedTimePeriod,
    periodDisplayText,
    searchTerm,
    statusFilter,
    orderTypeFilter,
    platformFilter,
    priorityFilter,

    // Display helpers
    hasOrders,
    hasFilteredOrders,
    isConnected,
    isLoading,
    isError,
    errorMessage,

    // Actions and handlers
    updateOrderStatus,
    refreshOrders,
    exportOrdersCSV,
    handleSearchChange,
    handleStatusFilterChange,
    handleOrderTypeFilterChange,
    handlePlatformFilterChange,
    handlePriorityFilterChange,
    handleDateChange,
    handleTimePeriodChange,
    clearFilters,

    // Helper functions
    getOrdersByStatus,
    getOrderById: getOrdersById,
    getOrdersByPlatform,
    getOrdersByType,

    // Options
    statusOptions,
    timePeriodOptions,
    orderTypeOptions,
    platformOptions,
    priorityOptions,
  } = useOrder(hotelName, {
    includeMenuData: true,
    defaultTimePeriod: "daily",
    defaultStatusFilter: "all",
    sortBy: "timestamp",
    sortOrder: "desc",
  });

  // Menu and category management data
  const {
    filteredAndSortedMenus,
    loading: menuLoading,
    error: menuError,
    refreshMenus,
    menuCount,
    hasMenus,
  } = useMenu(hotelName);

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    categoryCount,
  } = useCategory(hotelName);

  const { mainCategoryCount, loading: mainCategoryLoading } =
    useMainCategory(hotelName) || {};

  // Restaurant information
  const restaurantInfo = useMemo(
    () => ({
      name: hotelName || selectedHotel?.name || "Restaurant Name",
      address: "Restaurant address, City, State - 123456",
      phone: "+91 12345 67890",
      gst: "12ABCDE3456F",
      taxRate: 0.18,
      footer: "Thank you for dining with us!",
    }),
    [hotelName, selectedHotel]
  );

  // Enhanced Stats with all new analytics
  const displayStats = useMemo(() => {
    if (!orderStats) {
      return {
        total: 0,
        received: 0,
        completed: 0,
        rejected: 0,
        revenue: 0,
        activeOrders: 0,
        completionRate: 0,
        avgOrderValue: 0,
        pendingOrders: 0,
        rejectionRate: 0,
        // Platform stats
        directOrders: 0,
        swiggyOrders: 0,
        zomatoOrders: 0,
        uberEatsOrders: 0,
        otherPlatformOrders: 0,
        // Order type stats
        dineInOrders: 0,
        takeawayOrders: 0,
        deliveryOrders: 0,
        // Payment stats
        cashPayments: 0,
        upiPayments: 0,
        cardPayments: 0,
        pendingPayments: 0,
        // Priority stats
        highPriorityOrders: 0,
        expressPriorityOrders: 0,
        vipPriorityOrders: 0,
        trends: {
          totalTrend: 0,
          revenueTrend: 0,
          completionTrend: 0,
        },
      };
    }

    const total = orderStats.total || 0;
    const received = orderStats.received || 0;
    const completed = orderStats.completed || 0;
    const rejected = orderStats.rejected || 0;
    const revenue = orderStats.totalRevenue || 0;
    const avgOrderValue = orderStats.avgOrderValue || 0;
    const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;

    return {
      total,
      received,
      completed,
      rejected,
      revenue,
      activeOrders: received,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      avgOrderValue,
      pendingOrders: received,
      rejectionRate,

      // Enhanced platform stats
      directOrders: orderStats.totalDirectOrders || 0,
      swiggyOrders: orderStats.totalSwiggyOrders || 0,
      zomatoOrders: orderStats.totalZomatoOrders || 0,
      uberEatsOrders: orderStats.totalUberEatsOrders || 0,
      otherPlatformOrders:
        (orderStats.totalDunzoOrders || 0) +
        (orderStats.totalAmazonFoodOrders || 0) +
        (orderStats.totalOtherPlatformOrders || 0),

      // Order type stats
      dineInOrders: orderStats.totalDineInOrders || 0,
      takeawayOrders: orderStats.totalTakeawayOrders || 0,
      deliveryOrders: orderStats.totalDeliveryOrders || 0,

      // Payment stats
      cashPayments: orderStats.cashPayments || 0,
      upiPayments: orderStats.upiPayments || 0,
      cardPayments: orderStats.cardPayments || 0,
      pendingPayments: orderStats.pendingPayments || 0,

      // Priority stats
      highPriorityOrders: orderStats.highPriorityOrders || 0,
      expressPriorityOrders: orderStats.expressPriorityOrders || 0,
      vipPriorityOrders: orderStats.vipPriorityOrders || 0,

      // Revenue by platform
      directRevenue: orderStats.directRevenue || 0,
      swiggyRevenue: orderStats.swiggyRevenue || 0,
      zomatoRevenue: orderStats.zomatoRevenue || 0,
      totalPlatformCommission: orderStats.totalPlatformCommission || 0,

      trends: {
        totalTrend: Math.floor(Math.random() * 20) - 10, // Mock trend data
        revenueTrend: Math.floor(Math.random() * 30) - 15,
        completionTrend: Math.floor(Math.random() * 10) - 5,
      },
    };
  }, [orderStats]);

  // Enhanced Menu statistics
  const menuStats = useMemo(() => {
    if (!filteredAndSortedMenus || filteredAndSortedMenus.length === 0) {
      return {
        total: 0,
        available: 0,
        unavailable: 0,
        discounted: 0,
        uniqueCategories: 0,
        featuredItems: 0,
        newItems: 0,
      };
    }

    const total = filteredAndSortedMenus.length;
    const available = filteredAndSortedMenus.filter(
      (m) => m.availability === "Available"
    ).length;
    const unavailable = total - available;
    const discounted = filteredAndSortedMenus.filter(
      (m) => m.discount && m.discount > 0
    ).length;
    const uniqueCategories = new Set(
      filteredAndSortedMenus.map((m) => m.menuCategory || "Other")
    ).size;
    const featuredItems = filteredAndSortedMenus.filter(
      (m) => m.featured || m.isFeatured
    ).length;
    const newItems = filteredAndSortedMenus.filter((m) => {
      if (m.createdAt) {
        const itemDate = new Date(m.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return itemDate > weekAgo;
      }
      return false;
    }).length;

    return {
      total,
      available,
      unavailable,
      discounted,
      uniqueCategories,
      featuredItems,
      newItems,
    };
  }, [filteredAndSortedMenus]);

  // Top performing menus and categories (using enhanced analytics)
  const topMenusByOrders = useMemo(() => {
    return menuAnalytics.topMenus || [];
  }, [menuAnalytics]);

  const topOrdersByCategory = useMemo(() => {
    return categoryAnalytics.categoryStats.slice(0, 10) || [];
  }, [categoryAnalytics]);

  const topOrdersByMenu = useMemo(() => {
    return menuAnalytics.menuStats.slice(0, 10) || [];
  }, [menuAnalytics]);

  // Enhanced table columns with better styling (same as original design)
  const categoryTableColumns = useMemo(
    () => [
      {
        Header: "Rank",
        accessor: "rank",
        Cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm shadow-lg">
              {row.index + 1}
            </span>
          </div>
        ),
      },
      {
        Header: "Category",
        accessor: "category",
        Cell: ({ value }) => (
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 mr-3 shadow-sm"></div>
            <span className="font-semibold text-gray-900 text-sm">{value}</span>
          </div>
        ),
      },
      {
        Header: "Orders",
        accessor: "orderCount",
        Cell: ({ value }) => (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 shadow-sm">
            {value}
          </span>
        ),
      },
      {
        Header: "Revenue",
        accessor: "revenue",
        Cell: ({ value }) => (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-sm">
            ₹
            {parseFloat(value).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ),
      },
    ],
    []
  );

  const menuTableColumns = useMemo(
    () => [
      {
        Header: "Rank",
        accessor: "rank",
        Cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white font-bold text-sm shadow-lg">
              {row.index + 1}
            </span>
          </div>
        ),
      },
      {
        Header: "Menu Item",
        accessor: "menuName",
        Cell: ({ row }) => (
          <div className="py-1">
            <p className="font-semibold text-gray-900 text-sm">
              {row.original.menuName}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                {row.original.category}
              </span>
            </p>
          </div>
        ),
      },
      {
        Header: "Orders",
        accessor: "orderCount",
        Cell: ({ value }) => (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 shadow-sm">
            {value}
          </span>
        ),
      },
      {
        Header: "Revenue",
        accessor: "revenue",
        Cell: ({ value }) => (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-sm">
            ₹
            {parseFloat(value).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ),
      },
    ],
    []
  );

  // Event handlers
  const handleViewDetails = useCallback((order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedOrder(null);
    setShowOrderDetails(false);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshOrders();
      await refreshMenus();
    } catch (e) {
      console.error("Refresh error", e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [refreshOrders, refreshMenus]);

  const handleExport = useCallback(() => {
    try {
      exportOrdersCSV();
    } catch (e) {
      console.error("Export error", e);
    }
  }, [exportOrdersCSV]);

  const handleUpdateStatus = useCallback(
    async (orderId, newStatus) => {
      const res = await updateOrderStatus(orderId, newStatus, {
        updatedBy: "admin",
        updatedAt: new Date().toISOString(),
        kitchen: { notes: "Status updated via admin dashboard" },
      });

      if (res.success && selectedOrder?.id === orderId) {
        setSelectedOrder((s) => ({
          ...s,
          status: newStatus,
          normalizedStatus: newStatus,
        }));
      }
      return res;
    },
    [updateOrderStatus, selectedOrder]
  );

  const handlePrintBill = useCallback((order) => {
    setSelectedOrderForBill(order);
    setShowPrintBill(true);
  }, []);

  const Loading =
    loading || menuLoading || categoriesLoading || mainCategoryLoading;

  return (
    <AdminDashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Header Section - Same as original */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl shadow-lg p-4 sm:p-6 text-white">
          <PageTitle
            pageTitle={t("dashboard.title")}
            className="text-xl sm:text-2xl md:text-3xl font-bold mb-2"
          />
          <p className="text-blue-100 text-sm sm:text-base">
            {t("dashboard.welcome", {
              hotelName: selectedHotel?.name || hotelName,
            })}{" "}
            {t("dashboard.today")}
          </p>
        </div>

        {/* Time Period Selector - Same as original */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <TimePeriodSelector
            selectedTimePeriod={selectedTimePeriod}
            onTimePeriodChange={handleTimePeriodChange}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            variant="default"
            showDatePicker={true}
            className="mb-0"
            options={timePeriodOptions}
            disableFutureDates={true}
          />
        </div>

        {/* Hero Section - Same as original but with enhanced platform stats */}
        {!isLoading && (
          <>
            <div className="relative bg-gradient-to-br from-orange-600 via-orange-700 to-red-600 overflow-hidden">
              <div className="relative px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="max-w-7xl mx-auto">
                  {/* Enhanced Hero Stats with Platform Data */}
                  <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/15 transition-all duration-300">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <ShoppingBag className="w-5 h-5 text-white" />
                        {displayStats.trends?.totalTrend > 0 ? (
                          <ArrowUp className="w-4 h-4 text-green-300" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-red-300" />
                        )}
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-white">
                        {displayStats.total}
                      </div>
                      <div className="text-orange-100 text-xs sm:text-sm">
                        Total Orders
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/15 transition-all duration-300">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-white" />
                        {displayStats.trends?.revenueTrend > 0 ? (
                          <ArrowUp className="w-4 h-4 text-green-300" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-red-300" />
                        )}
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-white">
                        ₹{(displayStats.revenue / 1000).toFixed(1)}K
                      </div>
                      <div className="text-orange-100 text-xs sm:text-sm">
                        Revenue
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/15 transition-all duration-300">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Smartphone className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-white">
                        {displayStats.swiggyOrders + displayStats.zomatoOrders}
                      </div>
                      <div className="text-orange-100 text-xs sm:text-sm">
                        Platform Orders
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/15 transition-all duration-300">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Store className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-white">
                        {displayStats.directOrders}
                      </div>
                      <div className="text-orange-100 text-xs sm:text-sm">
                        DOYO Orders
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Main Content - Same structure as original */}
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
          {/* Tab Navigation - Same as original */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {[
                  { id: "overview", name: "Overview", icon: BarChart3 },
                  {
                    id: "platforms",
                    name: "Platform Analytics",
                    icon: Smartphone,
                  },
                  { id: "recentOrders", name: "Recent Orders", icon: ChefHat },
                  { id: "performance", name: "Performance", icon: TrendingUp },
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

          {/* Error handling */}
          {(error || menuError || categoriesError) && (
            <ErrorState
              title={t("dashboard.errorTitle")}
              message={error?.message || menuError || categoriesError}
              retryAction={handleRefresh}
            />
          )}

          {/* Loading state */}
          {isLoading &&
          !filteredOrders?.length &&
          !filteredAndSortedMenus?.length ? (
            <LoadingSpinner text={t("dashboard.loading")} />
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <>
                  {/* Key Metrics */}
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order Analytics
                      </h3>
                      <Activity className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                      <StatCard
                        title={t("dashboard.totalOrders")}
                        value={displayStats.total}
                        icon={ShoppingBag}
                        color="blue"
                        trend={{
                          value: displayStats.trends.totalTrend,
                          isPositive: displayStats.trends.totalTrend > 0,
                        }}
                      />
                      <StatCard
                        title={t("dashboard.completedOrders")}
                        value={displayStats.completed}
                        icon={CheckCircle}
                        color="green"
                        subtitle={`${displayStats.completionRate}% success rate`}
                      />
                      <StatCard
                        title="Pending Orders"
                        value={displayStats.pendingOrders}
                        icon={Timer}
                        color="yellow"
                        subtitle="Needs attention"
                      />
                      <StatCard
                        title="Rejected Orders"
                        value={displayStats.rejected}
                        icon={AlertCircle}
                        color="red"
                        subtitle={`${displayStats.rejectionRate}% rejection`}
                      />
                      <StatCard
                        title="Total Revenue"
                        value={`₹${displayStats.revenue.toFixed(0)}`}
                        icon={DollarSign}
                        color="purple"
                        subtitle="All time"
                      />
                      <StatCard
                        title="Avg Order Value"
                        value={`₹${displayStats.avgOrderValue.toFixed(0)}`}
                        icon={Target}
                        color="purple"
                        subtitle="Per order"
                      />
                    </div>
                  </div>

                  {/* Revenue Overview - Same as original */}
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Revenue Insights
                      </h3>
                      <DollarSign className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          ₹{(displayStats.revenue || 0).toLocaleString("en-IN")}
                        </div>
                        <div className="text-sm text-green-700 font-medium">
                          Total Revenue
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          ₹{displayStats.avgOrderValue.toFixed(0)}
                        </div>
                        <div className="text-sm text-blue-700 font-medium">
                          Average Order
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                          {displayStats.rejectionRate}%
                        </div>
                        <div className="text-sm text-purple-700 font-medium">
                          Rejection Rate
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* New Platform Analytics Tab */}
              {activeTab === "platforms" && (
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
                        title="DOYO Orders"
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
                </>
              )}

              {/* Recent Orders - Same as original */}
              {activeTab === "recentOrders" && (
                <>
                  {/* Enhanced Recent Orders Table */}
                  {hasOrders && (
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-6 h-6 text-indigo-600" />
                            <h2 className="text-xl font-bold text-gray-900">
                              Recent Orders
                            </h2>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>
                              Showing {filteredOrders.length} of {orders.length}{" "}
                              orders
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1"
                              >
                                <RefreshCw
                                  className={`w-3 h-3 ${
                                    isRefreshing ? "animate-spin" : ""
                                  }`}
                                />
                                Refresh
                              </button>
                              <button
                                onClick={handleExport}
                                className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" />
                                Export
                              </button>
                            </div>
                          </div>
                        </div>

                        <OrderDetailsTable
                          orders={filteredOrders.slice(0, 20)}
                          onViewDetails={handleViewDetails}
                          onUpdateStatus={handleUpdateStatus}
                          isUpdating={submitting}
                          showConnectionStatus={!isConnected}
                          onPrintBill={handlePrintBill}
                          showEnhancedColumns={true}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Performance Tab - Same as original but with enhanced data */}
              {activeTab === "performance" && (
                <>
                  {/* Top 5 Menus by Orders - Horizontal Card Style */}
                  {topMenusByOrders.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-sm">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-base sm:text-lg font-bold text-gray-900">
                          Top 5 Menu Items by Orders
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                        {topMenusByOrders.map((menu, index) => {
                          const rankColors = [
                            {
                              gradient: "from-yellow-400 to-orange-500",
                              text: "text-yellow-600",
                            },
                            {
                              gradient: "from-gray-400 to-gray-600",
                              text: "text-gray-600",
                            },
                            {
                              gradient: "from-orange-400 to-red-500",
                              text: "text-orange-600",
                            },
                            {
                              gradient: "from-blue-400 to-blue-600",
                              text: "text-blue-600",
                            },
                            {
                              gradient: "from-purple-400 to-purple-600",
                              text: "text-purple-600",
                            },
                          ];
                          const color = rankColors[index];

                          return (
                            <article
                              key={menu.menuId}
                              className="w-full h-28 sm:h-32"
                            >
                              <div className="h-full bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:-translate-y-1 border border-gray-100 hover:border-orange-300 cursor-pointer">
                                <div className="flex h-full">
                                  {/* Rank Section - Left Side (Image Replacement) */}
                                  <div
                                    className={`w-24 sm:w-32 flex-shrink-0 bg-gradient-to-br ${color.gradient} relative flex items-center justify-center`}
                                  >
                                    <div className="text-center z-10">
                                      <div className="text-3xl sm:text-4xl font-black text-white mb-1">
                                        #{index + 1}
                                      </div>
                                      <div className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full">
                                        Top Seller
                                      </div>
                                    </div>

                                    {/* Decorative circles */}
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                                    <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full -ml-6 -mb-6"></div>
                                  </div>

                                  {/* Order Count Badge - Top Right */}
                                  <div className="absolute top-2 right-2 z-10">
                                    <div className="flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                                      <TrendingUp className="w-3 h-3" />
                                      <span>{menu.orderCount} orders</span>
                                    </div>
                                  </div>

                                  {/* Content Container */}
                                  <div className="flex-1 p-3 flex flex-col justify-between relative min-w-0">
                                    {/* Top Section */}
                                    <div className="flex-1 pr-16">
                                      {/* Menu Name */}
                                      <h3 className="text-sm sm:text-base font-bold text-gray-800 leading-tight mb-2 line-clamp-2">
                                        {menu.menuName}
                                      </h3>
                                    </div>

                                    {/* Bottom Section */}
                                    <div className="flex items-center justify-between">
                                      {/* Revenue Display */}
                                      <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">
                                          Total Revenue
                                        </span>
                                        <div className="flex items-baseline gap-1">
                                          <span className="text-lg sm:text-xl font-bold text-green-600">
                                            ₹
                                            {parseFloat(
                                              menu.totalRevenue
                                            ).toLocaleString("en-IN", {
                                              maximumFractionDigits: 0,
                                            })}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Stats Row */}
                                      <div className="flex items-center gap-3 text-xs text-gray-600">
                                        <div className="flex items-center gap-1">
                                          <ShoppingBag className="w-3 h-3 text-blue-500" />
                                          <span className="font-medium">
                                            {menu.totalQuantity} QTY
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Enhanced Hover Effects */}
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-transparent to-red-50 opacity-0 group-hover:opacity-40 transition-all duration-500 pointer-events-none" />

                                {/* Animated glow effect */}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-red-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none blur-sm" />
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tables with improved styling */}
                  {topOrdersByCategory.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-blue-900">
                              Category Performance
                            </h2>
                            <p className="text-sm text-blue-700">
                              Top performing categories by orders
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <DynamicTable
                          columns={categoryTableColumns}
                          data={topOrdersByCategory}
                        />
                      </div>
                    </div>
                  )}

                  {topOrdersByMenu.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
                      <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 border-b">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-green-900">
                              Menu Item Analytics
                            </h2>
                            <p className="text-sm text-green-700">
                              Detailed performance breakdown
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <DynamicTable
                          columns={menuTableColumns}
                          data={topOrdersByMenu}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Modals - Same as original */}
        {showOrderDetails && selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={handleCloseDetails}
            onStatusUpdate={handleUpdateStatus}
            isSubmitting={submitting}
            orderStatuses={statusOptions}
            showEnhancedDetails={true}
          />
        )}

        {showPrintBill && selectedOrderForBill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
                <h2 className="text-xl font-semibold">Print Bill</h2>
                <button
                  onClick={() => {
                    setShowPrintBill(false);
                    setSelectedOrderForBill(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  ×
                </button>
              </div>
              <PrintBill
                order={selectedOrderForBill}
                restaurantInfo={restaurantInfo}
              />
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default OrderDashboard;
