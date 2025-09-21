// src/Pages/Captain/MyOrdersPage.jsx
import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Calendar,
  CheckCircle,
  Clock,
  LoaderCircle,
  Package,
  ChefHat,
  AlertCircle,
  Wifi,
  WifiOff,
  User,
  RefreshCw,
} from "lucide-react";

// ✅ NEW: Import Firestore methods and context hooks
import { 
  collection, 
  query, 
  where, 
  orderBy as firestoreOrderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  getDocs
} from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";
import { useFirestoreCollection } from "../../hooks/useFirestoreCollection";

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

  // ✅ NEW: Use context hooks
  const { currentUser } = useAuth();
  const { selectedHotel } = useHotelContext();

  // Captain state
  const [captain, setCaptain] = useState(null);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal state
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [showPrintBill, setShowPrintBill] = useState(false);
  const [selectedOrderForBill, setSelectedOrderForBill] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("total");

  // ✅ NEW: Get hotel ID for queries
  const hotelId = useMemo(() => {
    return selectedHotel?.id || captain?.hotelId || hotelName;
  }, [selectedHotel, captain, hotelName]);

  // ✅ ENHANCED: Use Firestore collection hook for captain's orders
  const {
    documents: orders,
    loading: ordersLoading,
    error: ordersError,
    connectionStatus,
    lastFetch,
    refresh: refreshOrders,
  } = useFirestoreCollection('orders', {
    where: hotelId && currentUser ? [
      ['hotelId', '==', hotelId],
      ['captainId', '==', currentUser.uid]
    ] : null,
    orderBy: [['createdAt', 'desc']],
    limit: 100,
    realtime: true,
    enableRetry: true,
  });

  // ✅ ENHANCED: Use Firestore collection hook for menu items
  const {
    documents: menuItems,
    loading: menuLoading,
  } = useFirestoreCollection('menuItems', {
    where: hotelId ? [
      ['hotelId', '==', hotelId],
      ['availability', '==', 'Available']
    ] : null,
    orderBy: [['menuName', 'asc']],
    realtime: true,
  });

  // ✅ NEW: Load captain data from Firestore
  useEffect(() => {
    const loadCaptainData = async () => {
      if (!currentUser?.uid) {
        navigate("/captain/login");
        return;
      }

      try {
        const captainDoc = await getDoc(doc(db, 'captains', currentUser.uid));
        if (!captainDoc.exists()) {
          navigate("/captain/login");
          return;
        }

        const captainData = {
          id: captainDoc.id,
          ...captainDoc.data()
        };
        setCaptain(captainData);
      } catch (error) {
        console.error("Error loading captain data:", error);
        setError("Error loading captain information");
      }
    };

    loadCaptainData();
  }, [currentUser, navigate]);

  // ✅ NEW: Filter orders based on time period and search
  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    let filtered = [...orders];

    // Time period filtering
    const today = new Date();
    const selectedDateObj = new Date(selectedDate);
    
    switch (selectedTimePeriod) {
      case 'daily':
        filtered = filtered.filter(order => {
          const orderDate = order.createdAt?.toDate ? 
            order.createdAt.toDate() : 
            new Date(order.createdAt);
          return orderDate.toDateString() === selectedDateObj.toDateString();
        });
        break;
      case 'weekly':
        const weekStart = new Date(selectedDateObj);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        filtered = filtered.filter(order => {
          const orderDate = order.createdAt?.toDate ? 
            order.createdAt.toDate() : 
            new Date(order.createdAt);
          return orderDate >= weekStart && orderDate <= weekEnd;
        });
        break;
      case 'monthly':
        filtered = filtered.filter(order => {
          const orderDate = order.createdAt?.toDate ? 
            order.createdAt.toDate() : 
            new Date(order.createdAt);
          return orderDate.getMonth() === selectedDateObj.getMonth() && 
                 orderDate.getFullYear() === selectedDateObj.getFullYear();
        });
        break;
      // 'total' shows all orders
    }

    // Status filtering
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => {
        const orderStatus = order.status || order.normalizedStatus || 'received';
        return orderStatus.toLowerCase() === statusFilter.toLowerCase();
      });
    }

    // Search filtering
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(order => {
        return (
          order.orderNumber?.toString().toLowerCase().includes(search) ||
          order.tableNumber?.toString().toLowerCase().includes(search) ||
          order.customerName?.toLowerCase().includes(search) ||
          order.customerPhone?.includes(search) ||
          (order.items && order.items.some(item => 
            item.menuName?.toLowerCase().includes(search) ||
            item.menuCategory?.toLowerCase().includes(search)
          ))
        );
      });
    }

    return filtered;
  }, [orders, selectedTimePeriod, selectedDate, statusFilter, searchTerm]);

  // ✅ NEW: Calculate order statistics
  const displayStats = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) {
      return {
        total: 0,
        received: 0,
        completed: 0,
        rejected: 0,
        totalRevenue: 0,
        activeOrders: 0,
        completionRate: 0,
      };
    }

    const stats = {
      total: filteredOrders.length,
      received: 0,
      completed: 0,
      rejected: 0,
      totalRevenue: 0,
    };

    filteredOrders.forEach(order => {
      const status = (order.status || order.normalizedStatus || 'received').toLowerCase();
      
      switch (status) {
        case 'received':
        case 'pending':
        case 'preparing':
        case 'ready':
          stats.received++;
          break;
        case 'completed':
        case 'delivered':
          stats.completed++;
          stats.totalRevenue += order.pricing?.total || order.totalAmount || 0;
          break;
        case 'rejected':
        case 'cancelled':
          stats.rejected++;
          break;
      }
    });

    stats.activeOrders = stats.received;
    stats.completionRate = stats.total > 0 ? 
      Math.round((stats.completed / stats.total) * 100) : 0;

    return stats;
  }, [filteredOrders]);

  // ✅ NEW: Status options for filtering
  const statusOptions = [
    { label: 'All Orders', value: 'all' },
    { label: 'Received', value: 'received' },
    { label: 'Preparing', value: 'preparing' },
    { label: 'Ready', value: 'ready' },
    { label: 'Completed', value: 'completed' },
    { label: 'Rejected', value: 'rejected' },
  ];

  // ✅ NEW: Time period options
  const timePeriodOptions = [
    { label: 'Today', value: 'daily' },
    { label: 'This Week', value: 'weekly' },
    { label: 'This Month', value: 'monthly' },
    { label: 'All Time', value: 'total' },
  ];

  // ✅ NEW: Period display text
  const periodDisplayText = useMemo(() => {
    switch (selectedTimePeriod) {
      case 'daily':
        return `Orders for ${new Date(selectedDate).toLocaleDateString()}`;
      case 'weekly':
        return 'This Week\'s Orders';
      case 'monthly':
        return 'This Month\'s Orders';
      case 'total':
        return 'All My Orders';
      default:
        return 'My Orders';
    }
  }, [selectedTimePeriod, selectedDate]);

  // Restaurant information for the bill
  const restaurantInfo = useMemo(
    () => ({
      name: selectedHotel?.businessName || selectedHotel?.name || captain?.hotelName || hotelName || "Restaurant Name",
      address: selectedHotel?.address?.street || captain?.address || "Restaurant Address, City, State - 123456",
      phone: selectedHotel?.phone || captain?.phone || "+91 12345 67890",
      gst: selectedHotel?.gstNumber || captain?.gstNumber || "12ABCDE3456F1Z5",
      taxRate: selectedHotel?.taxRate || 0.18,
      serviceCharge: selectedHotel?.serviceCharge || 0.05,
      footer: "Thank you for dining with us!",
    }),
    [captain, hotelName, selectedHotel]
  );

  // ✅ NEW: Connection status indicator
  const ConnectionStatusIndicator = () => {
    if (connectionStatus === 'connecting') {
      return (
        <div className="flex items-center gap-2 text-yellow-600 text-sm">
          <Wifi className="animate-pulse" size={16} />
          <span>Loading orders...</span>
        </div>
      );
    } else if (connectionStatus === 'error') {
      return (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <WifiOff size={16} />
          <span>Connection Error</span>
        </div>
      );
    } else if (connectionStatus === 'connected' && orders) {
      return (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle size={16} />
          <span>{orders.length} orders loaded</span>
        </div>
      );
    }
    return null;
  };

  // Event handlers
  const handleGoBack = useCallback(() => {
    navigate(`/viewMenu/${hotelName}/captain/dashboard`);
  }, [navigate, hotelName]);

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

  // ✅ ENHANCED: Update status with Firestore integration
  const handleUpdateStatus = useCallback(
    async (orderId, newStatus, rejectionReason = null) => {
      setUpdatingOrderId(orderId);

      try {
        const orderDocRef = doc(db, 'orders', orderId);
        
        const updateData = {
          status: newStatus,
          normalizedStatus: newStatus,
          updatedAt: serverTimestamp(),
          updatedBy: currentUser?.uid,
          updatedByName: captain?.name || captain?.firstName || 'Captain',
          kitchen: {
            status: newStatus,
            lastUpdated: serverTimestamp(),
            notes: rejectionReason || `Status updated by ${captain?.name || 'Captain'} from My Orders`,
          },
          ...(rejectionReason && { rejectionReason }),
        };

        // Add to status history
        const existingOrder = orders.find(o => o.id === orderId);
        if (existingOrder) {
          const newStatusEntry = {
            status: newStatus,
            timestamp: serverTimestamp(),
            updatedBy: currentUser?.uid,
            updatedByName: captain?.name || captain?.firstName || 'Captain',
            note: rejectionReason || `Status updated to ${newStatus}`,
          };

          updateData['lifecycle.statusHistory'] = [
            ...(existingOrder.lifecycle?.statusHistory || []),
            newStatusEntry
          ];
        }

        await updateDoc(orderDocRef, updateData);

        return { success: true };
      } catch (error) {
        console.error("Error updating order status:", error);
        return { success: false, error: error.message };
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [orders, currentUser, captain]
  );

  const handleEditOrder = useCallback((order) => {
    setEditingOrder(order);
  }, []);

  // ✅ ENHANCED: Save order with Firestore integration
  const handleSaveOrder = useCallback(
    async (updatedOrder) => {
      try {
        const orderDocRef = doc(db, 'orders', updatedOrder.id);
        
        await updateDoc(orderDocRef, {
          items: updatedOrder.items,
          orderDetails: updatedOrder.orderDetails,
          pricing: updatedOrder.pricing,
          updatedAt: serverTimestamp(),
          lastModified: serverTimestamp(),
          modifiedBy: currentUser?.uid,
          modifiedByName: captain?.name || captain?.firstName || 'Captain',
        });

        setEditingOrder(null);
      } catch (error) {
        console.error("Error saving order:", error);
        throw error;
      }
    },
    [currentUser, captain]
  );

  const handleViewOrder = useCallback((order) => {
    setViewingOrder(order);
  }, []);

  // ✅ ENHANCED: Delete order with Firestore integration
  const handleDeleteOrder = useCallback(
    async (orderId) => {
      const order = orders.find((o) => o.id === orderId);
      const confirmMessage = order
        ? `Are you sure you want to cancel order #${order.orderNumber} from Table ${order.tableNumber}?`
        : "Are you sure you want to cancel this order?";

      if (!window.confirm(confirmMessage)) {
        return { success: false };
      }

      try {
        const orderDocRef = doc(db, 'orders', orderId);
        
        await updateDoc(orderDocRef, {
          status: 'cancelled',
          normalizedStatus: 'cancelled',
          updatedAt: serverTimestamp(),
          cancelledBy: currentUser?.uid,
          cancelledByName: captain?.name || captain?.firstName || 'Captain',
          cancelledAt: serverTimestamp(),
        });

        return { success: true };
      } catch (error) {
        console.error("Error cancelling order:", error);
        return { success: false, error: error.message };
      }
    },
    [orders, currentUser, captain]
  );

  const handlePrintBill = useCallback((order) => {
    console.log("Printing bill for order:", order);
    setSelectedOrderForBill(order);
    setShowPrintBill(true);
  }, []);

  // Filter handlers
  const handleSearchInputChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleStatusInputChange = useCallback((e) => {
    setStatusFilter(e.target.value);
  }, []);

  const handleTimePeriodChange = useCallback((period) => {
    setSelectedTimePeriod(period);
  }, []);

  const handleDateChange = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
    setSelectedTimePeriod("total");
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, []);

  // Computed values
  const hasOrders = orders && orders.length > 0;
  const hasFilteredOrders = filteredOrders && filteredOrders.length > 0;
  const isLoading = ordersLoading;
  const showError = (error || ordersError) && !orders?.length;

  // Loading state
  if (isLoading && !captain) {
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
          message={ordersError?.message || error}
          title="Error Loading Orders"
          onRetry={handleRefresh}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* ✅ ENHANCED: Header with Connection Status */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <PageTitle
              pageTitle="My Orders"
              className="text-2xl sm:text-3xl font-bold text-gray-900"
              description={periodDisplayText}
            />
          </div>

          <div className="flex items-center gap-4">
            <ConnectionStatusIndicator />
            {captain && (
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <User size={14} />
                <span>{captain.name || captain.firstName}</span>
              </div>
            )}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                isRefreshing ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Time Period Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <TimePeriodSelector
            selectedTimePeriod={selectedTimePeriod}
            onTimePeriodChange={handleTimePeriodChange}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            variant="default"
            showDatePicker={true}
            className="mb-4"
            disableFutureDates={true}
            datePickerProps={{
              placeholder: "Select a date to view orders",
            }}
            options={timePeriodOptions}
          />

          {/* Period Summary */}
          <div className="text-sm text-gray-600">
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
            <StatCard
              icon={Package}
              title="Total Orders"
              value={displayStats.total}
              color="blue"
              subtitle={`${displayStats.activeOrders} active`}
            />
            <StatCard
              icon={Clock}
              title="Received"
              value={displayStats.received}
              color="yellow"
              subtitle="Being processed"
              alert={displayStats.received > 5}
            />
            <StatCard
              icon={CheckCircle}
              title="Completed"
              value={displayStats.completed}
              color="green"
              subtitle={`${displayStats.completionRate}% completion rate`}
            />
            <StatCard
              icon={AlertCircle}
              title="Rejected"
              value={displayStats.rejected}
              color="red"
              subtitle="Cancelled orders"
            />
          </div>
        )}

        {/* Search and Filters */}
        {hasOrders && (
          <SearchWithResults
            searchTerm={searchTerm}
            onSearchChange={handleSearchInputChange}
            placeholder="Search orders by number, table, customer name, or item..."
            totalCount={orders.length}
            filteredCount={filteredOrders.length}
            onClearSearch={clearFilters}
            totalLabel="orders"
            showStatusFilter={true}
            statusFilter={statusFilter}
            onStatusChange={handleStatusInputChange}
            statusOptions={statusOptions}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            lastUpdated={lastFetch}
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
                onPrintBill={handlePrintBill}
                isUpdating={updatingOrderId === order.id}
                showConnectionStatus={connectionStatus !== 'connected'}
                captainMode={true}
              />
            ))}
          </div>
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
                ? `No orders found for ${new Date(selectedDate).toLocaleDateString()}. Try selecting a different date or time period.`
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
        {(updatingOrderId || isRefreshing) && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3 shadow-lg">
              <LoadingSpinner size="sm" />
              <span className="text-gray-700 font-medium">
                {isRefreshing ? "Refreshing orders..." : "Processing order..."}
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
          availableMenuItems={menuItems || []}
          isSubmitting={false}
        />
      )}

      {/* View Order Modal */}
      {viewingOrder && (
        <OrderDetailsModal
          order={viewingOrder}
          orderStatuses={statusOptions}
          onClose={() => setViewingOrder(null)}
          onStatusUpdate={handleUpdateStatus}
          isSubmitting={updatingOrderId === viewingOrder.id}
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
