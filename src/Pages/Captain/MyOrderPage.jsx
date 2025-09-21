import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { onValue, ref } from "firebase/database";
import {
  Calendar,
  CheckCircle,
  Clock,
  LoaderCircle,
  Package,
  ChefHat,
  AlertCircle,
} from "lucide-react";

// Services and utilities
import { captainServices } from "../../services/api/captainServices";
import { useOrderData } from "../../hooks/useOrder";
import { db } from "../../services/firebase/firebaseConfig";

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
import PrintBill from "./PrintBill";

// Constants
import { ORDER_STATUSES } from "../../Constants/Columns";
import TimePeriodSelector from "atoms/TimePeriodSelector";

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
  const [showPrintBill, setShowPrintBill] = useState(false);
  const [selectedOrderForBill, setSelectedOrderForBill] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Enhanced order data hook with comprehensive functionality
  const {
    orders,
    filteredOrders,
    timeFilteredOrders,
    orderStats,
    todayStats,
    loading,
    submitting,
    error: orderError,
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
    isLoading,
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
    updateOrder,
    deleteOrder,
    refreshOrders,

    // Options for UI
    statusOptions,
    timePeriodOptions,
  } = useOrderData(hotelName || captain?.hotelName, {
    defaultTimePeriod: "total",
    defaultStatusFilter: "all",
    includeMenuData: false,
    sortBy: "timestamp",
    sortOrder: "desc",
  });

  // Restaurant information for the bill - Get from captain data or use defaults
  const restaurantInfo = useMemo(
    () => ({
      name: captain?.hotelName || hotelName || "Restaurant Name",
      address: captain?.address || "Restaurant Address, City, State - 123456",
      phone: captain?.phone || "+91 12345 67890",
      gst: captain?.gstNumber || "12ABCDE3456F1Z5",
      taxRate: 0.18, // 18% GST
      footer: "Thank you for dining with us!",
    }),
    [captain, hotelName]
  );

  // Handle print bill
  const handlePrintBill = useCallback((order) => {
    console.log("Printing bill for order:", order); // Debug log
    setSelectedOrderForBill(order);
    setShowPrintBill(true);
  }, []);

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
            menuId: key,
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
  const handleGoBack = useCallback(() => {
    navigate("/captain/dashboard");
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

  // Fixed status update handler to handle rejection reason
  const handleUpdateStatus = useCallback(
    async (orderId, newStatus, rejectionReason = null) => {
      setUpdatingOrderId(orderId);

      try {
        const updateData = {
          updatedBy: "captain",
          updatedByName: captain?.name || "Captain",
          updatedAt: new Date().toISOString(),
          kitchen: {
            notes:
              rejectionReason ||
              `Status updated by ${captain?.name || "Captain"}`,
          },
          ...(rejectionReason && { rejectionReason }),
        };

        const result = await updateOrderStatus(orderId, newStatus, updateData);

        if (!result.success) {
          console.error("Failed to update order status:", result.error);
          throw new Error(result.error || "Failed to update status");
        }

        return result;
      } catch (error) {
        console.error("Error updating order status:", error);
        return { success: false, error: error.message };
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [updateOrderStatus, captain?.name]
  );

  const handleEditOrder = useCallback((order) => {
    setEditingOrder(order);
  }, []);

  const handleSaveOrder = useCallback(
    async (updatedOrder) => {
      try {
        const result = await updateOrder(updatedOrder.id, {
          ...updatedOrder,
          timestamps: {
            ...updatedOrder.timestamps,
            lastModifiedBy: captain?.name || "Captain",
            lastModifiedAt: new Date().toISOString(),
          },
        });

        if (result.success) {
          setEditingOrder(null);
        } else {
          throw new Error(result.error || "Failed to update order");
        }
      } catch (error) {
        console.error("Error saving order:", error);
        throw error;
      }
    },
    [updateOrder, captain?.name]
  );

  const handleViewOrder = useCallback((order) => {
    setViewingOrder(order);
  }, []);

  const handleDeleteOrder = useCallback(
    async (orderId) => {
      const order = orders.find((o) => o.id === orderId);
      const confirmMessage = order
        ? `Are you sure you want to cancel order #${order.orderNumber} from ${order.displayTable}?`
        : "Are you sure you want to cancel this order?";

      if (!window.confirm(confirmMessage)) {
        return;
      }

      const result = await deleteOrder(orderId);

      if (!result.success) {
        console.error("Failed to delete order:", result.error);
      }

      return result;
    },
    [deleteOrder, orders]
  );

  const handleSearchInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      handleSearchChange(value);
    },
    [handleSearchChange]
  );

  const handleStatusInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      handleStatusFilterChange(value);
    },
    [handleStatusFilterChange]
  );

  // Computed values for loading and error states
  const showLoadingSpinner = isLoading && !captain;
  const showError = (error || isError) && !orders.length;

  // Loading state
  if (showLoadingSpinner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading orders..." />
      </div>
    );
  }

  // Error state
  if (showError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorMessage
          message={errorMessage || error}
          title="Error Loading Orders"
          onRetry={handleRefresh}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header with Connection Status */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-4">
            <PageTitle
              pageTitle="My Orders"
              className="text-2xl sm:text-3xl font-bold text-gray-900"
              description={periodDisplayText}
            />
          </div>

          {/* Last Updated Info */}
          {lastUpdated && (
            <div className="text-sm text-gray-500">
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Time Period Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-2">
          <TimePeriodSelector
            selectedTimePeriod={selectedTimePeriod}
            onTimePeriodChange={handleTimePeriodChange}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            variant="default"
            showDatePicker={true}
            className="mb-2"
            disableFutureDates={true}
            datePickerProps={{
              placeholder: "Select a date to view orders",
            }}
            options={timePeriodOptions}
          />

          {/* Period Summary */}
          <div className="text-sm text-gray-600 mt-2">
            {periodDisplayText} • {displayStats.total} orders
            {displayStats.totalRevenue > 0 && (
              <span>
                {" "}
                • ₹{displayStats.totalRevenue.toLocaleString()} revenue
              </span>
            )}
          </div>
        </div>

        {/* Enhanced Order Statistics Cards */}
        {hasOrders && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="transform hover:scale-105 transition-all duration-300">
              <StatCard
                icon={Package}
                title="Total Orders"
                value={displayStats.total}
                color="blue"
                subtitle={`${displayStats.activeOrders} active`}
              />
            </div>

            <div className="transform hover:scale-105 transition-all duration-300">
              <StatCard
                icon={Clock}
                title="Received"
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
        )}

        {/* Search and Filters */}
        {hasOrders && (
          <SearchWithResults
            searchTerm={searchTerm}
            onSearchChange={handleSearchInputChange}
            placeholder="Search orders by number, table, customer name, or item..."
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
          />
        )}

        {/* Orders Grid */}
        {hasFilteredOrders ? (
          <>
            {/* Orders Summary */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onEdit={handleEditOrder}
                  onView={handleViewOrder}
                  onUpdateStatus={handleUpdateStatus}
                  onDelete={handleDeleteOrder}
                  onPrintBill={handlePrintBill}
                  isUpdating={updatingOrderId === order.id}
                  showConnectionStatus={!isConnected}
                  captainMode={true}
                />
              ))}
            </div>
          </>
        ) : hasOrders ? (
          <NoSearchResults
            searchTerm={searchTerm}
            onClearSearch={clearFilters}
            message="No orders match your search criteria"
            suggestions={[
              "Try searching by order number, table number, or customer name",
              "Check if the selected time period contains orders",
              "Clear filters to see all orders",
            ]}
          />
        ) : (
          <EmptyState
            icon={Package}
            title="No Orders Found"
            description={
              selectedTimePeriod === "daily"
                ? `No orders found for ${new Date(
                    selectedDate
                  ).toLocaleDateString()}. Try selecting a different date or time period.`
                : "No orders have been placed yet. Orders will appear here once customers start placing them."
            }
            actionLabel="Go to Dashboard"
            onAction={handleGoBack}
            secondaryActionLabel={
              selectedTimePeriod === "daily" ? "View All Orders" : undefined
            }
            onSecondaryAction={
              selectedTimePeriod === "daily"
                ? () => handleTimePeriodChange("total")
                : undefined
            }
          />
        )}

        {/* Loading overlay for order operations */}
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

      {/* Edit Order Modal */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={handleSaveOrder}
          availableMenuItems={availableMenuItems}
          isSubmitting={submitting}
        />
      )}

      {/* View Order Modal */}
      {viewingOrder && (
        <OrderDetailsModal
          order={viewingOrder}
          orderStatuses={statusOptions}
          onClose={() => setViewingOrder(null)}
          onStatusUpdate={handleUpdateStatus}
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
    </div>
  );
};

export default memo(MyOrdersPage);
