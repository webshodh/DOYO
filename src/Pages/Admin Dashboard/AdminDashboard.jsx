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
import { useMenu } from "hooks/useMenu";

/**
 * Admin Dashboard Component
 * Provides comprehensive analytics and management interface for hotel orders
 */
const AdminDashboard = () => {
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

  // Use custom hook for menu management
  const {
    filteredAndSortedMenus,
    menuLoading,
    menuError,
    refreshMenus,
    totalMenus,
    menuCount,
    hasMenus,
    hasSearchResults,
  } = useMenu(hotelName);

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

  // Memoized calculations for menu statistics
  const stats = useMemo(
    () => ({
      total: menuCount,
      available: filteredAndSortedMenus.filter(
        (menu) => menu.availability === "Available"
      ).length,
      discounted: filteredAndSortedMenus.filter((menu) => menu.discount > 0)
        .length,
      categories: new Set(
        filteredAndSortedMenus.map((menu) => menu.menuCategory)
      ).size,
    }),
    [filteredAndSortedMenus, menuCount]
  );
  return (
    <AdminDashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Enhanced Header Section */}
        <div>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="text-left">
              <div className="flex items-center gap-4 mb-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                  Dashboard Overview
                </h1>
              </div>

              <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed max-w-2xl">
                Welcome back! Here's what's happening at{" "}
                <span className="font-semibold text-orange-600">
                  {selectedHotel?.name || "your hotel"}
                </span>{" "}
                today.
              </p>
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
          {/* <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
          </div> */}
        </div>

        {/* Enhanced Menu Management Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Total Menu Items"
              value={menuCount || 0}
              color="blue"
              icon={ShoppingBag}
              subtitle={
                menuAnalytics.topMenus.length > 0
                  ? `${menuAnalytics.topMenus[0]?.menuName} is top seller`
                  : ""
              }
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Total Categories"
              value={totalCategories || 0}
              color="green"
              icon={BarChart3}
              subtitle={
                categoryAnalytics.categoryStats.length > 0
                  ? `${categoryAnalytics.categoryStats[0]?.category} leads`
                  : ""
              }
            />
          </div>

          <StatCard
            icon={TrendingUp}
            title="Available"
            value={stats.available}
            color="green"
          />
          <StatCard
            icon={DollarSign}
            title="With Discount"
            value={stats.discounted}
            color="orange"
          />
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
                  {categoryAnalytics.totalCategoryOrders} total items ordered
                </div>
              </div>

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
            </div>
          </div>

          {/* Enhanced Top Menu Items with Better Analytics */}
          {menuAnalytics.topMenus.length > 0 && (
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

                <TopMenuCards
                  topMenus={menuAnalytics.topMenus}
                  showRevenue={true}
                  showPercentage={true}
                  totalOrders={menuAnalytics.totalMenuOrders}
                />
              </div>
            </div>
          )}
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
              {menuAnalytics.menuStats.length} items •{" "}
              {menuAnalytics.totalMenuOrders} total orders
            </div>
          </div>

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
              const topThree = menuAnalytics.menuStats.slice(0, 3);
              if (topThree.find((item) => item.menuId === row.menuId)) {
                return "bg-yellow-50";
              }
              return "";
            }}
          />
        </div>

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
