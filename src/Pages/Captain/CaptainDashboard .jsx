// src/Pages/Captain/CaptainDashboard.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  memo,
  Suspense,
  useMemo,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Wifi,
  WifiOff,
} from "lucide-react";

// ✅ NEW: Import Firestore-based services and hooks
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  orderBy as firestoreOrderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";
import { useFirestoreCollection } from "../../hooks/useFirestoreCollection";
import { toast } from "react-toastify";

// Components
import StatCard from "../../components/Cards/StatCard";
import { DynamicTable } from "../../components";
import { ORDER_STATUSES, orderColumns } from "../../Constants/Columns";

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
  const { hotelName } = useParams();

  // ✅ NEW: Use context hooks
  const { currentUser, isAuthenticated } = useAuth();
  const { selectedHotel, selectHotelById } = useHotelContext();

  // Captain state
  const [captain, setCaptain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("daily");

  // ✅ NEW: Get hotel ID for queries
  const hotelId = useMemo(() => {
    return selectedHotel?.id || hotelName;
  }, [selectedHotel, hotelName]);

  // ✅ ENHANCED: Use Firestore collection hook for orders
  const {
    documents: orders,
    loading: ordersLoading,
    error: ordersError,
    connectionStatus,
    lastFetch,
    refresh: refreshOrders,
  } = useFirestoreCollection("orders", {
    where: hotelId
      ? [
          ["hotelId", "==", hotelId],
          ["captainId", "==", currentUser?.uid],
        ]
      : null,
    orderBy: [["createdAt", "desc"]],
    limit: 100,
    realtime: true,
    enableRetry: true,
  });

  // ✅ NEW: Load captain data from Firestore
  useEffect(() => {
    const loadCaptainData = async () => {
      if (!currentUser || !isAuthenticated) {
        navigate("/captain/login");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // ✅ FIRESTORE: Get captain data from Firestore
        const captainDocRef = doc(db, "captains", currentUser.uid);
        const captainDoc = await getDoc(captainDocRef);

        if (!captainDoc.exists()) {
          toast.error("Captain profile not found. Please contact support.");
          navigate("/captain/login");
          return;
        }

        const captainData = {
          id: captainDoc.id,
          ...captainDoc.data(),
          uid: currentUser.uid,
          email: currentUser.email,
        };

        setCaptain(captainData);

        // Set hotel context if we have hotel info
        if (captainData.hotelId && !selectedHotel) {
          selectHotelById(captainData.hotelId);
        }
      } catch (error) {
        console.error("Error loading captain data:", error);
        setError(error.message || "Error loading captain information");
      } finally {
        setLoading(false);
      }
    };

    loadCaptainData();
  }, [currentUser, isAuthenticated, navigate, selectedHotel, selectHotelById]);

  // ✅ NEW: Filter orders based on time period and search
  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    let filtered = [...orders];

    // Time period filtering
    const today = new Date();
    const selectedDateObj = new Date(selectedDate);

    switch (selectedTimePeriod) {
      case "daily":
        filtered = filtered.filter((order) => {
          const orderDate = order.createdAt?.toDate
            ? order.createdAt.toDate()
            : new Date(order.createdAt);
          return orderDate.toDateString() === selectedDateObj.toDateString();
        });
        break;
      case "weekly":
        const weekStart = new Date(selectedDateObj);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        filtered = filtered.filter((order) => {
          const orderDate = order.createdAt?.toDate
            ? order.createdAt.toDate()
            : new Date(order.createdAt);
          return orderDate >= weekStart && orderDate <= weekEnd;
        });
        break;
      case "monthly":
        filtered = filtered.filter((order) => {
          const orderDate = order.createdAt?.toDate
            ? order.createdAt.toDate()
            : new Date(order.createdAt);
          return (
            orderDate.getMonth() === selectedDateObj.getMonth() &&
            orderDate.getFullYear() === selectedDateObj.getFullYear()
          );
        });
        break;
      // 'total' shows all orders
    }

    // Status filtering
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => {
        const orderStatus = order.status || order.normalizedStatus || "pending";
        return orderStatus.toLowerCase() === statusFilter.toLowerCase();
      });
    }

    // Search filtering
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((order) => {
        return (
          order.orderNumber?.toString().toLowerCase().includes(search) ||
          order.tableNumber?.toString().toLowerCase().includes(search) ||
          order.customerName?.toLowerCase().includes(search) ||
          order.customerPhone?.includes(search) ||
          (order.items &&
            order.items.some(
              (item) =>
                item.name?.toLowerCase().includes(search) ||
                item.menuName?.toLowerCase().includes(search)
            ))
        );
      });
    }

    return filtered;
  }, [orders, selectedTimePeriod, selectedDate, statusFilter, searchTerm]);

  // ✅ NEW: Calculate order statistics
  const orderStats = useMemo(() => {
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

    filteredOrders.forEach((order) => {
      const status = (
        order.status ||
        order.normalizedStatus ||
        "pending"
      ).toLowerCase();

      switch (status) {
        case "pending":
        case "preparing":
        case "ready":
          stats.received++;
          break;
        case "completed":
        case "delivered":
          stats.completed++;
          break;
        case "rejected":
        case "cancelled":
          stats.rejected++;
          break;
      }

      // Calculate revenue (only from completed orders)
      if (status === "completed" || status === "delivered") {
        stats.totalRevenue += order.totalAmount || order.grandTotal || 0;
      }
    });

    stats.activeOrders = stats.received;
    stats.completionRate =
      stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    return stats;
  }, [filteredOrders]);

  // ✅ NEW: Status options for filtering
  const statusOptions = [
    { label: "All Orders", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Preparing", value: "preparing" },
    { label: "Ready", value: "ready" },
    { label: "Completed", value: "completed" },
    { label: "Rejected", value: "rejected" },
  ];

  // ✅ NEW: Time period options
  const timePeriodOptions = [
    { label: "Today", value: "daily" },
    { label: "This Week", value: "weekly" },
    { label: "This Month", value: "monthly" },
    { label: "All Time", value: "total" },
  ];

  // ✅ ENHANCED: Update order status with Firestore
  const handleOrderStatusUpdate = useCallback(
    async (orderId, newStatus) => {
      if (!orderId) return { success: false, error: "Order ID is required" };

      try {
        const orderDocRef = doc(db, "orders", orderId);

        await updateDoc(orderDocRef, {
          status: newStatus,
          normalizedStatus: newStatus,
          updatedAt: serverTimestamp(),
          updatedBy: currentUser?.uid,
          updatedByName: captain?.name || captain?.email || "Captain",
          kitchen: {
            status: newStatus,
            lastUpdated: serverTimestamp(),
            notes: `Status updated by ${
              captain?.name || "Captain"
            } from dashboard`,
          },
        });

        // Update selected order if it's the same one
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => ({
            ...prev,
            status: newStatus,
            normalizedStatus: newStatus,
            kitchen: {
              ...prev.kitchen,
              status: newStatus,
              lastUpdated: new Date().toISOString(),
            },
          }));
        }

        toast.success(`Order status updated to ${newStatus}`);
        return { success: true };
      } catch (error) {
        console.error("Error updating order status:", error);
        toast.error(`Failed to update order status: ${error.message}`);
        return { success: false, error: error.message };
      }
    },
    [currentUser, captain, selectedOrder]
  );

  // Event handlers
  const handleLogout = useCallback(async () => {
    try {
      setLoggingOut(true);

      // ✅ FIRESTORE: Update captain status to offline
      if (captain?.id) {
        const captainDocRef = doc(db, "captains", captain.id);
        await updateDoc(captainDocRef, {
          isOnline: false,
          lastSeen: serverTimestamp(),
        });
      }

      // Clear auth state
      // This would typically be handled by your auth service
      toast.success("Logged out successfully");
      navigate("/captain/login");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Error logging out");
    } finally {
      setLoggingOut(false);
    }
  }, [captain, navigate]);

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
    if (hotelName) {
      navigate(`/viewMenu/${hotelName}/captain/home`);
    } else if (selectedHotel?.name) {
      navigate(`/viewMenu/${selectedHotel.name}/captain/home`);
    } else {
      toast.error("Hotel information not found");
    }
  }, [hotelName, selectedHotel, navigate]);

  const handleViewAllOrders = useCallback(() => {
    if (hotelName) {
      navigate(`/viewMenu/${hotelName}/captain/my-orders`);
    } else {
      navigate("/captain/my-orders");
    }
  }, [hotelName, navigate]);

  // ✅ NEW: Export orders functionality
  const handleExportOrders = useCallback(() => {
    try {
      const csvData = filteredOrders.map((order, index) => ({
        "Sr. No": index + 1,
        "Order Number": order.orderNumber || order.id,
        Table: order.tableNumber || "N/A",
        Customer: order.customerName || "Walk-in",
        Items: order.items
          ? order.items
              .map((item) => `${item.name || item.menuName} x${item.quantity}`)
              .join("; ")
          : "No items",
        "Total Amount": order.totalAmount || order.grandTotal || 0,
        Status: order.status || order.normalizedStatus,
        "Created At": order.createdAt?.toDate
          ? order.createdAt.toDate().toLocaleString()
          : new Date(order.createdAt).toLocaleString(),
      }));

      const csv = csvData.map((row) => Object.values(row).join(",")).join("\n");
      const headers = Object.keys(csvData[0] || {}).join(",");
      const csvContent = headers + "\n" + csv;

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `captain-orders-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Orders exported successfully");
    } catch (error) {
      console.error("Error exporting orders:", error);
      toast.error("Failed to export orders");
    }
  }, [filteredOrders]);

  // Filter handlers
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(
      typeof value === "string" ? value : value.target?.value || ""
    );
  }, []);

  const handleStatusFilterChange = useCallback((value) => {
    setStatusFilter(
      typeof value === "string" ? value : value.target?.value || "all"
    );
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
    setSelectedTimePeriod("daily");
    setSelectedDate(new Date().toISOString().split("T")[0]);
  }, []);

  // ✅ NEW: Connection status indicator
  const ConnectionStatusIndicator = () => {
    if (connectionStatus === "connecting") {
      return (
        <div className="flex items-center gap-2 text-yellow-600 text-sm">
          <Wifi className="animate-pulse" size={16} />
          <span>Connecting...</span>
        </div>
      );
    } else if (connectionStatus === "error") {
      return (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <WifiOff size={16} />
          <span>Connection Error</span>
        </div>
      );
    } else if (connectionStatus === "connected") {
      return (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle size={16} />
          <span>Live Data</span>
        </div>
      );
    }
    return null;
  };

  // Computed values
  const hasOrders = orders && orders.length > 0;
  const hasFilteredOrders = filteredOrders && filteredOrders.length > 0;
  const isLoadingData = loading || ordersLoading;
  const hasError = error || ordersError;
  const periodDisplayText = useMemo(() => {
    switch (selectedTimePeriod) {
      case "daily":
        return `Orders for ${new Date(selectedDate).toLocaleDateString()}`;
      case "weekly":
        return "This Week's Orders";
      case "monthly":
        return "This Month's Orders";
      case "total":
        return "All Orders";
      default:
        return "Orders";
    }
  }, [selectedTimePeriod, selectedDate]);

  // Error state
  if (hasError && !captain) {
    return (
      <ErrorMessage
        error={error || ordersError}
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
  if (!captain && !loading) {
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
      {/* ✅ NEW: Connection Status Bar */}
      {connectionStatus !== "connected" && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <ConnectionStatusIndicator />
        </div>
      )}

      {/* Order Details Modal */}
      <Suspense fallback={<LoadingSpinner />}>
        {showOrderModal && selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            orderStatuses={statusOptions}
            onClose={handleModalClose}
            onStatusUpdate={handleOrderStatusUpdate}
            isSubmitting={false}
            showDetailedInfo={true}
          />
        )}
      </Suspense>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Connection Status */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <PageTitle
              pageTitle="Captain Dashboard"
              className="text-2xl sm:text-3xl font-bold text-gray-900"
              description={periodDisplayText}
            />
          </div>
          <div className="flex items-center gap-2">
            <ConnectionStatusIndicator />
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                isRefreshing ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              <RefreshCw
                size={16}
                className={isRefreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Captain Welcome */}
        {captain && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-8">
            <h2 className="text-xl font-semibold mb-2">
              Welcome back, {captain.name || captain.firstName || "Captain"}!
            </h2>
            <p className="text-blue-100">
              {selectedHotel?.businessName ||
                selectedHotel?.name ||
                captain.hotelName ||
                "Restaurant"}{" "}
              •
              {hasFilteredOrders
                ? ` ${filteredOrders.length} orders today`
                : " No orders yet today"}
            </p>
          </div>
        )}

        {/* Time Period Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <TimePeriodSelector
            selectedTimePeriod={selectedTimePeriod}
            onTimePeriodChange={handleTimePeriodChange}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            variant="compact"
            showDatePicker={true}
            className="mb-4"
            disableFutureDates={true}
            datePickerProps={{
              placeholder: "Select a date to view orders",
            }}
            options={timePeriodOptions}
          />
        </div>

        {/* Enhanced Order Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Package}
            title="Total Orders"
            value={orderStats.total}
            color="blue"
            subtitle={`${orderStats.activeOrders} active`}
            trend={orderStats.total > 0 ? "up" : "neutral"}
          />
          <StatCard
            icon={Clock}
            title="Ongoing"
            value={orderStats.received}
            color="yellow"
            subtitle="Being processed"
            alert={orderStats.received > 5}
          />
          <StatCard
            icon={CheckCircle}
            title="Completed"
            value={orderStats.completed}
            color="green"
            subtitle={`${orderStats.completionRate}% completion rate`}
          />
          <StatCard
            icon={AlertCircle}
            title="Rejected"
            value={orderStats.rejected}
            color="red"
            subtitle="Cancelled orders"
          />
        </div>

        {/* Search and Filters */}
        {hasOrders && (
          <SearchWithResults
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            placeholder="Search orders by number, table, customer name..."
            totalCount={orders.length}
            filteredCount={filteredOrders.length}
            onClearSearch={clearFilters}
            totalLabel="orders"
            showStatusFilter={true}
            statusFilter={statusFilter}
            onStatusChange={handleStatusFilterChange}
            statusOptions={statusOptions}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            lastUpdated={lastFetch}
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
                          {filteredOrders.length} of {orders.length} orders
                        </span>
                        {statusFilter !== "all" && (
                          <span className="text-gray-600">
                            (filtered by {statusFilter})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-gray-600">
                        {orderStats.totalRevenue > 0 && (
                          <span>
                            Revenue: ₹{orderStats.totalRevenue.toLocaleString()}
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
                        const status = order.normalizedStatus || order.status;
                        if (status === "ready") return "bg-green-50";
                        if (
                          status === "pending" &&
                          new Date() -
                            (order.createdAt?.toDate
                              ? order.createdAt.toDate()
                              : new Date(order.createdAt)) >
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
        {ordersLoading && hasOrders && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3 shadow-lg">
              <LoadingSpinner size="sm" />
              <span className="text-gray-700 font-medium">
                Loading orders...
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
