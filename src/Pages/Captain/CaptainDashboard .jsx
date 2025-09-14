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

// Services and utilities
import { captainServices } from "../../services/captainServices";
import { useOrderData } from "../../customHooks/useOrder";
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

// Lazy load heavy components
const OrderDetailsModal = React.lazy(() => import("./OrderDetailsModal"));

/**
 * Quick Actions component for common captain operations
 */
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

/**
 * Main Captain Dashboard Component
 * Provides order management interface with consistent data handling
 */
const CaptainDashboard = memo(() => {
  const navigate = useNavigate();

  // Captain state
  const [captain, setCaptain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState(null);

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Order status options - consistent across the application

  // Enhanced order data hook
  const {
    orders,
    filteredOrders,
    orderStats,
    loading: ordersLoading,
    error: ordersError,
    searchTerm,
    statusFilter,
    handleSearchChange,
    handleStatusFilterChange,
    clearFilters,
    updateOrderStatus,
    refreshOrders,
    hasOrders,
    hasFilteredOrders,
    filteredOrdersCount,
  } = useOrderData(captain?.hotelName, {
    defaultTimePeriod: "total", // Show all orders for captain view
    defaultStatusFilter: "all",
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
      const result = await updateOrderStatus(orderId, newStatus);

      // Update selected order if it's the same one
      if (result.success && selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          normalizedStatus: newStatus,
          status: newStatus,
        });
      }
    },
    [updateOrderStatus, selectedOrder]
  );

  const handleViewOrder = useCallback((order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  }, []);

  const handleRefresh = useCallback(() => {
    refreshOrders();
  }, [refreshOrders]);

  const handleCreateOrder = useCallback(() => {
    if (captain?.hotelName) {
      navigate(`/captain/menu/${captain.hotelName}`);
    } else {
      toast.error("Hotel information not found");
    }
  }, [captain, navigate]);

  // Computed values
  const isLoading = loading || ordersLoading;
  const hasError = error || ordersError;

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
            orderStatuses={ORDER_STATUSES}
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
            totalCount={orderStats.total}
            filteredCount={filteredOrdersCount}
            onClearSearch={clearFilters}
            totalLabel="total orders"
            showStatusFilter={true}
            statusFilter={statusFilter}
            onStatusChange={(e) => handleStatusFilterChange(e.target.value)}
            statusOptions={ORDER_STATUSES}
          />
        )}

        {/* Orders Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {hasOrders ? (
            <>
              {hasFilteredOrders ? (
                <>
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
                      initialRowsPerPage={10}
                      sortable={true}
                      className="border-0"
                      showLabelsOnActions={false}
                      onRowClick={handleViewOrder} // Click row to view order
                    />
                  </Suspense>
                </>
              ) : (
                <NoSearchResults
                  searchTerm={searchTerm}
                  onClearSearch={clearFilters}
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
              loading={ordersLoading}
            />
          )}
        </div>

        {/* Loading overlay for order operations */}
        {ordersLoading && hasOrders && (
          <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
            <LoadingSpinner text="Updating orders..." />
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
