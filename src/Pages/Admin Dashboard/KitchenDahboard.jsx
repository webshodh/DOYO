import React, { useState, useCallback, useMemo, memo, Suspense } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import {
  Calendar,
  LoaderCircle,
  AlertCircle,
  TrendingUp,
  Grid,
  ChefHat,
} from "lucide-react";
import PageTitle from "../../atoms/PageTitle";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import StatCard from "components/Cards/StatCard";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import { useOrder } from "hooks/useOrder";
import TimePeriodSelector from "atoms/Selector/TimePeriodSelector";
import ErrorBoundary from "atoms/ErrorBoundary";
import KitchenDashboardSkeleton from "atoms/Skeleton/KitchenDashboardSkeleton";

// Lazy load heavy components
const HeaderStats = React.lazy(() =>
  import("components/Dashboard/HeaderStats")
);
const OrderFilters = React.lazy(() =>
  import("components/Filters/OrderFilters")
);
const OrderCard = React.lazy(() => import("components/Cards/OrderCard"));
const OrderDetailsModal = React.lazy(() =>
  import("components/Dashboard/OrderDetailsModal")
);

// Time period tabs component
const TimePeriodTabs = memo(({ selectedTimePeriod, onTimePeriodChange }) => {
  const periods = [
    { key: "daily", label: "Today" },
    { key: "weekly", label: "This Week" },
    { key: "monthly", label: "This Month" },
    { key: "total", label: "All Time" },
  ];

  return (
    <div className="flex gap-2">
      {periods.map((period) => (
        <button
          key={period.key}
          onClick={() => onTimePeriodChange(period.key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedTimePeriod === period.key
              ? "bg-orange-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
});
TimePeriodTabs.displayName = "TimePeriodTabs";

// Main KitchenAdminPage component
const KitchenAdminPage = memo(() => {
  const { hotelName } = useParams();

  // Modal state for order details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Use optimized useOrder hook
  const {
    filteredOrders,
    orders,
    timeFilteredOrders,
    loading,
    submitting,
    error,
    statusFilter,
    selectedDate,
    selectedTimePeriod,
    orderStats,
    handleStatusFilterChange,
    handleSearchChange,
    handleDateChange,
    handleTimePeriodChange,
    refreshOrders,
    hasOrders,
    hasFilteredOrders,
    orderStats: stats,
    timePeriodOptions,
  } = useOrder(hotelName);

  // Memoized calculations for dashboard stats
  const dashboardStats = useMemo(
    () => ({
      totalOrders: timeFilteredOrders.length,
      received: stats.received,
      completed: stats.completed,
      rejected: stats.rejected,
    }),
    [stats, timeFilteredOrders.length]
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

  const handleRefresh = useCallback(() => {
    refreshOrders();
  }, [refreshOrders]);

  // Determine loading state
  const isLoadingData = loading && !orders.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl shadow-lg p-4 sm:p-6 text-white mb-4">
          <PageTitle
            pageTitle="Kitchen Dashboard"
            className="text-2xl sm:text-3xl font-bold text-gray-900"
            description={`Manage orders for ${hotelName}`}
          />
        </div>

        {/* Error handling */}
        {error && !loading && (
          <ErrorBoundary error={error} onRetry={handleRefresh} />
        )}

        {/* Loading state */}
        {isLoadingData ? (
          <KitchenDashboardSkeleton />
        ) : (
          <>
            {/* Time Period Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between">
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
                <div className="text-sm text-gray-600 font-medium">
                  {/* optional period display text */}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            {hasOrders && (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  icon={ChefHat}
                  title="Total Orders"
                  value={dashboardStats.totalOrders}
                  color="blue"
                />
                <StatCard
                  icon={LoaderCircle}
                  title="Received"
                  value={dashboardStats.received}
                  color="orange"
                />
                <StatCard
                  icon={TrendingUp}
                  title="Completed"
                  value={dashboardStats.completed}
                  color="green"
                />
                <StatCard
                  icon={Grid}
                  title="Rejected"
                  value={dashboardStats.rejected}
                  color="red"
                />
              </div>
            )}

            {/* Order Filters */}
            {hasOrders && (
              <Suspense fallback={<LoadingSpinner text="Loading filters..." />}>
                <OrderFilters
                  statusFilter={statusFilter}
                  onFilterChange={handleStatusFilterChange}
                  selectedDate={selectedDate}
                  onSearchChange={handleSearchChange}
                  orderStats={orderStats}
                  totalOrders={timeFilteredOrders.length}
                />
              </Suspense>
            )}

            {/* Orders List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {hasOrders ? (
                hasFilteredOrders ? (
                  <div className="p-6 space-y-4">
                    <Suspense
                      fallback={<LoadingSpinner text="Loading orders..." />}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredOrders.map((order) => (
                          <OrderCard
                            key={order.id}
                            order={order}
                            onStatusChange={handleStatusFilterChange}
                            onViewDetails={handleViewDetails}
                            loading={submitting}
                          />
                        ))}
                      </div>
                    </Suspense>
                    <div className="mt-6 text-center text-sm text-gray-600">
                      Showing {filteredOrders.length} of{" "}
                      {timeFilteredOrders.length} orders
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={AlertCircle}
                    title={`No ${
                      statusFilter !== "all" ? statusFilter : ""
                    } Orders Found`}
                    description={
                      statusFilter === "all"
                        ? `No orders found for the selected ${selectedTimePeriod} period.`
                        : `No ${statusFilter} orders found for the selected period.`
                    }
                  />
                )
              ) : (
                <EmptyState
                  icon={ChefHat}
                  title="No Orders Yet"
                  description="When customers place orders, they will appear here for kitchen management."
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <Suspense fallback={<LoadingSpinner />}>
          <OrderDetailsModal
            order={selectedOrder}
            onClose={handleCloseDetails}
          />
        </Suspense>
      )}

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </div>
  );
});

KitchenAdminPage.displayName = "KitchenAdminPage";

export default KitchenAdminPage;
