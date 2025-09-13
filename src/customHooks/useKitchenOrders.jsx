import { useState, useEffect, useCallback, useMemo } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "../data/firebase/firebaseConfig";

export const useKitchenOrders = (hotelName) => {
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("daily");

  // Helper functions for date ranges
  const getCurrentWeekRange = useCallback(() => {
    const now = new Date();
    const first = now.getDate() - now.getDay(); // First day is Sunday
    const firstday = new Date(now.setDate(first));
    const lastday = new Date(firstday);
    lastday.setDate(firstday.getDate() + 6);
    return { start: firstday, end: lastday };
  }, []);

  const getCurrentMonthRange = useCallback(() => {
    const now = new Date();
    const firstday = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastday = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: firstday, end: lastday };
  }, []);

  const isDateInRange = useCallback((orderDate, startDate, endDate) => {
    const date = new Date(orderDate);
    date.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return date >= start && date <= end;
  }, []);

  // Subscribe to orders data
  useEffect(() => {
    if (!hotelName) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const ordersRef = ref(db, `/hotels/${hotelName}/orders`);
    const unsubscribe = onValue(
      ordersRef,
      (snapshot) => {
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
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setError(error);
        setLoading(false);
      }
    );

    // Handle potential connection errors
    const errorTimeout = setTimeout(() => {
      if (loading) {
        setError(new Error("Taking longer than expected to load orders"));
        setLoading(false);
      }
    }, 10000);

    // Cleanup subscription on component unmount or hotelName change
    return () => {
      unsubscribe();
      clearTimeout(errorTimeout);
    };
  }, [hotelName]);

  // Filter orders based on time period
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
  }, [
    orders,
    selectedDate,
    selectedTimePeriod,
    getCurrentWeekRange,
    getCurrentMonthRange,
    isDateInRange,
  ]);

  // Filter processed orders by status
  const filteredOrders = useMemo(() => {
    if (activeFilter === "all") {
      return processedOrders;
    }

    return processedOrders.filter((order) => {
      const status = order.kitchen?.status || order.status || "received";
      return status === activeFilter;
    });
  }, [processedOrders, activeFilter]);

  // Calculate stats based on processed orders
  const orderStats = useMemo(() => {
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

  // Update order status
  const updateOrderStatus = useCallback(
    async (orderId, newStatus, additionalData = {}) => {
      if (submitting) return false;

      setSubmitting(true);
      try {
        setError(null);
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
        return true;
      } catch (error) {
        console.error("Error updating order status:", error);
        setError(error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  // Handle status change
  const handleStatusChange = useCallback(
    async (orderId, newStatus, additionalData = {}) => {
      const success = await updateOrderStatus(
        orderId,
        newStatus,
        additionalData
      );
      if (!success) {
        alert("Failed to update order status. Please try again.");
      }
    },
    [updateOrderStatus]
  );

  // Handle filter change
  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
  }, []);

  // Handle date change
  const handleDateChange = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  // Handle time period change
  const handleTimePeriodChange = useCallback((period) => {
    setSelectedTimePeriod(period);
    // Reset to today's date when switching to daily view
    if (period === "daily") {
      setSelectedDate(new Date().toISOString().split("T")[0]);
    }
  }, []);

  // Refresh orders data
  const refreshOrders = useCallback(() => {
    setError(null);
    // The real-time subscription will automatically refresh the data
  }, []);

  // Get period display text
  const getPeriodDisplayText = useCallback(() => {
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
  }, [
    selectedTimePeriod,
    selectedDate,
    getCurrentWeekRange,
    getCurrentMonthRange,
  ]);

  return {
    // State
    orders,
    processedOrders,
    filteredOrders,
    loading,
    submitting,
    error,
    activeFilter,
    selectedDate,
    selectedTimePeriod,
    orderStats,

    // Actions
    updateOrderStatus,
    handleStatusChange,
    handleFilterChange,
    handleDateChange,
    handleTimePeriodChange,
    refreshOrders,

    // Utilities
    getPeriodDisplayText,
    getCurrentWeekRange,
    getCurrentMonthRange,

    // Computed values
    totalOrders: orders.length,
    processedOrdersCount: processedOrders.length,
    filteredOrdersCount: filteredOrders.length,
    hasOrders: orders.length > 0,
    hasFilteredOrders: filteredOrders.length > 0,

    // Direct setters (if needed for specific cases)
    setActiveFilter,
    setSelectedDate,
    setSelectedTimePeriod,
    setError,
  };
};
