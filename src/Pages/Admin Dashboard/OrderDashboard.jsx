// src/Pages/Admin/OrderDashboard.jsx
import React, { useState, useCallback, useMemo, memo } from "react";
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
  Wifi,
  WifiOff,
  Calendar,
  Filter,
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
 * Order Dashboard Component
 * Provides comprehensive order analytics and management interface
 * ✅ MIGRATED TO FIRESTORE with enhanced real-time capabilities
 */
const OrderDashboard = () => {
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

  // ✅ NEW: Permission check
  const hasPermission = useMemo(() => {
    return isAdmin() && canManageHotel(activeHotelName);
  }, [isAdmin, canManageHotel, activeHotelName]);

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
    dataAge,

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

  // ✅ ENHANCED: Use Firestore-based menu hook for management data
  const {
    menus: managementMenuData,
    categories,
    loading: menuLoading,
    error: menuError,
    connectionStatus: menuConnectionStatus,
    menuCount: totalMenus,
    categoryCount: totalCategories,
  } = useMenu(activeHotelName);

  // ✅ ENHANCED: Use category hook for additional insights
  const {
    categories: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategory(activeHotelName);

  // ✅ NEW: Use offers hook for promotional insights
  const {
    offers,
    loading: offersLoading,
    offerCount: totalOptionsCount,
    activeOfferCount,
  } = useOffers(activeHotelName);

  // ✅ NEW: Connection status indicator with multiple sources
  const ConnectionStatusIndicator = memo(() => {
    const statuses = [connectionStatus, menuConnectionStatus].filter(Boolean);
    const hasError = statuses.some((status) => status === "error");
    const isConnecting =
      statuses.some((status) => status === "connecting") || isRetrying;
    const allConnected = statuses.every((status) => status === "connected");

    if (hasError) {
      return (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <WifiOff size={16} />
          <span>Connection Error</span>
          {canRetry && (
            <button
              onClick={handleRefresh}
              className="text-blue-600 hover:text-blue-800 underline ml-1"
            >
              Retry
            </button>
          )}
        </div>
      );
    } else if (isConnecting) {
      return (
        <div className="flex items-center gap-2 text-yellow-600 text-sm">
          <Wifi className="animate-pulse" size={16} />
          <span>Connecting...</span>
        </div>
      );
    } else if (allConnected) {
      return (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle size={16} />
          <span>Live Data</span>
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              • Updated {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
      );
    }

    return null;
  });

  // Restaurant information for the bill - Enhanced with hotel context
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
      taxRate: selectedHotel?.taxRate || 0.18, // 18% GST
      footer: selectedHotel?.billFooter || "Thank you for dining with us!",
    }),
    [selectedHotel, activeHotelName]
  );

  // ✅ ENHANCED: Enhanced order statistics with better calculations
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

    stats.rejectionRate =
      stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0;

    // Revenue growth calculation
    const todayRevenue = todayStats.revenue || 0;
    const totalRevenue = stats.totalRevenue;
    stats.revenueGrowth = totalRevenue > todayRevenue ? 1 : 0;

    return stats;
  }, [orderStats, todayStats]);

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
      await refreshOrders();
    } catch (error) {
      console.error("Error refreshing dashboard:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [refreshOrders]);

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
          notes: `Status updated by admin from order dashboard`,
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

  // Handle print bill
  const handlePrintBill = useCallback((order) => {
    console.log("Printing bill for order:", order);
    setSelectedOrderForBill(order);
    setShowPrintBill(true);
  }, []);

  // Loading state for all data sources
  const isAllDataLoading =
    loading || menuLoading || categoriesLoading || offersLoading;
  const hasAnyError = error || menuError || categoriesError;

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
              You don't have permission to view this order dashboard.
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
              Please select a hotel to view the order dashboard.
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
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                  Order Dashboard
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
                Real-time order monitoring and analytics for{" "}
                <span className="font-semibold text-orange-600">
                  {selectedHotel?.businessName ||
                    selectedHotel?.hotelName ||
                    activeHotelName}
                </span>
              </p>
            </div>

            {/* ✅ NEW: Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportData}
                disabled={!hasOrders}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} />
                Export
              </button>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`flex items-center gap-2 px-3 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors ${
                  isRefreshing ? "opacity-75 cursor-not-allowed" : ""
                }`}
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
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
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

          {/* ✅ NEW: Period summary with enhanced metrics */}
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
                  <TrendingUp size={14} />₹
                  {orderStats.totalRevenue.toLocaleString()}
                </span>
              )}
              {displayStats.completionRate > 0 && (
                <span className="flex items-center gap-1">
                  <CheckCircle size={14} />
                  {displayStats.completionRate}% completed
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

        {/* ✅ ENHANCED: Stats Grid with better insights */}
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
              subtitle={`${displayStats.rejectionRate}% rejection rate`}
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
              trend={displayStats.revenueGrowth > 0 ? "up" : "neutral"}
              loading={loading}
            />
          </div>
        </div>

        {/* ✅ NEW: Status Filter Bar */}
        {hasOrders && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Filter size={16} />
                Filter by Status
              </h3>
              {statusFilter !== "all" && (
                <button
                  onClick={() => handleStatusFilterChange("all")}
                  className="text-xs text-red-600 hover:text-red-800 underline"
                >
                  Clear Filter
                </button>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleStatusFilterChange("all")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All ({displayStats.total})
              </button>
              <button
                onClick={() => handleStatusFilterChange("received")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === "received"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                New ({displayStats.received})
              </button>
              <button
                onClick={() => handleStatusFilterChange("completed")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === "completed"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Completed ({displayStats.completed})
              </button>
              <button
                onClick={() => handleStatusFilterChange("rejected")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === "rejected"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Rejected ({displayStats.rejected})
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Recent Orders Table */}
        {hasOrders && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-gray-700" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Orders
                  </h2>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    Showing {Math.min(20, timeFilteredOrders.length)} of{" "}
                    {timeFilteredOrders.length} orders
                  </span>
                  {statusFilter !== "all" && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                      {statusFilter} only
                    </span>
                  )}
                </div>
              </div>

              {timeFilteredOrders.length > 0 ? (
                <OrderDetailsTable
                  orders={timeFilteredOrders.slice(0, 20)} // Show recent 20 orders
                  onViewDetails={handleViewDetails}
                  onUpdateStatus={handleOrderStatusUpdate}
                  isUpdating={submitting}
                  showConnectionStatus={!isConnected}
                  onPrintBill={handlePrintBill}
                  connectionStatus={connectionStatus}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No orders found for the selected period</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Loading States */}
        {isAllDataLoading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" text="Loading order dashboard data..." />
          </div>
        )}

        {/* Enhanced Error States */}
        {hasAnyError && connectionStatus === "error" && (
          <div className="py-8">
            <ErrorState
              size="md"
              message={errorMessage || "Failed to load order dashboard data"}
              title="Order Dashboard Error"
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
                  : `Your order dashboard will come alive once customers start placing orders at ${activeHotelName}. Check your menu setup and ensure everything is configured correctly.`}
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

        {/* ✅ ENHANCED: Print Bill Modal */}
        {showPrintBill && selectedOrderForBill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto shadow-2xl">
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
                onClose={() => {
                  setShowPrintBill(false);
                  setSelectedOrderForBill(null);
                }}
              />
            </div>
          </div>
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

export default OrderDashboard;
