// KitchenAdminPage.jsx

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

// Lazy load heavy components
const HeaderStats = React.lazy(() => import("components/HeaderStats"));
const OrderFilters = React.lazy(() =>
  import("components/order-dashboard/OrderFilters")
);
const OrderCard = React.lazy(() => import("components/Cards/OrderCard"));
const OrderDetailsModal = React.lazy(() =>
  import("components/order-dashboard/OrderDetailsModal")
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
    // computed counts
    offerCount, // not used here
    // additional fields renamed:
    // use `filteredOrders.length`, `timeFilteredOrders.length` directly
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

  // Error state
  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={refreshOrders}
        title="Error Loading Kitchen Orders"
      />
    );
  }

  // Loading state
  if (loading && !orders.length) {
    return <LoadingSpinner size="lg" text="Loading kitchen orders..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        {/* Header */}
        <div className="flex flex-row items-center justify-between gap-4 mb-1">
          <PageTitle
            pageTitle="Kitchen Dashboard"
            className="text-2xl sm:text-3xl font-bold text-gray-900"
            description={`Manage orders for ${hotelName}`}
          />
          {selectedTimePeriod === "daily" && (
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
              <Calendar size={16} className="text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="bg-transparent border-none focus:outline-none text-sm"
              />
            </div>
          )}
        </div>

        {/* Time Period Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <TimePeriodTabs
              selectedTimePeriod={selectedTimePeriod}
              onTimePeriodChange={handleTimePeriodChange}
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
                  {filteredOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusChange={handleStatusFilterChange}
                      onViewDetails={handleViewDetails}
                      loading={submitting}
                    />
                  ))}
                </Suspense>
                <div className="mt-6 text-center text-sm text-gray-600">
                  Showing {filteredOrders.length} of {timeFilteredOrders.length}{" "}
                  orders
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
