import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { Package } from "lucide-react";

// Services and utilities
import { captainServices } from "../../services/api/captainServices";
import { useOrder } from "../../hooks/useOrder";
import { app } from "../../services/firebase/firebaseConfig";

// Components
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "../../atoms/Messages/EmptyState";
import NoSearchResults from "../../components/NoSearchResults";
import SearchWithResults from "../../components/SearchWithResults";
import OrderCard from "../../components/Cards/OrderCard";
import ErrorMessage from "../../atoms/Messages/ErrorMessage";
import { PageTitle } from "../../atoms";

// Modals
import EditOrderModal from "./EditOrderModal";
import OrderDetailsModal from "./OrderDetailsModal";
import PrintBill from "./PrintBill";

const firestore = getFirestore(app);

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { hotelName } = useParams();

  // Captain & menu state
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

  // Order hook with comprehensive functionality
  const {
    orders,
    filteredOrders,
    loading,
    submitting,
    error: orderError,
    lastUpdated,

    // Filter state
    searchTerm,
    statusFilter,

    // Display helpers
    hasOrders,
    hasFilteredOrders,
    isConnected,
    isLoading,
    isError,
    errorMessage,

    // Filter handlers
    handleSearchChange,
    handleStatusFilterChange,
    clearFilters,

    // Actions
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    refreshOrders,

    // Options for UI
    statusOptions,
  } = useOrder(hotelName || captain?.hotelName, {
    defaultTimePeriod: "total",
    defaultStatusFilter: "all",
    includeMenuData: false,
    sortBy: "timestamp",
    sortOrder: "desc",
  });

  // Restaurant info for bill printing
  const restaurantInfo = useMemo(
    () => ({
      name: captain?.hotelName || hotelName || "Restaurant Name",
      address: captain?.address || "Restaurant Address, City, State - 123456",
      phone: captain?.phone || "+91 12345 67890",
      gst: captain?.gstNumber || "12ABCDE3456F1Z5",
      taxRate: 0.18,
      footer: "Thank you for dining with us!",
    }),
    [captain, hotelName]
  );

  // Print bill handler
  const handlePrintBill = useCallback((order) => {
    setSelectedOrderForBill(order);
    setShowPrintBill(true);
  }, []);

  // Load captain data
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

  // Load menu items from Firestore
  useEffect(() => {
    const targetHotelName = hotelName || captain?.hotelName;
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
  }, [captain, hotelName]);

  // Navigation handlers
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

  // Update order status handler
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
    [updateOrderStatus, refreshOrders, captain?.name]
  );

  // Edit order modal handlers
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
          await refreshOrders();
        } else throw new Error(result.error || "Failed to update order");
      } catch (error) {
        console.error("Error saving order:", error);
        throw error;
      }
    },
    [updateOrder, refreshOrders, captain?.name]
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
  const showLoadingSpinner = isLoading && !captain;
  const showError = (error || isError) && !orders.length;

  // Render loading state
  if (showLoadingSpinner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading orders..." />
      </div>
    );
  }

  // Render error state
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
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl shadow-lg p-4 sm:p-6 text-white mb-6">
          <PageTitle
            pageTitle="My Orders"
            className="text-2xl sm:text-3xl font-bold text-white"
            description={`${filteredOrders.length} ${
              statusFilter === "all" ? "total" : statusFilter
            } orders`}
          />
        </div>

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
                    ? orders.length
                    : orders.filter((o) => o.normalizedStatus === option.value)
                        .length;

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
            totalCount={orders.length}
            filteredCount={filteredOrders.length}
            onClearSearch={clearFilters}
            totalLabel="orders"
            showStatusFilter={false}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            lastUpdated={lastUpdated}
          />
        )}

        {/* Orders Grid */}
        {hasFilteredOrders ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                captainMode
                disableActions={submitting || updatingOrderId !== null}
              />
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
            icon={Package}
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
          showDetailedInfo
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
