import React, { useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { BarChart3, ChefHat, TrendingUp, Smartphone } from "lucide-react";

// Hooks
import { useOrder } from "../../hooks/useOrder";
import { useHotelSelection } from "../../context/HotelSelectionContext";
import { useMenu } from "hooks/useMenu";
import { useCategory } from "hooks/useCategory";
import { useMainCategory } from "hooks/useMainCategory";

// Layout and components
import AdminDashboardLayout from "../../layout/AdminDashboardLayout";
import { PageTitle } from "atoms";
import TimePeriodSelector from "../../atoms/TimePeriodSelector";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import ErrorState from "../../atoms/Messages/ErrorState";
import OrderDetailsModal from "../../components/order-dashboard/OrderDetailsModal";

// Reusable Dashboard Components
import TabNavigation from "../../components/TabNavigation";
import OrderAnalytics from "../../components/OrderAnalytics";
import RevenueOverview from "../../components/RevenueOverview";
import MenuOverview from "../../components/MenuOverview";
import MenuStatus from "../../components/MenuStatus";
import TopMenusByOrders from "../../components/TopMenusByOrders";
import TopOrdersByCategory from "../../components/TopOrdersByCategory";
import TopOrdersByMenu from "../../components/TopOrdersByMenu";
import PlatformAnalytics from "../../components/PlatformAnalytics";

// Other imports
import { useTranslation } from "react-i18next";
import { useTheme } from "context/ThemeContext";
import useColumns from "../../Constants/Columns";
import { useHotelDetails } from "hooks/useHotel";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { currentTheme, isDark } = useTheme();
  const { hotelName } = useParams();
  const { selectedHotel } = useHotelSelection();
  const [activeTab, setActiveTab] = useState("overview");
  const { isOrderEnabled } = useHotelDetails(hotelName);
  // Modal & UI state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    platformAnalytics, // Enhanced with platform data
    loading,
    submitting,
    error,
    connectionStatus,
    lastUpdated,
    selectedDate,
    selectedTimePeriod,
    periodDisplayText,
    searchTerm,
    statusFilter,
    orderTypeFilter, // New enhanced filters
    platformFilter,
    priorityFilter,
    hasOrders,
    hasFilteredOrders,
    updateOrderStatus,
    refreshOrders,
    exportDataCSV: exportOrdersCSV,
    handleSearchChange,
    handleStatusFilterChange,
    handleOrderTypeFilterChange, // New handlers
    handlePlatformFilterChange,
    handlePriorityFilterChange,
    handleDateChange,
    handleTimePeriodChange,
    clearFilters,
    getOrdersByStatus,
    getOrdersById,
    getOrdersByPlatform, // New helper functions
    getOrdersByType,
    statusOptions,
    timePeriodOptions,
    orderTypeOptions, // New enhanced options
    platformOptions,
    priorityOptions,
  } = useOrder(hotelName, {
    includeMenuData: true,
    defaultTimePeriod: "daily",
    defaultStatusFilter: "all",
    sortBy: "timestamp",
    sortOrder: "desc",
  });

  // Menu and categories data
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

      // Revenue by platform
      directRevenue: orderStats.directRevenue || 0,
      swiggyRevenue: orderStats.swiggyRevenue || 0,
      zomatoRevenue: orderStats.zomatoRevenue || 0,
      totalPlatformCommission: orderStats.totalPlatformCommission || 0,

      trends: {
        totalTrend: Math.floor(Math.random() * 20) - 10,
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

  // Top performing data using enhanced analytics
  const topMenusByOrders = useMemo(() => {
    return menuAnalytics?.topMenus || [];
  }, [menuAnalytics]);

  const topOrdersByCategory = useMemo(() => {
    return categoryAnalytics?.categoryStats?.slice(0, 10) || [];
  }, [categoryAnalytics]);

  const topOrdersByMenu = useMemo(() => {
    return menuAnalytics?.menuStats?.slice(0, 10) || [];
  }, [menuAnalytics]);

  // Tab configuration

  // Tab configuration
  const tabs = isOrderEnabled
    ? [
        { id: "overview", name: "Overview", icon: BarChart3 },
        { id: "platforms", name: "Analytics", icon: Smartphone },
        { id: "menu", name: "Menu", icon: ChefHat },
        { id: "performance", name: "Performance", icon: TrendingUp },
      ]
    : [{ id: "menu", name: "Menu", icon: ChefHat }];

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

  const isLoading =
    loading || menuLoading || categoriesLoading || mainCategoryLoading;
  console.log("isOrderEnabled", isOrderEnabled);
  return (
    <AdminDashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Header Section */}
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

        {/* Time Period Selector */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mt-2">
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

        {/* Main Content */}
        <div className="py-6 sm:py-8 space-y-8">
          {/* Tab Navigation Component */}
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={tabs}
          />

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
              {activeTab === "overview" && isOrderEnabled && (
                <>
                  <OrderAnalytics displayStats={displayStats} />
                  <RevenueOverview displayStats={displayStats} />
                </>
              )}

              {/* Platform Analytics Tab */}
              {activeTab === "platforms" && isOrderEnabled && (
                <PlatformAnalytics
                  displayStats={displayStats}
                  platformAnalytics={platformAnalytics}
                  orderTypeFilter={orderTypeFilter}
                  platformFilter={platformFilter}
                  priorityFilter={priorityFilter}
                  onOrderTypeFilterChange={handleOrderTypeFilterChange}
                  onPlatformFilterChange={handlePlatformFilterChange}
                  onPriorityFilterChange={handlePriorityFilterChange}
                />
              )}

              {/* Menu Tab */}
              {activeTab === "menu" && (
                <>
                  <MenuOverview menuStats={menuStats} />
                  <MenuStatus menuStats={menuStats} />
                </>
              )}

              {/* Performance Tab */}
              {activeTab === "performance" && isOrderEnabled && (
                <>
                  <TopMenusByOrders topMenusByOrders={topMenusByOrders} />
                  <TopOrdersByCategory
                    topOrdersByCategory={topOrdersByCategory}
                  />
                  <TopOrdersByMenu topOrdersByMenu={topOrdersByMenu} />
                </>
              )}
            </>
          )}
        </div>

        {/* Modal */}
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
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;
