import React, { useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  BarChart3,
  ChefHat,
  TrendingUp,
  Smartphone,
  RefreshCw,
  Download,
} from "lucide-react";

// Hooks and utilities
import { useOrder } from "../../hooks/useOrder";
import { useHotelSelection } from "../../context/HotelSelectionContext";
import { useMenu } from "hooks/useMenu";
import { useCategory } from "hooks/useCategory";
import { useMainCategory } from "hooks/useMainCategory";

// Layout and UI components
import AdminDashboardLayout from "../../layout/AdminDashboardLayout";
import { PageTitle } from "atoms";
import TimePeriodSelector from "../../atoms/TimePeriodSelector";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import ErrorState from "../../atoms/Messages/ErrorState";
import OrderDetailsModal from "../../components/order-dashboard/OrderDetailsModal";
import OrderDetailsTable from "../../components/order-dashboard/OrderDetailsTable";
import PrintBill from "Pages/Captain/PrintBill";

// Reusable Dashboard Components
import TabNavigation from "../../components/TabNavigation";
import OrderAnalytics from "../../components/OrderAnalytics";
import RevenueOverview from "../../components/RevenueOverview";
import TopMenusByOrders from "../../components/TopMenusByOrders";
import TopOrdersByCategory from "../../components/TopOrdersByCategory";
import TopOrdersByMenu from "../../components/TopOrdersByMenu";
import PlatformAnalytics from "../../components/PlatformAnalytics";

// Other imports
import { useTranslation } from "react-i18next";

/**
 * Enhanced Order Dashboard using Reusable Components
 */
const OrderDashboard = () => {
  const { t } = useTranslation();
  const { hotelName } = useParams();
  const { selectedHotel } = useHotelSelection();
  const [activeTab, setActiveTab] = useState("overview");

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
    platformAnalytics,
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
    orderTypeFilter,
    platformFilter,
    priorityFilter,
    hasOrders,
    hasFilteredOrders,
    isConnected,
    isLoading,
    isError,
    errorMessage,
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
    getOrdersByStatus,
    getOrderById: getOrdersById,
    getOrdersByPlatform,
    getOrdersByType,
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
        directOrders: 0,
        swiggyOrders: 0,
        zomatoOrders: 0,
        uberEatsOrders: 0,
        otherPlatformOrders: 0,
        dineInOrders: 0,
        takeawayOrders: 0,
        deliveryOrders: 0,
        cashPayments: 0,
        upiPayments: 0,
        cardPayments: 0,
        pendingPayments: 0,
        highPriorityOrders: 0,
        expressPriorityOrders: 0,
        vipPriorityOrders: 0,
        directRevenue: 0,
        swiggyRevenue: 0,
        zomatoRevenue: 0,
        totalPlatformCommission: 0,
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
        totalTrend: Math.floor(Math.random() * 20) - 10,
        revenueTrend: Math.floor(Math.random() * 30) - 15,
        completionTrend: Math.floor(Math.random() * 10) - 5,
      },
    };
  }, [orderStats]);

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
  const tabs = [
    { id: "overview", name: "Overview", icon: BarChart3 },
    { id: "platforms", name: "Analytics", icon: Smartphone },
    { id: "recentOrders", name: "Orders", icon: ChefHat },
    { id: "performance", name: "Performance", icon: TrendingUp },
  ];

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

  const isLoadingData =
    loading || menuLoading || categoriesLoading || mainCategoryLoading;

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
        <div className=" py-6 sm:py-8 space-y-8">
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
          {isLoadingData &&
          !filteredOrders?.length &&
          !filteredAndSortedMenus?.length ? (
            <LoadingSpinner text={t("dashboard.loading")} />
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <>
                  <OrderAnalytics displayStats={displayStats} />
                  <RevenueOverview displayStats={displayStats} />
                </>
              )}

              {/* Platform Analytics Tab */}
              {activeTab === "platforms" && (
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

              {/* Recent Orders Tab */}
              {activeTab === "recentOrders" && hasOrders && (
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

              {/* Performance Tab */}
              {activeTab === "performance" && (
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

        {/* Modals */}
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
