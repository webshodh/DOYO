// src/Pages/Admin/KitchenAdminPage.jsx
import React, { useState, useCallback, useMemo, memo, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import {
  Calendar,
  LoaderCircle,
  AlertCircle,
  TrendingUp,
  Grid,
  ChefHat,
  Clock,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Filter,
} from "lucide-react";

// ✅ UPDATED: Import Firestore-based hooks
import { useOrderData } from "../../hooks/useOrder";

// ✅ NEW: Import context hooks for better integration
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";

import PageTitle from "../../atoms/PageTitle";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import StatCard from "components/Cards/StatCard";
import ErrorMessage from "atoms/Messages/ErrorMessage";

// Lazy load heavy components
const HeaderStats = React.lazy(() => import("components/HeaderStats"));
const OrderFilters = React.lazy(() =>
  import("components/order-dashboard/OrderFilters")
);
const OrderCard = React.lazy(() => import("components/Cards/OrderCard"));
const OrderDetailsModal = React.lazy(() =>
  import("components/order-dashboard/OrderDetailsModal")
);

// ✅ ENHANCED: Time period tabs component with better styling
const TimePeriodTabs = memo(
  ({ selectedTimePeriod, onTimePeriodChange, orderCounts = {} }) => {
    const periods = [
      { key: "daily", label: "Today", count: orderCounts.daily || 0 },
      { key: "weekly", label: "This Week", count: orderCounts.weekly || 0 },
      { key: "monthly", label: "This Month", count: orderCounts.monthly || 0 },
      { key: "total", label: "All Time", count: orderCounts.total || 0 },
    ];

    return (
      <div className="flex gap-2 flex-wrap">
        {periods.map((period) => (
          <button
            key={period.key}
            onClick={() => onTimePeriodChange(period.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              selectedTimePeriod === period.key
                ? "bg-orange-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
            }`}
          >
            <span>{period.label}</span>
            {period.count > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  selectedTimePeriod === period.key
                    ? "bg-orange-600 text-white"
                    : "bg-gray-300 text-gray-700"
                }`}
              >
                {period.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }
);

TimePeriodTabs.displayName = "TimePeriodTabs";

// ✅ NEW: Kitchen Status Filter Component
const KitchenStatusFilter = memo(
  ({ activeFilter, onFilterChange, orderStats }) => {
    const filters = [
      {
        key: "all",
        label: "All Orders",
        count: orderStats.total,
        color: "blue",
      },
      {
        key: "received",
        label: "New Orders",
        count: orderStats.received,
        color: "orange",
      },
      {
        key: "completed",
        label: "Completed",
        count: orderStats.completed,
        color: "green",
      },
      {
        key: "rejected",
        label: "Rejected",
        count: orderStats.rejected,
        color: "red",
      },
    ];

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Filter size={16} />
            Filter by Status
          </h3>
          {activeFilter !== "all" && (
            <button
              onClick={() => onFilterChange("all")}
              className="text-xs text-red-600 hover:text-red-800 underline"
            >
              Clear Filter
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => onFilterChange(filter.key)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeFilter === filter.key
                  ? `bg-${filter.color}-500 text-white shadow-md`
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>{filter.label}</span>
              {filter.count > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeFilter === filter.key
                      ? `bg-${filter.color}-600 text-white`
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {filter.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }
);

KitchenStatusFilter.displayName = "KitchenStatusFilter";

// Main KitchenAdminPage component
const KitchenAdminPage = memo(() => {
  const { hotelName } = useParams();
  const navigate = useNavigate();

  // ✅ NEW: Use context hooks for better integration
  const { currentUser, isAdmin, canManageHotel } = useAuth();
  const { selectedHotel, selectHotelById } = useHotelContext();

  // ✅ ENHANCED: Use the active hotel name with fallback
  const activeHotelName = hotelName || selectedHotel?.name || selectedHotel?.id;

  // Modal state for order details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // ✅ ENHANCED: Use Firestore-based order data hook (replaces useKitchenOrders)
  const {
    orders,
    filteredOrders,
    timeFilteredOrders,
    loading,
    submitting,
    error,
    connectionStatus,
    lastUpdated,
    retryCount,

    // Filter states
    statusFilter: activeFilter,
    selectedDate,
    selectedTimePeriod,
    searchTerm,

    // Order statistics
    orderStats,
    todayStats,

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
    handleStatusFilterChange: handleFilterChange,
    handleDateChange,
    handleTimePeriodChange,
    handleSearchChange,
    clearFilters,

    // Actions
    updateOrderStatus: handleStatusChange,
    refreshOrders,
    exportOrdersCSV,

    // Helper functions
    getOrderById,
    getOrdersByStatus,

    // Options
    statusOptions,
    timePeriodOptions,
  } = useOrderData(activeHotelName, {
    includeMenuData: false, // Kitchen doesn't need detailed menu data
    defaultTimePeriod: "daily",
    defaultStatusFilter: "all",
    sortBy: "timestamp",
    sortOrder: "desc",
  });

  // ✅ ENHANCED: Memoized calculations for dashboard stats with kitchen focus
  const dashboardStats = useMemo(() => {
    const stats = {
      totalOrders: orderStats.total || 0,
      received: orderStats.received || 0,
      completed: orderStats.completed || 0,
      rejected: orderStats.rejected || 0,
    };

    // Calculate efficiency metrics
    stats.completionRate =
      stats.totalOrders > 0
        ? Math.round((stats.completed / stats.totalOrders) * 100)
        : 0;

    stats.rejectionRate =
      stats.totalOrders > 0
        ? Math.round((stats.rejected / stats.totalOrders) * 100)
        : 0;

    stats.activeOrders = stats.received;

    return stats;
  }, [orderStats]);

  // ✅ NEW: Get period-wise order counts
  const periodOrderCounts = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayOrders = orders.filter(
      (order) => order.orderDate === today
    ).length;

    return {
      daily: todayOrders,
      weekly: orderStats.total, // Approximate - could be enhanced
      monthly: orderStats.total, // Approximate - could be enhanced
      total: orders.length,
    };
  }, [orders, orderStats.total]);

  // ✅ NEW: Connection status indicator
  const ConnectionStatusIndicator = memo(() => {
    if (connectionStatus === "connecting" || isRetrying) {
      return (
        <div className="flex items-center gap-2 text-yellow-600 text-sm">
          <Wifi className="animate-pulse" size={16} />
          <span>{isRetrying ? "Retrying..." : "Connecting..."}</span>
        </div>
      );
    }

    if (connectionStatus === "error") {
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
    }

    if (connectionStatus === "connected") {
      return (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle size={16} />
          <span>Live Kitchen View</span>
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
      console.error("Error refreshing kitchen orders:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [refreshOrders]);

  // ✅ ENHANCED: Handle order status updates with kitchen context
  const handleOrderStatusUpdate = useCallback(
    async (orderId, newStatus) => {
      const result = await handleStatusChange(orderId, newStatus, {
        updatedBy: currentUser?.uid || "kitchen",
        updatedAt: new Date().toISOString(),
        kitchen: {
          notes: `Status updated from kitchen dashboard`,
          updatedBy: currentUser?.email || "Kitchen Staff",
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
    [handleStatusChange, selectedOrder, currentUser]
  );

  // ✅ NEW: Permission check UI
  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600">
            You don't have permission to view the kitchen dashboard.
          </p>
        </div>
      </div>
    );
  }

  // ✅ NEW: No hotel selected state
  if (!activeHotelName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Hotel Selected
          </h3>
          <p className="text-gray-600">
            Please select a hotel to view the kitchen dashboard.
          </p>
        </div>
      </div>
    );
  }

  // ✅ ENHANCED: Error state with connection info
  if (error && connectionStatus === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <ErrorMessage
              error={error}
              onRetry={handleRefresh}
              title="Error Loading Kitchen Orders"
              showRetryButton={canRetry}
            />
            <div className="mt-4 text-center">
              <ConnectionStatusIndicator />
              {retryCount > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Attempted {retryCount} time{retryCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !orders.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading kitchen orders..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        {/* ✅ NEW: Connection Status Bar */}
        {connectionStatus !== "connected" && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 mb-4">
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

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <PageTitle
              pageTitle="Kitchen Dashboard"
              className="text-2xl sm:text-3xl font-bold text-gray-900"
              description={`Manage orders for ${
                selectedHotel?.businessName ||
                selectedHotel?.hotelName ||
                activeHotelName
              }`}
            />

            {/* ✅ NEW: Live status indicator */}
            {connectionStatus === "connected" && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Live kitchen updates</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Date picker - only show for daily view */}
            {selectedTimePeriod === "daily" && (
              <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-gray-200 shadow-sm">
                <Calendar size={16} className="text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="bg-transparent border-none focus:outline-none text-sm focus:ring-2 focus:ring-orange-500 rounded"
                />
              </div>
            )}

            {/* ✅ NEW: Export button */}
            {hasOrders && (
              <button
                onClick={exportOrdersCSV}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                📊 Export
              </button>
            )}

            <button
              onClick={handleRefresh}
              disabled={isRefreshing || submitting}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                size={16}
                className={isRefreshing || submitting ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Time Period Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TimePeriodTabs
              selectedTimePeriod={selectedTimePeriod}
              onTimePeriodChange={handleTimePeriodChange}
              orderCounts={periodOrderCounts}
            />
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 font-medium">
                {periodDisplayText}
              </div>
              <ConnectionStatusIndicator />
            </div>
          </div>
        </div>

        {/* ✅ ENHANCED: Stats Cards with kitchen-specific metrics */}
        {hasOrders && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={ChefHat}
              title="Total Orders"
              value={dashboardStats.totalOrders}
              color="blue"
              subtitle={`${dashboardStats.completionRate}% completion rate`}
            />
            <StatCard
              icon={Clock}
              title="New Orders"
              value={dashboardStats.received}
              color="orange"
              subtitle="Awaiting kitchen action"
              alert={dashboardStats.received > 10}
            />
            <StatCard
              icon={CheckCircle}
              title="Completed"
              value={dashboardStats.completed}
              color="green"
              subtitle="Successfully served"
            />
            <StatCard
              icon={XCircle}
              title="Rejected"
              value={dashboardStats.rejected}
              color="red"
              subtitle={`${dashboardStats.rejectionRate}% rejection rate`}
              alert={dashboardStats.rejectionRate > 10}
            />
          </div>
        )}

        {/* ✅ NEW: Kitchen Status Filter */}
        {hasOrders && (
          <KitchenStatusFilter
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            orderStats={orderStats}
          />
        )}

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {hasOrders ? (
            <>
              {hasFilteredOrders ? (
                <div className="p-6">
                  {/* ✅ NEW: Orders header with count */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Kitchen Orders
                    </h3>
                    <div className="text-sm text-gray-600">
                      {filteredOrders.length} order
                      {filteredOrders.length !== 1 ? "s" : ""}
                      {activeFilter !== "all" && (
                        <span className="ml-1 text-orange-600 font-medium">
                          ({activeFilter})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Suspense
                      fallback={<LoadingSpinner text="Loading orders..." />}
                    >
                      {filteredOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onStatusChange={handleOrderStatusUpdate}
                          onViewDetails={handleViewDetails}
                          loading={submitting}
                          showKitchenActions={true}
                          variant="kitchen"
                        />
                      ))}
                    </Suspense>
                  </div>

                  {/* Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center text-sm text-gray-600">
                      Showing {filteredOrders.length} of {orderStats.total}{" "}
                      orders
                      {activeFilter !== "all" && ` (${activeFilter} only)`}
                      {selectedTimePeriod !== "total" &&
                        ` for ${selectedTimePeriod} period`}
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={AlertCircle}
                  title={`No ${
                    activeFilter === "all" ? "" : activeFilter
                  } Orders Found`}
                  description={
                    activeFilter === "all"
                      ? `No orders found for the selected ${selectedTimePeriod} period. Orders will appear here as customers place them.`
                      : `No ${activeFilter} orders found for the selected period. Try changing the filter or time period to see more orders.`
                  }
                  actionLabel={
                    activeFilter !== "all" ? "Show All Orders" : "Refresh"
                  }
                  onAction={
                    activeFilter !== "all"
                      ? () => handleFilterChange("all")
                      : handleRefresh
                  }
                />
              )}
            </>
          ) : (
            <EmptyState
              icon={ChefHat}
              title="No Orders Yet"
              description={`When customers place orders for ${activeHotelName}, they will appear here for kitchen management. The kitchen team can update order status and track progress in real-time.`}
              actionLabel="Refresh Orders"
              onAction={handleRefresh}
              suggestions={[
                "Orders will appear automatically as they come in",
                "Use the status buttons to update order progress",
                "Click on orders to view detailed information",
              ]}
            />
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <Suspense fallback={<LoadingSpinner />}>
          <OrderDetailsModal
            order={selectedOrder}
            onClose={handleCloseDetails}
            onUpdateStatus={handleOrderStatusUpdate}
            orderStatuses={statusOptions}
            isSubmitting={submitting}
            showDetailedInfo={true}
            variant="kitchen"
          />
        </Suspense>
      )}

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
});

KitchenAdminPage.displayName = "KitchenAdminPage";

export default KitchenAdminPage;
