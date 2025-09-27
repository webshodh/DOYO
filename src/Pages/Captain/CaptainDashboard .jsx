import React, {
  useState,
  useEffect,
  useCallback,
  memo,
  Suspense,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  Package,
  Plus,
  ChefHat,
  LoaderCircle,
  RefreshCw,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react";

// Services and utilities
import { captainServices } from "../../services/api/captainServices";
import { useOrder, useOrderData } from "../../hooks/useOrder";
import { toast } from "react-toastify";

// Components
import StatCard from "../../components/Cards/StatCard";
import { DynamicTable } from "../../components";
import useColumns from "../../Constants/Columns";

// UI Components
import PageTitle from "../../atoms/PageTitle";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "../../atoms/Messages/EmptyState";
import NoSearchResults from "../../molecules/NoSearchResults";
import SearchWithResults from "../../molecules/SearchWithResults";
import ErrorMessage from "../../atoms/Messages/ErrorMessage";
import WelcomeSection from "../../molecules/Sections/WelcomeSection";
import OrderStatusBadge from "../../atoms/Badges/OrderStatusBadge";
import QuickActions from "atoms/Buttons/QuickActions";
import TimePeriodSelector from "atoms/TimePeriodSelector";

// Lazy load heavy components
const OrderDetailsModal = React.lazy(() => import("./OrderDetailsModal"));

const CaptainDashboard = memo(() => {
  const navigate = useNavigate();
  const { ORDER_STATUSES, orderColumns } = useColumns();

  // Captain state
  const [captain, setCaptain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Enhanced order data hook with comprehensive functionality
  const {
    orders,
    filteredOrders,
    timeFilteredOrders,
    orderStats,
    todayStats,
    menuAnalytics,
    categoryAnalytics,

    // State management
    loading: ordersLoading,
    submitting,
    error: ordersError,
    connectionStatus,
    lastUpdated,

    // Filter state
    searchTerm,
    statusFilter,
    selectedDate,
    selectedTimePeriod,

    // Display helpers
    periodDisplayText,
    hasOrders,
    hasFilteredOrders,
    isConnected,
    isLoading: hookIsLoading,
    isError,
    errorMessage,

    // Filter handlers
    handleSearchChange,
    handleStatusFilterChange,
    handleDateChange,
    handleTimePeriodChange,
    clearFilters,

    // Actions
    updateOrderStatus,
    deleteOrder,
    refreshOrders,
    exportOrdersCSV,

    // Helper functions
    getOrderById,
    getOrdersByStatus,

    // Options for UI
    statusOptions,
    timePeriodOptions,
  } = useOrder(captain?.hotelName, {
    defaultTimePeriod: "daily", // Show today's orders by default
    defaultStatusFilter: "all",
    includeMenuData: true, // Include menu data for analytics
    sortBy: "timestamp",
    sortOrder: "desc",
  });

  // Load captain data on mount
  useEffect(() => {
    const loadCaptainData = async () => {
      try {
        setLoading(true);
        setError(null);

        const captainData = await captainServices.getCurrentCaptain();

        if (!captainData) {
          toast.error("Captain session not found. Please login again.");
          navigate("/captain/login");
          return;
        }

        setCaptain(captainData);
      } catch (error) {
        console.error("Error loading captain data:", error);
        setError(error.message || "Error loading captain information");
      } finally {
        setLoading(false);
      }
    };

    loadCaptainData();
  }, [navigate]);

  // Enhanced order statistics with corrected mapping for simplified status system
  const displayStats = useMemo(() => {
    // Use the comprehensive stats from the hook and map correctly
    const stats = {
      total: orderStats.total || 0,
      // Map simplified statuses correctly
      received: orderStats.received || 0, // This is the new "pending/preparing/ready" equivalent
      completed: orderStats.completed || 0,
      rejected: orderStats.rejected || 0,
      totalRevenue: orderStats.totalRevenue || 0,
    };

    // Add computed stats based on simplified system
    stats.activeOrders = stats.received; // Only received orders are considered active
    stats.completionRate =
      stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    return stats;
  }, [orderStats]);

  // Event handlers
  const handleLogout = useCallback(async () => {
    try {
      setLoggingOut(true);
      await captainServices.captainLogout();
      toast.success("Logged out successfully");
      navigate("/captain/login");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Error logging out");
    } finally {
      setLoggingOut(false);
    }
  }, [navigate]);

  const handleOrderStatusUpdate = useCallback(
    async (orderId, newStatus) => {
      const result = await updateOrderStatus(orderId, newStatus, {
        updatedBy: "captain",
        updatedByName: captain?.name || "Captain",
        updatedAt: new Date().toISOString(),
        kitchen: {
          notes: `Status updated by ${
            captain?.name || "Captain"
          } from dashboard`,
        },
      });

      // Update selected order if it's the same one
      if (result.success && selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          normalizedStatus: newStatus,
          status: newStatus,
          kitchen: {
            ...selectedOrder.kitchen,
            status: newStatus,
            lastUpdated: new Date().toISOString(),
          },
        });
      }

      return result;
    },
    [updateOrderStatus, selectedOrder, captain?.name]
  );

  const handleViewOrder = useCallback((order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshOrders();
      toast.success("Orders refreshed successfully");
    } catch (error) {
      console.error("Error refreshing orders:", error);
      toast.error("Failed to refresh orders");
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [refreshOrders]);

  const handleCreateOrder = useCallback(() => {
    if (captain?.hotelName) {
      navigate(`/captain/menu/${captain.hotelName}`);
    } else {
      toast.error("Hotel information not found");
    }
  }, [captain, navigate]);

  const handleViewAllOrders = useCallback(() => {
    if (captain?.hotelName) {
      navigate(`/captain/orders`);
    }
  }, [captain, navigate]);

  const handleExportOrders = useCallback(() => {
    try {
      exportOrdersCSV();
    } catch (error) {
      console.error("Error exporting orders:", error);
      toast.error("Failed to export orders");
    }
  }, [exportOrdersCSV]);

  // Fixed search handler to work with string input
  const handleSearchInputChange = useCallback(
    (e) => {
      const value = e.target ? e.target.value : e; // Support both event and direct value
      handleSearchChange(value);
    },
    [handleSearchChange]
  );

  // Fixed status filter handler to work with select input
  const handleStatusInputChange = useCallback(
    (e) => {
      const value = e.target ? e.target.value : e; // Support both event and direct value
      handleStatusFilterChange(value);
    },
    [handleStatusFilterChange]
  );

  // Computed values
  const isLoadingData = loading || hookIsLoading;
  const hasError = error || isError;

  // Error state
  if (hasError && !captain) {
    return (
      <ErrorMessage
        error={hasError}
        onRetry={handleRefresh}
        title="Error Loading Dashboard"
      />
    );
  }

  // Loading state for initial captain load
  if (loading && !captain) {
    return <LoadingSpinner size="lg" text="Loading captain dashboard..." />;
  }

  // Access denied state
  if (!captain) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            Unable to load captain information
          </p>
          <button
            onClick={() => navigate("/captain/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Order Details Modal */}
      <Suspense fallback={<LoadingSpinner />}>
        {showOrderModal && selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            orderStatuses={statusOptions}
            onClose={handleModalClose}
            onStatusUpdate={handleOrderStatusUpdate}
            isSubmitting={submitting}
            showDetailedInfo={true}
          />
        )}
      </Suspense>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Connection Status */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-4">
            <PageTitle
              pageTitle="Dashboard"
              className="text-2xl sm:text-3xl font-bold text-gray-900"
              description={periodDisplayText}
            />
          </div>
        </div>

        {/* Welcome Section */}
        {/* <WelcomeSection
          firstName={captain.firstName || captain.name}
          hotelName={captain.hotelName}
          todayStats={todayStats}
        /> */}

        {/* Time Period Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-2">
          <TimePeriodSelector
            selectedTimePeriod={selectedTimePeriod}
            onTimePeriodChange={handleTimePeriodChange}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            variant="compact"
            showDatePicker={true}
            className="mb-2"
            disableFutureDates={true}
            datePickerProps={{
              placeholder: "Select a date to view orders",
            }}
            options={timePeriodOptions}
          />
        </div>

        {/* Enhanced Order Statistics Cards - Updated for Simplified Status System */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              icon={Package}
              title="Total Orders"
              value={displayStats.total}
              color="blue"
              subtitle={`${displayStats.activeOrders} active`}
              trend={displayStats.total > 0 ? "up" : "neutral"}
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              icon={Clock}
              title="Ongoing"
              value={displayStats.received}
              color="yellow"
              subtitle="Being processed"
              alert={displayStats.received > 5}
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              icon={CheckCircle}
              title="Completed"
              value={displayStats.completed}
              color="green"
              subtitle={`${displayStats.completionRate}% completion rate`}
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              icon={AlertCircle}
              title="Rejected"
              value={displayStats.rejected}
              color="red"
              subtitle="Cancelled orders"
            />
          </div>
        </div>

        {/* Search and Filters */}
        {hasOrders && (
          <SearchWithResults
            searchTerm={searchTerm}
            onSearchChange={handleSearchInputChange}
            placeholder="Search orders by number, table, customer name..."
            totalCount={timeFilteredOrders.length}
            filteredCount={filteredOrders.length}
            onClearSearch={clearFilters}
            totalLabel="orders"
            showStatusFilter={true}
            statusFilter={statusFilter}
            onStatusChange={handleStatusInputChange}
            statusOptions={statusOptions}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            lastUpdated={lastUpdated}
            showExportButton={hasFilteredOrders}
            onExport={handleExportOrders}
          />
        )}

        {/* Orders Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {hasOrders ? (
            <>
              {hasFilteredOrders ? (
                <>
                  {/* Orders Summary */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-gray-900">
                          {filteredOrders.length} of {timeFilteredOrders.length}{" "}
                          orders
                        </span>
                        {statusFilter !== "all" && (
                          <span className="text-gray-600">
                            (filtered by {statusFilter})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-gray-600">
                        {displayStats.totalRevenue > 0 && (
                          <span>
                            Revenue: ₹
                            {displayStats.totalRevenue.toLocaleString()}
                          </span>
                        )}
                        <button
                          onClick={handleViewAllOrders}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View All Orders →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Orders Table using DynamicTable */}
                  <Suspense
                    fallback={<LoadingSpinner text="Loading orders table..." />}
                  >
                    <DynamicTable
                      columns={orderColumns}
                      data={filteredOrders}
                      onView={handleViewOrder}
                      loading={ordersLoading}
                      emptyMessage="No orders match your search criteria"
                      showPagination={true}
                      initialRowsPerPage={15}
                      sortable={true}
                      className="border-0"
                      showLabelsOnActions={false}
                      onRowClick={handleViewOrder}
                      highlightRows={(order) => {
                        if (order.normalizedStatus === "ready")
                          return "bg-green-50";
                        if (
                          order.normalizedStatus === "pending" &&
                          new Date() - new Date(order.orderTimestamp) >
                            15 * 60 * 1000
                        ) {
                          return "bg-yellow-50";
                        }
                        return "";
                      }}
                    />
                  </Suspense>
                </>
              ) : (
                <NoSearchResults
                  searchTerm={searchTerm}
                  onClearSearch={clearFilters}
                  message="No orders match your search criteria"
                  suggestions={[
                    "Try searching by order number, table, or customer name",
                    "Check if the selected status filter has any orders",
                    "Clear all filters to see all orders",
                  ]}
                />
              )}
            </>
          ) : (
            <EmptyState
              icon={Package}
              title={
                selectedTimePeriod === "daily"
                  ? `No Orders for ${new Date(
                      selectedDate
                    ).toLocaleDateString()}`
                  : "No Orders Found"
              }
              description={
                selectedTimePeriod === "daily"
                  ? `No orders found for ${new Date(
                      selectedDate
                    ).toLocaleDateString()}. Try selecting a different date or time period.`
                  : "No orders have been placed yet. Orders will appear here once customers start placing them."
              }
              actionLabel="Create First Order"
              onAction={handleCreateOrder}
              secondaryActionLabel={
                selectedTimePeriod === "daily"
                  ? "View All Time"
                  : "View All Orders"
              }
              onSecondaryAction={
                selectedTimePeriod === "daily"
                  ? () => handleTimePeriodChange("total")
                  : handleViewAllOrders
              }
              loading={ordersLoading}
            />
          )}
        </div>

        {/* Loading overlay for order operations */}
        {(submitting || ordersLoading) && hasOrders && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3 shadow-lg">
              <LoadingSpinner size="sm" />
              <span className="text-gray-700 font-medium">
                {submitting ? "Processing order..." : "Loading orders..."}
              </span>
            </div>
          </div>
        )}
      </main>

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

CaptainDashboard.displayName = "CaptainDashboard";

export default CaptainDashboard;
