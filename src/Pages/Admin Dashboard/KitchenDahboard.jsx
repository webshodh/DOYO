import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import {
  Calendar,
  LoaderCircle,
  AlertCircle,
  TrendingUp,
  Grid,
  ChefHat,
  Package,
  Wifi,
  WifiOff,
} from "lucide-react";

// Services and utilities
import { kitchenServices } from "../../services/api/kitchenServices";
import { useOrder } from "../../hooks/useOrder";
import { app } from "../../services/firebase/firebaseConfig";

// Components
import PageTitle from "../../atoms/PageTitle";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "../../atoms/Messages/EmptyState";
import NoSearchResults from "../../components/NoSearchResults";
import SearchWithResults from "../../components/SearchWithResults";
import StatCard from "../../components/Cards/StatCard";
import ErrorMessage from "../../atoms/Messages/ErrorMessage";
import ErrorBoundary from "../../atoms/ErrorBoundary";
import KitchenDashboardSkeleton from "../../atoms/Skeleton/KitchenDashboardSkeleton";
import TimePeriodSelector from "../../atoms/Selector/TimePeriodSelector";

// Lazy load heavy components
const OrderCard = React.lazy(() => import("../../components/Cards/OrderCard"));
const OrderDetailsModal = React.lazy(() =>
  import("../../components/Dashboard/OrderDetailsModal")
);
const PrintBill = React.lazy(() => import("../Captain/PrintBill"));
const OrderFilters = React.lazy(() =>
  import("../../components/Filters/OrderFilters")
);

const firestore = getFirestore(app);

// Connection Status Component
const ConnectionStatus = memo(({ isOnline }) => {
  if (isOnline) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">Offline</span>
    </div>
  );
});
ConnectionStatus.displayName = "ConnectionStatus";

