import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "../../data/firebase/firebaseConfig";
import { RefreshCw, Calendar } from "lucide-react";
import LoadingSpinner from "Atoms/LoadingSpinner";
import HeaderStats from "components/HeaderStats";
import OrderFilters from "components/OrderFilters";
import EmptyState from "components/EmptyState";
import OrderCard from "components/OrderCard";
import OrderDetailsModal from "components/OrderDetailsModal";
import { useParams } from "react-router-dom";

const KitchenAdminPage = () => {
  const { hotelName } = useParams();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("daily");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orderStats, setOrderStats] = useState({
    pending: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
    rejected: 0,
  });

  // Helper function to get date range for current week
  const getCurrentWeekRange = () => {
    const now = new Date();
    const first = now.getDate() - now.getDay(); // First day is Sunday
    const firstday = new Date(now.setDate(first));
    const lastday = new Date(firstday);
    lastday.setDate(firstday.getDate() + 6);
    return { start: firstday, end: lastday };
  };

  // Helper function to get date range for current month
  const getCurrentMonthRange = () => {
    const now = new Date();
    const firstday = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastday = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: firstday, end: lastday };
  };

  // Helper function to check if a date falls within a range
  const isDateInRange = (orderDate, startDate, endDate) => {
    const date = new Date(orderDate);
    date.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return date >= start && date <= end;
  };

  // Fetch orders from Firebase
  useEffect(() => {
    if (!hotelName) return;

    const ordersRef = ref(db, `/hotels/${hotelName}/orders`);
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ordersArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        // Sort by order placed time (newest first)
        ordersArray.sort(
          (a, b) =>
            new Date(b.timestamps?.orderPlaced || 0) -
            new Date(a.timestamps?.orderPlaced || 0)
        );

        setOrders(ordersArray);
      } else {
        setOrders([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [hotelName]);

  // Filter orders based on active filter, date, and time period
  const processedOrders = useMemo(() => {
    let filtered = [...orders];

    // Filter by time period first
    if (selectedTimePeriod === "daily") {
      filtered = filtered.filter((order) => {
        const orderDateStr =
          order.timestamps?.orderDate ||
          new Date(order.timestamps?.orderPlaced).toISOString().split("T")[0];
        return orderDateStr === selectedDate;
      });
    } else if (selectedTimePeriod === "weekly") {
      const { start, end } = getCurrentWeekRange();
      filtered = filtered.filter((order) => {
        const orderDate =
          order.timestamps?.orderDate ||
          new Date(order.timestamps?.orderPlaced).toISOString().split("T")[0];
        return isDateInRange(orderDate, start, end);
      });
    } else if (selectedTimePeriod === "monthly") {
      const { start, end } = getCurrentMonthRange();
      filtered = filtered.filter((order) => {
        const orderDate =
          order.timestamps?.orderDate ||
          new Date(order.timestamps?.orderPlaced).toISOString().split("T")[0];
        return isDateInRange(orderDate, start, end);
      });
    }
    // For 'total', show all orders (no date filtering)

    return filtered;
  }, [orders, selectedDate, selectedTimePeriod]);

  // Filter processed orders by status
  const finalFilteredOrders = useMemo(() => {
    if (activeFilter === "all") {
      return processedOrders;
    }

    return processedOrders.filter((order) => {
      const status = order.kitchen?.status || order.status || "received";
      return status === activeFilter;
    });
  }, [processedOrders, activeFilter]);

  // Calculate stats based on processed orders (time period filtered)
  const calculatedStats = useMemo(() => {
    const stats = {
      pending: 0,
      preparing: 0,
      ready: 0,
      completed: 0,
      rejected: 0,
    };

    processedOrders.forEach((order) => {
      const status = order.kitchen?.status || order.status || "received";
      if (status === "received") stats.pending++;
      else if (status === "preparing") stats.preparing++;
      else if (status === "ready") stats.ready++;
      else if (status === "completed") stats.completed++;
      else if (status === "rejected") stats.rejected++;
    });

    return stats;
  }, [processedOrders]);

  // Update filtered orders and stats when dependencies change
  useEffect(() => {
    setFilteredOrders(finalFilteredOrders);
    setOrderStats(calculatedStats);
  }, [finalFilteredOrders, calculatedStats]);

  const updateOrderStatus = useCallback(
    async (orderId, newStatus, additionalData = {}) => {
      try {
        const orderRef = ref(db, `/hotels/${hotelName}/orders/${orderId}`);
        const updates = {
          "kitchen/status": newStatus,
          "kitchen/lastUpdated": new Date().toISOString(),
          ...additionalData,
        };

        // Add status-specific timestamps
        if (newStatus === "preparing") {
          updates["timestamps/preparationStarted"] = new Date().toISOString();
        } else if (newStatus === "ready") {
          updates["timestamps/readyTime"] = new Date().toISOString();
        } else if (newStatus === "completed") {
          updates["timestamps/completedTime"] = new Date().toISOString();
          updates["customerInfo/servingStatus"] = "served";
        } else if (newStatus === "rejected") {
          updates["timestamps/rejectedTime"] = new Date().toISOString();
          updates["kitchen/rejectionReason"] =
            additionalData.rejectionReason || "No reason provided";
        }

        await update(orderRef, updates);
      } catch (error) {
        console.error("Error updating order status:", error);
        alert("Failed to update order status. Please try again.");
      }
    },
    [hotelName]
  );

  const handleStatusChange = useCallback(
    (orderId, newStatus, additionalData = {}) => {
      updateOrderStatus(orderId, newStatus, additionalData);
    },
    [updateOrderStatus]
  );

  const handleViewDetails = useCallback((order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  }, []);

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  const handleTimePeriodChange = useCallback((period) => {
    setSelectedTimePeriod(period);
    // Reset to today's date when switching to daily view
    if (period === "daily") {
      setSelectedDate(new Date().toISOString().split("T")[0]);
    }
  }, []);

  // Get period display text
  const getPeriodDisplayText = () => {
    switch (selectedTimePeriod) {
      case "daily":
        return `Orders for ${selectedDate}`;
      case "weekly":
        const weekRange = getCurrentWeekRange();
        return `Orders for this week (${weekRange.start.toLocaleDateString()} - ${weekRange.end.toLocaleDateString()})`;
      case "monthly":
        const monthRange = getCurrentMonthRange();
        return `Orders for ${monthRange.start.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}`;
      case "total":
        return "All orders";
      default:
        return "Orders";
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading kitchen orders..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Kitchen Dashboard
              </h1>
              <p className="text-gray-600">Manage orders for {hotelName}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Date picker - only show for daily view */}
              {selectedTimePeriod === "daily" && (
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                  <Calendar size={16} className="text-gray-500" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="bg-transparent border-none focus:outline-none text-sm"
                  />
                </div>
              )}
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>

          {/* Time Period Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {[
                { key: "daily", label: "Today" },
                { key: "weekly", label: "This Week" },
                { key: "monthly", label: "This Month" },
                { key: "total", label: "All Time" },
              ].map((period) => (
                <button
                  key={period.key}
                  onClick={() => handleTimePeriodChange(period.key)}
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
            <div className="text-sm text-gray-600 font-medium">
              {getPeriodDisplayText()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <HeaderStats stats={orderStats} />

        {/* Filters */}
        <OrderFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          orderStats={orderStats}
          totalOrders={processedOrders.length}
        />

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <EmptyState activeFilter={activeFilter} />
          ) : (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
                onViewDetails={handleViewDetails}
              />
            ))
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Showing {filteredOrders.length} of {processedOrders.length} orders
          {activeFilter !== "all" && ` (${activeFilter} only)`}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={handleCloseDetails} />
      )}
    </div>
  );
};

export default KitchenAdminPage;
