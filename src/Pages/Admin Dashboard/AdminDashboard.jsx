// src/Pages/Admin/AdminDashboard.jsx
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
  RefreshCw,
  Download,
  LoaderCircle,
  Award,
  DollarSign,
  Wifi,
  WifiOff,
  Calendar,
  Eye,
} from "lucide-react";

// ✅ UPDATED: Import Firestore-based hooks
import { useOrderData } from "../../hooks/useOrder";
import { useMenu } from "../../hooks/useMenu";
import { useCategory } from "../../hooks/useCategory";
import { useOffers } from "../../hooks/useOffers";

// ✅ NEW: Import context hooks for better integration
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";

// Layout and UI components
import AdminDashboardLayout from "../../layout/AdminDashboardLayout";
import StatCard from "../../components/Cards/StatCard";
import TopMenuCards from "../../components/Cards/TopMenuCard";
import { DynamicTable } from "../../components";
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

/**
 * Admin Dashboard Component
 * Provides comprehensive analytics and management interface for hotel orders
 * ✅ MIGRATED TO FIRESTORE with enhanced real-time capabilities
 */
const AdminDashboard = () => {
  const { hotelName } = useParams();

  // ✅ NEW: Use context hooks for better integration
  const { currentUser, isAdmin, canManageHotel } = useAuth();
  const { selectedHotel, selectHotelById } = useHotelContext();

  // ✅ ENHANCED: Use the active hotel name with fallback
  const activeHotelName = hotelName || selectedHotel?.name || selectedHotel?.id;

  // Modal and UI state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPrintBill, setShowPrintBill] = useState(false);
  const [selectedOrderForBill, setSelectedOrderForBill] = useState(null);

  // ✅ NEW: Auto-update hotel selection if needed
  React.useEffect(() => {
    if (hotelName && selectedHotel?.name !== hotelName) {
      selectHotelById(hotelName);
    }
  }, [hotelName, selectedHotel, selectHotelById]);

  // ✅ ENHANCED: Enhanced order data hook with comprehensive analytics
  const {
    orders,
    filteredOrders,
    timeFilteredOrders,
    menuData,
    orderStats,
    todayStats,
    menuAnalytics,
    categoryAnalytics,

    // Enhanced state management
    loading,
    submitting,
    error,
    connectionStatus,
    lastUpdated,
    retryCount,

    // Filter state
    selectedDate,
    selectedTimePeriod,
    searchTerm,
    statusFilter,

    // Display helpers
    periodDisplayText,
    hasOrders,
    hasFilteredOrders,
    isConnected,
    isLoading,
    isError,
    errorMessage,
    isRetrying,
    canRetry,

    // Filter handlers
    handleDateChange,
    handleTimePeriodChange,
    handleSearchChange,
    handleStatusFilterChange,
    clearFilters,

    // Actions
    updateOrderStatus,
    refreshOrders,
    exportOrdersCSV,

    // Helper functions
    getOrderById,
    getOrdersByStatus,

    // Options for UI
    statusOptions,
    timePeriodOptions,
  } = useOrderData(activeHotelName, {
    includeMenuData: true,
    defaultTimePeriod: "daily",
    defaultStatusFilter: "all",
    sortBy: "timestamp",
    sortOrder: "desc",
  });

  // ✅ ENHANCED: Use Firestore-based menu hook
  const {
    menus: filteredAndSortedMenus,
    categories,
    loading: menuLoading,
    error: menuError,
    connectionStatus: menuConnectionStatus,
    refreshMenus,
    menuCount,
    hasMenus,
    availableMenuCount,
    unavailableMenuCount,
  } = useMenu(activeHotelName);

  // ✅ ENHANCED: Use Firestore-based category hook
  const {
    categories: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
    categoryCount: totalCategories,
  } = useCategory(activeHotelName);

  // ✅ NEW: Use offers hook for additional insights
  const {
    offers,
    loading: offersLoading,
    error: offersError,
    offerCount,
    activeOfferCount,
    expiredOfferCount,
  } = useOffers(activeHotelName);

  // ✅ NEW: Permission check
  const hasPermission = useMemo(() => {
    return isAdmin() && canManageHotel(activeHotelName);
  }, [isAdmin, canManageHotel, activeHotelName]);

  // ✅ ENHANCED: Connection status indicator with multiple data sources
  const connectionStatusInfo = useMemo(() => {
    // Determine overall connection status from all data sources
    const statuses = [connectionStatus, menuConnectionStatus].filter(Boolean);
    const hasError = statuses.some((status) => status === "error");
    const isConnecting = statuses.some((status) => status === "connecting");
    const allConnected = statuses.every((status) => status === "connected");

    if (hasError) {
      return { color: "red", text: "Connection Error", icon: AlertCircle };
    } else if (isConnecting || isRetrying) {
      return { color: "yellow", text: "Connecting...", icon: LoaderCircle };
    } else if (allConnected) {
      return { color: "green", text: "Live Data", icon: CheckCircle };
    } else {
      return { color: "gray", text: "Partial Connection", icon: Wifi };
    }
  }, [connectionStatus, menuConnectionStatus, isRetrying]);

  // ✅ NEW: Connection Status Component
  const ConnectionStatusIndicator = () => {
    const StatusIcon = connectionStatusInfo.icon;
    return (
      <div
        className={`flex items-center gap-2 text-sm ${
          connectionStatusInfo.color === "green"
            ? "text-green-600"
            : connectionStatusInfo.color === "yellow"
            ? "text-yellow-600"
            : connectionStatusInfo.color === "red"
            ? "text-red-600"
            : "text-gray-600"
        }`}
      >
        <StatusIcon
          size={16}
          className={
            connectionStatusInfo.color === "yellow" ? "animate-spin" : ""
          }
        />
        <span>{connectionStatusInfo.text}</span>
        {lastUpdated && (
          <span className="text-xs text-gray-500">
            • Updated {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </div>
    );
  };

  // Restaurant information for the bill - Get from hotel data or use defaults
  const restaurantInfo = useMemo(
    () => ({
      name:
        selectedHotel?.businessName ||
        selectedHotel?.hotelName ||
        activeHotelName ||
        "Restaurant Name",
      address:
        selectedHotel?.address || "Restaurant Address, City, State - 123456",
      phone:
        selectedHotel?.primaryContact ||
        selectedHotel?.phone ||
        "+91 12345 67890",
      gst: selectedHotel?.gstNumber || "12ABCDE3456F1Z5",
      taxRate: 0.18, // 18% GST
      footer: "Thank you for dining with us!",
    }),
    [selectedHotel, activeHotelName]
  );

  // ✅ ENHANCED: Enhanced order statistics with corrected mapping for simplified status system
  const displayStats = useMemo(() => {
    const stats = {
      total: orderStats.total || 0,
      received: orderStats.received || 0,
      completed: orderStats.completed || 0,
      rejected: orderStats.rejected || 0,
      totalRevenue: orderStats.totalRevenue || 0,
      avgOrderValue: orderStats.avgOrderValue || 0,
      uniqueCustomers: orderStats.uniqueCustomers || 0,
      peakHour: orderStats.peakHour || "N/A",
    };

    stats.activeOrders = stats.received;
    stats.completionRate =
      stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    return stats;
  }, [orderStats]);

  // ✅ NEW: Enhanced menu statistics
  const menuStats = useMemo(
    () => ({
      total: menuCount || 0,
      available: availableMenuCount || 0,
      unavailable: unavailableMenuCount || 0,
      discounted: filteredAndSortedMenus.filter(
        (menu) => (menu.discount || 0) > 0
      ).length,
      categories: new Set(
        filteredAndSortedMenus.map((menu) => menu.menuCategory)
      ).size,
      avgPrice:
        filteredAndSortedMenus.length > 0
          ? Math.round(
              filteredAndSortedMenus.reduce(
                (sum, menu) =>
                  sum + (parseFloat(menu.finalPrice || menu.menuPrice) || 0),
                0
              ) / filteredAndSortedMenus.length
            )
          : 0,
    }),
    [
      filteredAndSortedMenus,
      menuCount,
      availableMenuCount,
      unavailableMenuCount,
    ]
  );

  // Event handlers
  const handleViewDetails = useCallback((order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refreshOrders(), refreshMenus()]);
    } catch (error) {
      console.error("Error refreshing dashboard:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [refreshOrders, refreshMenus]);

  const handleExportData = useCallback(() => {
    try {
      exportOrdersCSV();
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  }, [exportOrdersCSV]);

  const handleOrderStatusUpdate = useCallback(
    async (orderId, newStatus) => {
      const result = await updateOrderStatus(orderId, newStatus, {
        updatedBy: currentUser?.uid || "admin",
        updatedAt: new Date().toISOString(),
        kitchen: {
          notes: `Status updated by admin from dashboard`,
        },
      });

      // Update selected order if it's the same one
      if (result.success && selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          normalizedStatus: newStatus,
          status: newStatus,
        });
      }

      return result;
    },
    [updateOrderStatus, selectedOrder, currentUser]
  );

  // Loading state for all data sources
  const isAllDataLoading =
    loading || menuLoading || categoriesLoading || offersLoading;
  const hasAnyError = error || menuError || categoriesError || offersError;

  // ✅ NEW: Permission check UI
  if (!hasPermission) {
    return (
      <AdminDashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600">
              You don't have permission to view this dashboard.
            </p>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  // ✅ NEW: No hotel selected state
  if (!activeHotelName) {
    return (
      <AdminDashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Hotel Selected
            </h3>
            <p className="text-gray-600">
              Please select a hotel to view the dashboard.
            </p>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* ✅ NEW: Connection Status Bar */}
        {connectionStatus !== "connected" && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 rounded-lg">
            <div className="flex items-center justify-between">
              <ConnectionStatusIndicator />
              {retryCount > 0 && (
                <span className="text-xs text-gray-600">
                  Retry attempt: {retryCount}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Header Section */}
        <div>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="text-left">
              <div className="flex items-center gap-4 mb-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                  Dashboard Overview
                </h1>
                {/* ✅ NEW: Live status indicator */}
                {connectionStatus === "connected" && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Live</span>
                  </div>
                )}
              </div>

              <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed max-w-2xl">
                Welcome back! Here's what's happening at{" "}
                <span className="font-semibold text-orange-600">
                  {selectedHotel?.businessName ||
                    selectedHotel?.hotelName ||
                    activeHotelName}
                </span>{" "}
                today.
              </p>
            </div>

            {/* ✅ NEW: Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={!hasOrders}
              >
                <Download size={16} />
                Export
              </button>
              <button
                onClick={handleRefresh}
                className={`flex items-center gap-2 px-3 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors ${
                  isRefreshing ? "opacity-75 cursor-not-allowed" : ""
                }`}
                disabled={isRefreshing}
              >
                <RefreshCw
                  size={16}
                  className={isRefreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-4">
          <div className="flex justify-between items-center mb-1">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Order Analytics
              </h2>
              <p className="text-gray-600">
                Comprehensive insights and performance metrics
              </p>
            </div>
            <ConnectionStatusIndicator />
          </div>

          {/* Enhanced Time Period Navigation */}
          <TimePeriodSelector
            selectedTimePeriod={selectedTimePeriod}
            onTimePeriodChange={handleTimePeriodChange}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            variant="default"
            showDatePicker={true}
            className="mb-6"
            options={timePeriodOptions}
            disableFutureDates={true}
          />

          {/* ✅ NEW: Period Display with Enhanced Metrics */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-700 font-medium">
              {periodDisplayText}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {timeFilteredOrders.length} orders
              </span>
              {orderStats.totalRevenue > 0 && (
                <span className="flex items-center gap-1">
                  <DollarSign size={14} />₹
                  {orderStats.totalRevenue.toLocaleString()}
                </span>
              )}
              {displayStats.completionRate > 0 && (
                <span className="flex items-center gap-1">
                  <TrendingUp size={14} />
                  {displayStats.completionRate}% completion
                </span>
              )}
              {displayStats.peakHour !== "N/A" && (
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  Peak: {displayStats.peakHour}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ✅ ENHANCED: Menu Management Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Total Menu Items"
              value={menuStats.total}
              color="blue"
              icon={ShoppingBag}
              subtitle={
                menuAnalytics.topMenus?.length > 0
                  ? `${menuAnalytics.topMenus[0]?.menuName} is top seller`
                  : `Avg price: ₹${menuStats.avgPrice}`
              }
              loading={menuLoading}
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Total Categories"
              value={totalCategories || 0}
              color="green"
              icon={BarChart3}
              subtitle={
                categoryAnalytics.categoryStats?.length > 0
                  ? `${categoryAnalytics.categoryStats[0]?.category} leads`
                  : "Menu organization"
              }
              loading={categoriesLoading}
            />
          </div>

          <StatCard
            icon={TrendingUp}
            title="Available Items"
            value={menuStats.available}
            color="green"
            subtitle={`${Math.round(
              (menuStats.available / (menuStats.total || 1)) * 100
            )}% availability`}
            loading={menuLoading}
          />

          <StatCard
            icon={DollarSign}
            title="Special Offers"
            value={activeOfferCount || 0}
            color="orange"
            subtitle={`${menuStats.discounted} items discounted`}
            loading={offersLoading}
          />
        </div>

        {/* ✅ ENHANCED: Order Stats Grid with better insights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Total Orders"
              value={displayStats.total}
              color="indigo"
              icon={ShoppingBag}
              subtitle={`${displayStats.uniqueCustomers} unique customers`}
              trend={displayStats.total > todayStats.total ? "up" : "neutral"}
              loading={loading}
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              icon={CheckCircle}
              title="Completed Orders"
              value={displayStats.completed}
              color="green"
              subtitle={`${displayStats.completionRate}% completion rate`}
              loading={loading}
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Active Orders"
              value={displayStats.activeOrders}
              color="orange"
              icon={Clock}
              subtitle="Currently processing"
              alert={displayStats.activeOrders > 10}
              loading={loading}
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Rejected Orders"
              value={displayStats.rejected}
              color="red"
              icon={AlertCircle}
              subtitle={
                displayStats.total > 0
                  ? `${Math.round(
                      (displayStats.rejected / displayStats.total) * 100
                    )}% rejection rate`
                  : "No rejections"
              }
              alert={displayStats.rejected > 5}
              loading={loading}
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Total Revenue"
              value={`₹${displayStats.totalRevenue?.toLocaleString() || 0}`}
              color="yellow"
              icon={TrendingUp}
              subtitle={
                displayStats.avgOrderValue > 0
                  ? `₹${displayStats.avgOrderValue} avg order`
                  : "No revenue yet"
              }
              trend="up"
              loading={loading}
            />
          </div>
        </div>

        {/* Enhanced Analytics Tables and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders by Category with Enhanced Data */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Orders by Category
                  </h2>
                </div>
                <div className="text-sm text-gray-500">
                  {categoryAnalytics.totalCategoryOrders || 0} total items
                  ordered
                </div>
              </div>

              {categoryAnalytics.categoryStats?.length > 0 ? (
                <DynamicTable
                  columns={OrdersByCategoryColumn}
                  data={categoryAnalytics.categoryStats}
                  showPagination={false}
                  showRowsPerPage={false}
                  emptyMessage="No category data available"
                  className="border-0 shadow-none"
                  headerClassName="bg-gradient-to-r from-blue-500 to-blue-600"
                  highlightRows={(row) => {
                    // Highlight top performing category
                    if (
                      categoryAnalytics.categoryStats[0]?.category ===
                      row.category
                    ) {
                      return "bg-blue-50";
                    }
                    return "";
                  }}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No category data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Top Menu Items with Better Analytics */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-1">
                <Award className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Top Performing Menu Items
                </h3>
              </div>
              <div className="text-sm text-gray-500">
                Based on{" "}
                {selectedTimePeriod === "daily"
                  ? "today's"
                  : periodDisplayText.toLowerCase()}{" "}
                orders
              </div>

              {menuAnalytics.topMenus?.length > 0 ? (
                <TopMenuCards
                  topMenus={menuAnalytics.topMenus}
                  showRevenue={true}
                  showPercentage={true}
                  totalOrders={menuAnalytics.totalMenuOrders}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Award className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No menu performance data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Orders by Menu */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Orders by Menu Item
              </h2>
            </div>
            <div className="text-sm text-gray-500 mb-2">
              {menuAnalytics.menuStats?.length || 0} items •{" "}
              {menuAnalytics.totalMenuOrders || 0} total orders
            </div>
          </div>

          {menuAnalytics.menuStats?.length > 0 ? (
            <DynamicTable
              columns={OrdersByMenuColumn}
              data={menuAnalytics.menuStats}
              showPagination={menuAnalytics.menuStats.length > 10}
              showRowsPerPage={menuAnalytics.menuStats.length > 10}
              initialRowsPerPage={10}
              rowsPerPageOptions={[5, 10, 15, 20]}
              emptyMessage="No menu data available"
              className="border-0 shadow-none"
              sortable={true}
              highlightRows={(row) => {
                // Highlight top 3 performing items
                const topThree = menuAnalytics.menuStats?.slice(0, 3) || [];
                if (topThree.find((item) => item.menuId === row.menuId)) {
                  return "bg-yellow-50";
                }
                return "";
              }}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No menu performance data available</p>
            </div>
          )}
        </div>

        {/* ✅ ENHANCED: Loading States */}
        {isAllDataLoading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" text="Loading dashboard data..." />
          </div>
        )}

        {/* ✅ ENHANCED: Error States */}
        {hasAnyError && connectionStatus === "error" && (
          <div className="py-8">
            <ErrorState
              size="md"
              message={errorMessage || "Failed to load dashboard data"}
              title="Dashboard Connection Error"
              showRetry={true}
              onRetry={handleRefresh}
            />
          </div>
        )}

        {/* Enhanced Empty State */}
        {!loading && !isError && !hasOrders && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-12">
            <div className="text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {selectedTimePeriod === "daily"
                  ? "No Orders Today"
                  : "No Orders Yet"}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {selectedTimePeriod === "daily"
                  ? `No orders have been placed for ${new Date(
                      selectedDate
                    ).toLocaleDateString()}. Try selecting a different date or time period.`
                  : `Your dashboard will come alive once you start receiving orders for ${activeHotelName}. Check your menu setup and ensure everything is configured correctly.`}
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Refresh Dashboard
                </button>
                {selectedTimePeriod === "daily" && (
                  <button
                    onClick={() => handleTimePeriodChange("total")}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    View All Orders
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={handleCloseDetails}
            onUpdateStatus={handleOrderStatusUpdate}
            orderStatuses={statusOptions}
            isSubmitting={submitting}
            showDetailedInfo={true}
            restaurantInfo={restaurantInfo}
          />
        )}

        {/* Print Bill Modal */}
        {showPrintBill && selectedOrderForBill && (
          <PrintBill
            order={selectedOrderForBill}
            restaurantInfo={restaurantInfo}
            onClose={() => {
              setShowPrintBill(false);
              setSelectedOrderForBill(null);
            }}
          />
        )}

        {/* Loading overlay for operations */}
        {submitting && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3 shadow-lg">
              <LoadingSpinner size="sm" />
              <span className="text-gray-700 font-medium">Processing...</span>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;
