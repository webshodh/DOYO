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
} from "lucide-react";

// Hooks and utilities
import { useOrderData } from "../../hooks/useOrder"; // Updated import path
import {
  useCategoriesData,
  useMainCategoriesData,
  useMenuData,
} from "../../data";
import useOptionsData from "../../data/useOptionsData";

// Context
import { useHotelSelection } from "../../context/HotelSelectionContext";

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
 */
const OrderDashboard = () => {
  const { hotelName } = useParams();
  const { selectedHotel } = useHotelSelection();

  // Modal and UI state
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

    // State management
    loading,
    submitting,
    error,
    connectionStatus,
    lastUpdated,

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
  } = useOrderData(hotelName, {
    includeMenuData: true,
    defaultTimePeriod: "daily",
    defaultStatusFilter: "all",
    sortBy: "timestamp",
    sortOrder: "desc",
  });

  // Menu and category management data
  const {
    menuData: managementMenuData,
    totalMenus,
    loading: menuLoading,
    error: menuError,
  } = useMenuData(hotelName);

  const {
    categoriesData,
    totalCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategoriesData(hotelName);

  const {
    optionsData,
    totalOptionsCount,
    categories,
    optionTypes,
    error: optionsError,
  } = useOptionsData(hotelName);

  // Derived values
  const optionsCategoryCount = categories?.length || 0;
  const { totalMainCategories } = useMainCategoriesData(hotelName);

  // Connection status indicator
  const connectionStatusInfo = useMemo(() => {
    switch (connectionStatus) {
      case "connected":
        return { color: "green", text: "Live Data", icon: CheckCircle };
      case "connecting":
        return { color: "yellow", text: "Connecting...", icon: LoaderCircle };
      case "error":
        return { color: "red", text: "Connection Error", icon: AlertCircle };
      case "disconnected":
        return { color: "gray", text: "Offline", icon: AlertCircle };
      default:
        return { color: "gray", text: "Unknown", icon: AlertCircle };
    }
  }, [connectionStatus]);

  // Restaurant information for the bill - Get from captain data or use defaults
  const restaurantInfo = useMemo(
    () => ({
      name: hotelName || hotelName || "Restaurant Name",
      address: "Restaurant Address, City, State - 123456",
      phone: "+91 12345 67890",
      gst: "12ABCDE3456F1Z5",
      taxRate: 0.18, // 18% GST
      footer: "Thank you for dining with us!",
    }),
    [hotelName]
  );

  // Enhanced order statistics with corrected mapping for simplified status system
  const displayStats = useMemo(() => {
    const stats = {
      total: orderStats.total || 0,
      received: orderStats.received || 0,
      completed: orderStats.completed || 0,
      rejected: orderStats.rejected || 0,
      totalRevenue: orderStats.totalRevenue || 0,
    };

    stats.activeOrders = stats.received;
    stats.completionRate =
      stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    return stats;
  }, [orderStats]);

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
        updatedBy: "admin",
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
    [updateOrderStatus, selectedOrder]
  );

  // Loading state for menu management data
  const isMenuManagementLoading = menuLoading || categoriesLoading;
  const menuManagementError = menuError || categoriesError || optionsError;

  // Handle print bill
  const handlePrintBill = useCallback((order) => {
    console.log("Printing bill for order:", order); // Debug log
    setSelectedOrderForBill(order);
    setShowPrintBill(true);
  }, []);
  return (
    <AdminDashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Enhanced Header Section */}
        <div>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="text-left">
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                  Dashboard Overview
                </h1>

                {/* Connection Status Indicator */}
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
                  ${
                    connectionStatusInfo.color === "green"
                      ? "bg-green-100 text-green-700"
                      : ""
                  }
                  ${
                    connectionStatusInfo.color === "yellow"
                      ? "bg-yellow-100 text-yellow-700"
                      : ""
                  }
                  ${
                    connectionStatusInfo.color === "red"
                      ? "bg-red-100 text-red-700"
                      : ""
                  }
                  ${
                    connectionStatusInfo.color === "gray"
                      ? "bg-gray-100 text-gray-700"
                      : ""
                  }
                `}
                >
                  <connectionStatusInfo.icon className="w-3 h-3" />
                  {connectionStatusInfo.text}
                </div>
              </div>

              <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed max-w-2xl">
                Welcome back! Here's what's happening at{" "}
                <span className="font-semibold text-orange-600">
                  {selectedHotel?.name || "your hotel"}
                </span>{" "}
                today.
              </p>
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <div className="text-sm text-gray-500">
                  Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                </div>
              )}

              {hasOrders && (
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
              )}

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                {isRefreshing ? "Refreshing..." : "Refresh"}
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

          {/* Enhanced Period Display with Metrics */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-sm text-gray-600 font-medium">
              {periodDisplayText}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{timeFilteredOrders.length} orders</span>
              {orderStats.totalRevenue > 0 && (
                <span>₹{orderStats.totalRevenue.toLocaleString()} revenue</span>
              )}
              {displayStats.completionRate > 0 && (
                <span>{displayStats.completionRate}% completion rate</span>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Menu Management Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Total Orders"
              value={orderStats.total}
              color="indigo"
              icon={ShoppingBag}
              subtitle={`${displayStats.uniqueCustomers} unique customers`}
              trend={orderStats.total > todayStats.total ? "up" : "neutral"}
            />
          </div>
          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              icon={CheckCircle}
              title="Completed Orders"
              value={displayStats.completed}
              color="green"
              subtitle={`${displayStats.completionRate}% completion rate`}
            />
          </div>
          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Active Orders"
              value={displayStats.activeOrders}
              color="orange"
              icon={Clock}
              subtitle="Pending + Preparing + Ready"
              alert={displayStats.activeOrders > 10}
            />
          </div>
          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Rejected Orders"
              value={orderStats.rejected}
              color="red"
              icon={AlertCircle}
              subtitle={
                orderStats.total > 0
                  ? `${Math.round(
                      (orderStats.rejected / orderStats.total) * 100
                    )}% rejection rate`
                  : ""
              }
              alert={orderStats.rejected > 5}
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Total Revenue"
              value={`₹${orderStats.totalRevenue?.toLocaleString() || 0}`}
              color="yellow"
              icon={TrendingUp}
              subtitle={
                displayStats.avgOrderValue > 0
                  ? `₹${displayStats.avgOrderValue} avg order`
                  : ""
              }
              trend={displayStats.revenueGrowth > 0 ? "up" : "neutral"}
            />
          </div>
        </div>

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
                    Showing {timeFilteredOrders.length} of {orders.length}{" "}
                    orders
                  </span>
                  {statusFilter !== "all" && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {statusFilter} only
                    </span>
                  )}
                </div>
              </div>

              <OrderDetailsTable
                orders={timeFilteredOrders.slice(0, 20)} // Show recent 20 orders
                onViewDetails={handleViewDetails}
                onUpdateStatus={handleOrderStatusUpdate}
                isUpdating={submitting}
                showConnectionStatus={!isConnected}
                onPrintBill={handlePrintBill}
              />
            </div>
          </div>
        )}

        {/* Enhanced Loading States */}
        {(loading || isMenuManagementLoading) && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" text="Loading dashboard data..." />
          </div>
        )}

        {/* Enhanced Error States */}
        {(isError || menuManagementError) && (
          <div className="py-8">
            <ErrorState
              size="md"
              message={errorMessage || menuManagementError}
              title="Dashboard Error"
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
                  : "Your dashboard will come alive once you start receiving orders. Check your menu setup and ensure everything is configured correctly."}
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
          />
        )}

        {/* Print Bill Modal */}
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
