import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  Suspense,
} from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { onValue, ref, set } from "firebase/database";
import {
  Clock,
  ChefHat,
  AlertCircle,
  CheckCircle,
  Package,
  Eye,
  Utensils,
  CheckCircle2,
  Plus,
  Edit3,
} from "lucide-react";
import { captainServices } from "../../services/captainServices";
import { toast } from "react-toastify";
import { db } from "../../data/firebase/firebaseConfig";
import StatCard from "../../components/Cards/StatCard";
import PageTitle from "../../atoms/PageTitle";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import NoSearchResults from "molecules/NoSearchResults";
import SearchWithResults from "molecules/SearchWithResults";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import WelcomeSection from "molecules/Sections/WelcomeSection";
import OrderStatusBadge from "atoms/Badges/OrderStatusBadge";
import { DynamicTable } from "components";
import { orderColumns } from "Constants/Columns";

// Lazy load heavy components
const OrderDetailsModal = React.lazy(() => import("./OrderDetailsModal"));

// Order row component
const OrderRow = memo(
  ({ order, orderStatuses, onViewOrder, onStatusUpdate }) => (
    <tr key={order.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        #{order.orderNumber || order.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        Table {order.tableNumber || order.tableNo || "N/A"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {order.orderDetails?.totalItems || order.items?.length || 0} items
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ₹{order.pricing?.total || order.total || 0}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <OrderStatusBadge status={order.status} orderStatuses={orderStatuses} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {order.timestamps?.orderPlacedLocal ||
          (order.orderTime
            ? new Date(order.orderTime).toLocaleTimeString()
            : "N/A")}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewOrder(order)}
            className="text-blue-600 hover:text-blue-900 p-1 rounded"
            title="View order details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <select
            value={order.status}
            onChange={(e) => onStatusUpdate(order.id, e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {orderStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </td>
    </tr>
  )
);

OrderRow.displayName = "OrderRow";

// Quick Actions component
const QuickActions = memo(({ onCreateOrder }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
    <div className="flex flex-wrap gap-3">
      <button
        onClick={onCreateOrder}
        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        <Plus className="w-4 h-4" />
        New Order
      </button>
    </div>
  </div>
));

QuickActions.displayName = "QuickActions";

// Main CaptainDashboard component
const CaptainDashboard = memo(() => {
  const navigate = useNavigate();

  // State management
  const [captain, setCaptain] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Order status options
  const orderStatuses = useMemo(
    () => [
      { value: "received", label: "Received", color: "blue", icon: Package },
      {
        value: "preparing",
        label: "Preparing",
        color: "yellow",
        icon: ChefHat,
      },
      { value: "ready", label: "Ready", color: "green", icon: CheckCircle2 },
      { value: "served", label: "Served", color: "purple", icon: Utensils },
      {
        value: "completed",
        label: "Completed",
        color: "gray",
        icon: CheckCircle,
      },
    ],
    []
  );

  // Filtered orders based on status and search term
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (filterStatus !== "all") {
      filtered = filtered.filter((order) => order.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber
            ?.toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.tableNumber
            ?.toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      const aTime = a.timestamps?.orderPlaced || a.orderTime || 0;
      const bTime = b.timestamps?.orderPlaced || b.orderTime || 0;
      return new Date(bTime) - new Date(aTime);
    });
  }, [orders, filterStatus, searchTerm]);

  // Memoized calculations for order statistics
  const orderStats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter(
        (o) => o.status === "received" || o.status === "pending"
      ).length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      ready: orders.filter((o) => o.status === "ready").length,
      completed: orders.filter(
        (o) => o.status === "completed" || o.status === "served"
      ).length,
    }),
    [orders]
  );

  // Helper computed values
  const hasOrders = orders.length > 0;
  const hasSearchResults = filteredOrders.length > 0;

  // Load captain and orders data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = useCallback(async () => {
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
      setLastUpdated(new Date().toISOString());

      // Set up real-time listener for orders
      if (captainData.hotelName) {
        setupOrdersListener(captainData.hotelName);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError(error.message || "Error loading dashboard information");
      setLoading(false);
    }
  }, [navigate]);

  // Set up real-time Firebase listener for orders
  const setupOrdersListener = useCallback((hotelName) => {
    const ordersRef = ref(db, `/hotels/${hotelName}/orders`);

    const unsubscribe = onValue(
      ordersRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const ordersArray = Object.entries(data).map(([key, value]) => ({
              id: key,
              ...value,
            }));
            setOrders(ordersArray);
          } else {
            setOrders([]);
          }
          setLastUpdated(new Date().toISOString());
        } catch (error) {
          console.error("Error processing orders data:", error);
          setError("Error processing orders data");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Firebase orders listener error:", error);
        setError("Error connecting to orders database");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

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
      try {
        if (!captain?.hotelName) {
          toast.error("Hotel information not found");
          return;
        }

        // Update in Firebase
        const orderRef = ref(
          db,
          `/hotels/${captain.hotelName}/orders/${orderId}/status`
        );
        await set(orderRef, newStatus);

        // Update timestamp for status change
        const timestampRef = ref(
          db,
          `/hotels/${captain.hotelName}/orders/${orderId}/timestamps/statusUpdated`
        );
        await set(timestampRef, new Date().toISOString());

        // Update selected order if it's the same one
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }

        toast.success(
          `Order #${
            orders.find((o) => o.id === orderId)?.orderNumber || orderId
          } status updated to ${newStatus}`
        );
      } catch (error) {
        console.error("Error updating order status:", error);
        toast.error("Error updating order status");
      }
    },
    [captain, selectedOrder, orders]
  );

  const handleViewOrder = useCallback((order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  const handleRefresh = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleCreateOrder = useCallback(() => {
    if (captain?.hotelName) {
      navigate(`/captain/menu/${captain.hotelName}`);
    } else {
      toast.error("Hotel information not found");
    }
  }, [captain, navigate]);

  // Error state
  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={handleRefresh}
        title="Error Loading Dashboard"
      />
    );
  }

  // Loading state
  if (loading && !captain) {
    return <LoadingSpinner size="lg" text="Loading captain dashboard..." />;
  }

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
            orderStatuses={orderStatuses}
            onClose={handleModalClose}
            onStatusUpdate={handleOrderStatusUpdate}
          />
        )}
      </Suspense>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <PageTitle
            pageTitle="Orders Management"
            className="text-2xl sm:text-3xl font-bold text-gray-900"
            description="Track and manage your restaurant orders in real-time"
          />
        </div>

        {/* Welcome Section */}
        <WelcomeSection firstName={captain.firstName} />

        {/* Quick Actions */}
        <QuickActions onCreateOrder={handleCreateOrder} />

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
                icon={ChefHat}
                title="Preparing"
                value={orderStats.preparing}
                color="blue"
              />
            </div>
            <div className="transform hover:scale-105 transition-all duration-300">
              <StatCard
                icon={CheckCircle2}
                title="Ready"
                value={orderStats.ready}
                color="green"
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
            placeholder="Search orders by number, table..."
            totalCount={orders.length}
            filteredCount={filteredOrders.length}
            onClearSearch={handleClearSearch}
            totalLabel="total orders"
          />
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {hasOrders ? (
            <>
              {hasSearchResults ? (
                <>
                  {/* Filters */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Orders Management ({filteredOrders.length})
                      </h3>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        {orderStatuses.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Orders Table */}
                  {/* Content */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {hasOrders ? (
                      <>
                        {hasSearchResults ? (
                          <>
                            {/* Orders Table using DynamicTable */}
                            <Suspense
                              fallback={
                                <LoadingSpinner text="Loading orders table..." />
                              }
                            >
                              <DynamicTable
                                columns={orderColumns}
                                data={filteredOrders}
                                onView={handleViewOrder}
                                customActions={[
                                  {
                                    label: "Update Status",
                                    icon: Edit3,
                                    onClick: (order) => {
                                      // You can create a status update modal or use inline dropdown
                                      const newStatus = prompt(
                                        `Update status for order ${order.id}:`,
                                        order.status
                                      );
                                      if (
                                        newStatus &&
                                        orderStatuses.find(
                                          (s) => s.value === newStatus
                                        )
                                      ) {
                                        handleOrderStatusUpdate(
                                          order.id,
                                          newStatus
                                        );
                                      }
                                    },
                                    variant: "primary",
                                  },
                                ]}
                                loading={loading}
                                emptyMessage="No orders match your search criteria"
                                showPagination={true}
                                initialRowsPerPage={10}
                                sortable={true}
                                className="border-0"
                                showLabelsOnActions={false}
                                onRowClick={handleViewOrder} // Optional: click row to view order
                              />
                            </Suspense>
                          </>
                        ) : (
                          <NoSearchResults
                            searchTerm={searchTerm}
                            onClearSearch={handleClearSearch}
                            message="No orders match your search criteria"
                          />
                        )}
                      </>
                    ) : (
                      <EmptyState
                        icon={Package}
                        title="No Orders Yet"
                        description="Orders will appear here once customers start placing them. Check back soon or refresh the page."
                        actionLabel="Refresh Orders"
                        onAction={handleRefresh}
                        loading={loading}
                      />
                    )}
                  </div>
                </>
              ) : (
                <NoSearchResults
                  searchTerm={searchTerm}
                  onClearSearch={handleClearSearch}
                  message="No orders match your search criteria"
                />
              )}
            </>
          ) : (
            <EmptyState
              icon={Package}
              title="No Orders Yet"
              description="Orders will appear here once they are placed. Create your first order to get started!"
              actionLabel="Create Order"
              onAction={handleCreateOrder}
              loading={loading}
            />
          )}
        </div>
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
