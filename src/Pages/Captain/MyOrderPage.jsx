import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { onValue, ref } from "firebase/database";
import {
  Calendar,
  CheckCircle,
  Clock,
  LoaderCircle,
  Package,
} from "lucide-react";

// Services and utilities
import { captainServices } from "../../services/captainServices";
import { useOrderData } from "../../customHooks/useOrder";
import { db } from "../../data/firebase/firebaseConfig";

// Components
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "../../atoms/Messages/EmptyState";
import NoSearchResults from "../../molecules/NoSearchResults";
import SearchWithResults from "../../molecules/SearchWithResults";
import StatCard from "../../components/Cards/StatCard";
import OrderCard from "../../components/Cards/OrderCard";
import ErrorMessage from "../../atoms/Messages/ErrorMessage";
import { PageTitle } from "../../atoms";

// Modals
import EditOrderModal from "./EditOrderModal";
import OrderDetailsModal from "./OrderDetailsModal";

// Constants
import { ORDER_STATUSES } from "../../Constants/Columns";

/**
 * Time Period Tabs Component
 * Consistent UI for time period selection across the application
 */
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

/**
 * Main MyOrdersPage Component
 * Provides order management interface for captains with consistent data handling
 */
const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { hotelName } = useParams();

  // Captain state
  const [captain, setCaptain] = useState(null);
  const [availableMenuItems, setAvailableMenuItems] = useState([]);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal state
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);

  // Enhanced order data hook with comprehensive functionality
  const {
    orders,
    filteredOrders,
    timeFilteredOrders,
    orderStats,
    loading,
    submitting,
    error: orderError,
    searchTerm,
    statusFilter,
    selectedDate,
    selectedTimePeriod,
    periodDisplayText,
    handleSearchChange,
    handleStatusFilterChange,
    handleDateChange,
    handleTimePeriodChange,
    clearFilters,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    refreshOrders,
    hasOrders,
    hasFilteredOrders,
    filteredOrdersCount,
  } = useOrderData(hotelName || captain?.hotelName, {
    defaultTimePeriod: "total",
    defaultStatusFilter: "all",
    includeMenuData: false,
  });

  // Load captain data on mount
  useEffect(() => {
    const loadCaptainData = async () => {
      try {
        const captainData = await captainServices.getCurrentCaptain();
        if (!captainData) {
          navigate("/captain/login");
          return;
        }
        setCaptain(captainData);
      } catch (error) {
        console.error("Error loading captain data:", error);
        setError("Error loading captain information");
      }
    };

    loadCaptainData();
  }, [navigate]);

  // Load menu items for editing orders
  useEffect(() => {
    const targetHotelName = hotelName || captain?.hotelName;
    if (!targetHotelName) return;

    const menuRef = ref(db, `/hotels/${targetHotelName}/menu`);
    const unsubscribe = onValue(
      menuRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const menuArray = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value,
          }));
          setAvailableMenuItems(menuArray);
        } else {
          setAvailableMenuItems([]);
        }
      },
      (error) => {
        console.error("Error loading menu items:", error);
      }
    );

    return () => unsubscribe();
  }, [captain, hotelName]);

  // Order statistics with time period filtering
  const displayStats = useMemo(() => {
    return {
      total: timeFilteredOrders.length,
      pending: timeFilteredOrders.filter(
        (o) =>
          o.normalizedStatus === "pending" || o.normalizedStatus === "received"
      ).length,
      preparing: timeFilteredOrders.filter(
        (o) => o.normalizedStatus === "preparing"
      ).length,
      ready: timeFilteredOrders.filter((o) => o.normalizedStatus === "ready")
        .length,
      completed: timeFilteredOrders.filter(
        (o) => o.normalizedStatus === "completed"
      ).length,
      served: timeFilteredOrders.filter((o) => o.normalizedStatus === "served")
        .length,
      rejected: timeFilteredOrders.filter(
        (o) => o.normalizedStatus === "rejected"
      ).length,
    };
  }, [timeFilteredOrders]);

  // Event handlers
  const handleGoBack = useCallback(() => {
    navigate("/captain/dashboard");
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    refreshOrders();
    // Reset refreshing state after a delay
    setTimeout(() => setIsRefreshing(false), 1000);
  }, [refreshOrders]);

  const handleUpdateStatus = useCallback(
    async (orderId, newStatus) => {
      const result = await updateOrderStatus(orderId, newStatus, {
        updatedBy: "captain",
        updatedAt: new Date().toISOString(),
      });

      if (!result.success) {
        console.error("Failed to update order status:", result.error);
      }
    },
    [updateOrderStatus]
  );

  const handleEditOrder = useCallback((order) => {
    setEditingOrder(order);
  }, []);

  const handleSaveOrder = useCallback(
    async (updatedOrder) => {
      const result = await updateOrder(updatedOrder.id, updatedOrder);

      if (result.success) {
        setEditingOrder(null);
      } else {
        throw new Error(result.error);
      }
    },
    [updateOrder]
  );

  const handleViewOrder = useCallback((order) => {
    setViewingOrder(order);
  }, []);

  const handleDeleteOrder = useCallback(
    async (orderId) => {
      if (!window.confirm("Are you sure you want to cancel this order?")) {
        return;
      }

      const result = await deleteOrder(orderId);

      if (!result.success) {
        console.error("Failed to delete order:", result.error);
      }
    },
    [deleteOrder]
  );

  // Computed values
  const isLoading = loading;
  const hasError = error || orderError;

  // Loading state
  if (isLoading && !captain) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading orders..." />
      </div>
    );
  }

  // Error state
  if (hasError && !orders.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorMessage
          message={hasError?.message || hasError}
          title="Error Loading Orders"
          onRetry={handleRefresh}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <PageTitle
            pageTitle="My Orders"
            className="text-2xl sm:text-3xl font-bold text-gray-900"
            description="Manage and update existing orders"
          />

          <div className="flex items-center gap-4">
            {/* Date picker - only show for daily view */}
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

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || submitting}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              <LoaderCircle
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
            />
            <div className="text-sm text-gray-600 font-medium">
              {periodDisplayText}
            </div>
          </div>
        </div>

        {/* Order Statistics Cards */}
        {hasOrders && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="transform hover:scale-105 transition-all duration-300">
              <StatCard
                icon={Package}
                title="Total Orders"
                value={orderStats.total}
                color="blue"
              />
            </div>
            <div className="transform hover:scale-105 transition-all duration-300">
              <StatCard
                icon={Clock}
                title="Pending"
                value={orderStats.pending}
                color="yellow"
              />
            </div>

            <div className="transform hover:scale-105 transition-all duration-300">
              <StatCard
                icon={CheckCircle}
                title="Completed"
                value={orderStats.completed}
                color="gray"
              />
            </div>
          </div>
        )}

        {/* Search and Filters */}
        {hasOrders && (
          <SearchWithResults
            searchTerm={searchTerm}
            onSearchChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search orders by number, table, or item..."
            totalCount={displayStats.total}
            filteredCount={filteredOrdersCount}
            onClearSearch={clearFilters}
            totalLabel="orders"
            showStatusFilter={true}
            statusFilter={statusFilter}
            onStatusChange={(e) => handleStatusFilterChange(e.target.value)}
            statusOptions={ORDER_STATUSES}
          />
        )}

        {/* Orders Grid */}
        {hasFilteredOrders ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onEdit={handleEditOrder}
                onView={handleViewOrder}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDeleteOrder}
                isUpdating={submitting}
              />
            ))}
          </div>
        ) : hasOrders ? (
          <NoSearchResults
            searchTerm={searchTerm}
            onClearSearch={clearFilters}
            message="No orders match your search criteria"
          />
        ) : (
          <EmptyState
            icon={Package}
            title="No Orders Found"
            description="No orders have been placed yet. Orders will appear here once customers start placing them."
            actionLabel="Go to Dashboard"
            onAction={handleGoBack}
          />
        )}

        {/* Loading overlay for order operations */}
        {submitting && (
          <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
            <LoadingSpinner text="Processing order..." />
          </div>
        )}
      </div>

      {/* Edit Order Modal */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={handleSaveOrder}
          availableMenuItems={availableMenuItems}
        />
      )}

      {/* View Order Modal */}
      {viewingOrder && (
        <OrderDetailsModal
          order={viewingOrder}
          orderStatuses={ORDER_STATUSES}
          onClose={() => setViewingOrder(null)}
          onStatusUpdate={handleUpdateStatus}
        />
      )}
    </div>
  );
};

export default MyOrdersPage;