// Time period tabs component
const TimePeriodTabs = memo(({ selectedTimePeriod, onTimePeriodChange }) => {
  const periods = [
    { key: "daily", label: "Today" },
    { key: "weekly", label: "This Week" },
    { key: "monthly", label: "This Month" },
    { key: "total", label: "All Time" },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
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
  const navigate = useNavigate();
  const { hotelName } = useParams();

  // Kitchen admin & menu state
  const [kitchenAdmin, setKitchenAdmin] = useState(null);
  const [availableMenuItems, setAvailableMenuItems] = useState([]);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Modal state
  const [viewingOrder, setViewingOrder] = useState(null);
  const [showPrintBill, setShowPrintBill] = useState(false);
  const [selectedOrderForBill, setSelectedOrderForBill] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Order hook with comprehensive functionality
  const {
    orders,
    filteredOrders,
    timeFilteredOrders,
    loading,
    submitting,
    error: orderError,
    lastUpdated,

    // Filter state
    searchTerm,
    statusFilter,
    selectedDate,
    selectedTimePeriod,

    // Display helpers
    hasOrders,
    hasFilteredOrders,
    isConnected,
    isLoading,
    isError,
    errorMessage,

    // Stats
    orderStats,

    // Filter handlers
    handleSearchChange,
    handleStatusFilterChange,
    handleDateChange,
    handleTimePeriodChange,
    clearFilters,

    // Actions
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    refreshOrders,
    completeOrder,
    rejectOrder,

    // Options for UI
    statusOptions,
    timePeriodOptions,
  } = useOrder(hotelName, {
    defaultTimePeriod: "daily",
    defaultStatusFilter: "all",
    includeMenuData: false,
    sortBy: "timestamp",
    sortOrder: "desc",
    realTimeUpdates: true,
  });

  // Restaurant info for bill printing
  const restaurantInfo = useMemo(
    () => ({
      name: kitchenAdmin?.hotelName || hotelName || "Restaurant Name",
      address:
        kitchenAdmin?.address || "Restaurant Address, City, State - 123456",
      phone: kitchenAdmin?.phone || "+91 12345 67890",
      gst: kitchenAdmin?.gstNumber || "12ABCDE3456F1Z5",
      taxRate: 0.18,
      footer: "Thank you for dining with us!",
    }),
    [kitchenAdmin, hotelName]
  );

  // Memoized calculations for dashboard stats
  const dashboardStats = useMemo(
    () => ({
      totalOrders: timeFilteredOrders.length,
      received: orderStats.received || 0,
      preparing: orderStats.preparing || 0,
      ready: orderStats.ready || 0,
      completed: orderStats.completed || 0,
      rejected: orderStats.rejected || 0,
    }),
    [orderStats, timeFilteredOrders.length]
  );

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load kitchen admin data
  useEffect(() => {
    const loadKitchenAdminData = async () => {
      try {
        const adminData = await kitchenServices.getCurrentKitchenAdmin();
        if (!adminData) {
          navigate("/admin/login");
          return;
        }
        setKitchenAdmin(adminData);
      } catch (error) {
        console.error("Error loading kitchen admin data:", error);
        setError("Error loading kitchen admin information");
      }
    };
    loadKitchenAdminData();
  }, [navigate]);

  // Load menu items from Firestore
  useEffect(() => {
    const targetHotelName = hotelName || kitchenAdmin?.hotelName;
    if (!targetHotelName) return;

    const menusRef = collection(firestore, `hotels/${targetHotelName}/menu`);
    const unsubscribe = onSnapshot(
      menusRef,
      (snapshot) => {
        const menusData = snapshot.docs.map((doc) => ({
          id: doc.id,
          menuId: doc.id,
          ...doc.data(),
        }));
        setAvailableMenuItems(menusData);
      },
      (error) => {
        console.error("Error loading menu items:", error);
        setAvailableMenuItems([]);
      }
    );

    return () => unsubscribe();
  }, [kitchenAdmin, hotelName]);

  // Print bill handler
  const handlePrintBill = useCallback((order) => {
    setSelectedOrderForBill(order);
    setShowPrintBill(true);
  }, []);

  // Navigation handlers
  const handleGoBack = useCallback(() => {
    navigate("/kitchen/dashboard");
  }, [navigate]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshOrders();
    } catch (error) {
      console.error("Error refreshing orders:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [refreshOrders]);

  // Update order status handler
  const handleUpdateStatus = useCallback(
    async (orderId, newStatus, rejectionReason = null) => {
      setUpdatingOrderId(orderId);
      try {
        const updateData = {
          updatedBy: "kitchen",
          updatedByName: kitchenAdmin?.name || "Kitchen Admin",
          updatedAt: new Date().toISOString(),
          kitchen: {
            notes:
              rejectionReason ||
              `Status updated by ${kitchenAdmin?.name || "Kitchen Admin"}`,
          },
          ...(rejectionReason && { rejectionReason }),
        };

        let result;
        switch (newStatus.toLowerCase()) {
          case "completed":
            result = await completeOrder(orderId, updateData);
            break;
          case "rejected":
            result = await rejectOrder(orderId, updateData);
            break;
          default:
            result = await updateOrderStatus(orderId, newStatus, updateData);
            break;
        }

        if (!result.success) {
          throw new Error(result.error || "Failed to update status");
        }

        await refreshOrders();
        return result;
      } catch (error) {
        console.error("Error updating order status:", error);
        return { success: false, error: error.message };
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [
      updateOrderStatus,
      completeOrder,
      rejectOrder,
      refreshOrders,
      kitchenAdmin?.name,
    ]
  );

  // View order modal handler
  const handleViewOrder = useCallback((order) => {
    setViewingOrder(order);
  }, []);

  // Delete order handler
  const handleDeleteOrder = useCallback(
    async (orderId) => {
      const order = orders.find((o) => o.id === orderId);
      const confirmMessage = order
        ? `Are you sure you want to cancel order #${order.orderNumber} from ${order.displayTable}?`
        : "Are you sure you want to cancel this order?";

      if (!window.confirm(confirmMessage)) return;

      const result = await deleteOrder(orderId);

      if (!result.success) {
        console.error("Failed to delete order:", result.error);
      }

      return result;
    },
    [deleteOrder, orders]
  );

  // Search input handler
  const handleSearchInputChange = useCallback(
    (e) => handleSearchChange(e.target.value),
    [handleSearchChange]
  );

  // Get status badge styles
  const getStatusBadgeStyles = (status) => {
    const isActive = statusFilter === status;
    const baseStyles =
      "px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer border-2";

    const statusStyles = {
      all: isActive
        ? "bg-gray-900 text-white border-gray-900"
        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300",
      received: isActive
        ? "bg-yellow-500 text-white border-yellow-500"
        : "bg-yellow-50 text-yellow-700 border-yellow-200 hover:border-yellow-300",
      preparing: isActive
        ? "bg-blue-500 text-white border-blue-500"
        : "bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300",
      ready: isActive
        ? "bg-purple-500 text-white border-purple-500"
        : "bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-300",
      completed: isActive
        ? "bg-green-500 text-white border-green-500"
        : "bg-green-50 text-green-700 border-green-200 hover:border-green-300",
      rejected: isActive
        ? "bg-red-500 text-white border-red-500"
        : "bg-red-50 text-red-700 border-red-200 hover:border-red-300",
    };

    return `${baseStyles} ${statusStyles[status] || statusStyles.all}`;
  };

  // Computed flags
  const showLoadingSpinner = isLoading && !kitchenAdmin;
  const showError = (error || isError) && !orders.length;
  const isLoadingData = loading && !orders.length;

  // Render loading state
  if (showLoadingSpinner || isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ConnectionStatus isOnline={isOnline} />
        <KitchenDashboardSkeleton />
      </div>
    );
  }

  // Render error state
  if (showError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ConnectionStatus isOnline={isOnline} />
        <ErrorBoundary error={errorMessage || error} onRetry={handleRefresh} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ConnectionStatus isOnline={isOnline} />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl shadow-lg p-4 sm:p-6 text-white mb-6">
          <PageTitle
            pageTitle="Kitchen Dashboard"
            className="text-2xl sm:text-3xl font-bold text-white"
            description={`${filteredOrders.length} ${
              statusFilter === "all" ? "total" : statusFilter
            } orders`}
          />
        </div>

        {/* Time Period Navigation */}
        <TimePeriodSelector
          selectedTimePeriod={selectedTimePeriod}
          onTimePeriodChange={handleTimePeriodChange}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          variant="compact"
          showDatePicker={true}
          className="mb-6"
          options={timePeriodOptions}
          disableFutureDates={true}
        />

        {/* Stats Cards */}
        {hasOrders && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
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
              color="yellow"
            />
            <StatCard
              icon={LoaderCircle}
              title="Preparing"
              value={dashboardStats.preparing}
              color="blue"
            />
            <StatCard
              icon={LoaderCircle}
              title="Ready"
              value={dashboardStats.ready}
              color="purple"
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

        {/* Status Filter Tabs */}
        {hasOrders && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium text-gray-700">
                Filter by Status:
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {statusOptions.map((option) => {
                const orderCount =
                  option.value === "all"
                    ? timeFilteredOrders.length
                    : timeFilteredOrders.filter(
                        (o) => o.normalizedStatus === option.value
                      ).length;

                return (
                  <button
                    key={option.value}
                    onClick={() => handleStatusFilterChange(option.value)}
                    className={getStatusBadgeStyles(option.value)}
                  >
                    <span className="flex items-center gap-2">
                      {option.label}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          statusFilter === option.value
                            ? "bg-white/20"
                            : "bg-gray-100"
                        }`}
                      >
                        {orderCount}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search Bar */}
        {hasOrders && (
          <SearchWithResults
            searchTerm={searchTerm}
            onSearchChange={handleSearchInputChange}
            placeholder="Search orders by number, table, customer name, or item..."
            totalCount={timeFilteredOrders.length}
            filteredCount={filteredOrders.length}
            onClearSearch={clearFilters}
            totalLabel="orders"
            showStatusFilter={false}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            lastUpdated={lastUpdated}
            showConnectionStatus={!isOnline}
          />
        )}

        {/* Orders Grid */}
        {hasFilteredOrders ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrders.map((order) => (
              <React.Suspense
                key={order.id}
                fallback={
                  <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
                }
              >
                <OrderCard
                  order={order}
                  onView={handleViewOrder}
                  onUpdateStatus={handleUpdateStatus}
                  onDelete={handleDeleteOrder}
                  onPrintBill={handlePrintBill}
                  isUpdating={updatingOrderId === order.id}
                  showConnectionStatus={!isOnline}
                  kitchenMode
                  disableActions={submitting || updatingOrderId !== null}
                />
              </React.Suspense>
            ))}
          </div>
        ) : hasOrders ? (
          <NoSearchResults
            searchTerm={searchTerm}
            onClearSearch={clearFilters}
            message={`No ${
              statusFilter !== "all" ? statusFilter : ""
            } orders match your search criteria`}
            suggestions={[
              "Try searching by order number, table number, or customer name",
              statusFilter !== "all"
                ? "Try selecting a different status filter"
                : null,
              "Clear filters to see all orders",
            ].filter(Boolean)}
          />
        ) : (
          <EmptyState
            icon={ChefHat}
            title="No Orders Found"
            description="No orders have been placed yet. Orders will appear here once customers start placing them."
            actionLabel="Go to Dashboard"
            onAction={handleGoBack}
          />
        )}

        {/* Loading overlay */}
        {(submitting || updatingOrderId) && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3 shadow-lg">
              <LoadingSpinner size="sm" />
              <span className="text-gray-700 font-medium">
                Processing order...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* View Order Modal */}
      {viewingOrder && (
        <React.Suspense fallback={<LoadingSpinner />}>
          <OrderDetailsModal
            order={viewingOrder}
            orderStatuses={statusOptions}
            onClose={() => setViewingOrder(null)}
            onUpdateStatus={handleUpdateStatus}
            isSubmitting={submitting}
            showDetailedInfo
            kitchenMode
          />
        </React.Suspense>
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
            <React.Suspense fallback={<LoadingSpinner />}>
              <PrintBill
                order={selectedOrderForBill}
                restaurantInfo={restaurantInfo}
              />
            </React.Suspense>
          </div>
        </div>
      )}
    </div>
  );
});

KitchenAdminPage.displayName = "KitchenAdminPage";

export default KitchenAdminPage;
