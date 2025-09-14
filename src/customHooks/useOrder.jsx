// hooks/useOrderData.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { ref, onValue, update, remove } from "firebase/database";
import { db } from "../data/firebase/firebaseConfig";
import { toast } from "react-toastify";

/**
 * Enhanced hook for consistent order data management across the application
 * Provides standardized order filtering, analytics, and CRUD operations
 */
export const useOrderData = (hotelName, options = {}) => {
  const {
    includeMenuData = false,
    defaultTimePeriod = "daily",
    defaultStatusFilter = "all",
    autoRefresh = true,
    sortBy = "timestamp", // 'timestamp', 'status', 'table'
    sortOrder = "desc", // 'asc', 'desc'
  } = options;

  // Core state management
  const [orders, setOrders] = useState([]);
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Filter and view state
  const [statusFilter, setStatusFilter] = useState(defaultStatusFilter);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTimePeriod, setSelectedTimePeriod] =
    useState(defaultTimePeriod);
  const [searchTerm, setSearchTerm] = useState("");

  // Date range helper functions
  const dateRangeHelpers = useMemo(
    () => ({
      getCurrentWeekRange: () => {
        const now = new Date();
        const first = now.getDate() - now.getDay();
        const firstday = new Date(now.setDate(first));
        const lastday = new Date(firstday);
        lastday.setDate(firstday.getDate() + 6);
        return { start: firstday, end: lastday };
      },

      getCurrentMonthRange: () => {
        const now = new Date();
        const firstday = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastday = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start: firstday, end: lastday };
      },

      isDateInRange: (orderDate, startDate, endDate) => {
        const date = new Date(orderDate);
        date.setHours(0, 0, 0, 0);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
      },

      getPeriodDisplayText: (period, date) => {
        switch (period) {
          case "daily":
            return `Orders for ${new Date(date).toLocaleDateString()}`;
          case "weekly":
            const weekRange = dateRangeHelpers.getCurrentWeekRange();
            return `Orders for this week (${weekRange.start.toLocaleDateString()} - ${weekRange.end.toLocaleDateString()})`;
          case "monthly":
            const monthRange = dateRangeHelpers.getCurrentMonthRange();
            return `Orders for ${monthRange.start.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}`;
          case "total":
            return "All orders";
          default:
            return "Orders";
        }
      },
    }),
    []
  );

  // Subscribe to orders data with real-time updates
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
        try {
          const data = snapshot.val();
          if (data) {
            const ordersArray = Object.entries(data).map(([key, value]) => ({
              id: key,
              ...value,
              // Normalize status across different status fields
              normalizedStatus:
                value.kitchen?.status || value.status || "received",
              // Ensure consistent timestamp format
              orderTimestamp:
                value.timestamps?.orderPlaced ||
                value.orderTime ||
                value.createdAt,
              // Normalize table information
              tableInfo:
                value.tableNumber ||
                value.tableNo ||
                value.customerInfo?.tableNumber,
              // Calculate total items consistently
              totalItems:
                value.orderDetails?.totalItems || value.items?.length || 0,
              // Normalize pricing
              totalAmount: value.pricing?.total || value.total || 0,
            }));

            // Apply consistent sorting
            ordersArray.sort((a, b) => {
              if (sortBy === "timestamp") {
                const aTime = new Date(a.orderTimestamp || 0);
                const bTime = new Date(b.orderTimestamp || 0);
                return sortOrder === "desc" ? bTime - aTime : aTime - bTime;
              } else if (sortBy === "status") {
                return sortOrder === "desc"
                  ? b.normalizedStatus.localeCompare(a.normalizedStatus)
                  : a.normalizedStatus.localeCompare(b.normalizedStatus);
              } else if (sortBy === "table") {
                const aTable = parseInt(a.tableInfo) || 0;
                const bTable = parseInt(b.tableInfo) || 0;
                return sortOrder === "desc" ? bTable - aTable : aTable - bTable;
              }
              return 0;
            });

            setOrders(ordersArray);
            setLastUpdated(new Date().toISOString());
          } else {
            setOrders([]);
          }
        } catch (err) {
          console.error("Error processing orders:", err);
          setError(new Error("Error processing orders data"));
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Firebase orders listener error:", err);
        setError(new Error("Error connecting to orders database"));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [hotelName, sortBy, sortOrder]);

  // Subscribe to menu data if requested
  useEffect(() => {
    if (!hotelName || !includeMenuData) return;

    const menuRef = ref(db, `/hotels/${hotelName}/menu`);
    const unsubscribe = onValue(
      menuRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const menuArray = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value,
          }));
          setMenuData(menuArray);
        } else {
          setMenuData([]);
        }
      },
      (err) => console.error("Error loading menu items:", err)
    );

    return () => unsubscribe();
  }, [hotelName, includeMenuData]);

  // Filter orders by time period
  const timeFilteredOrders = useMemo(() => {
    let filtered = [...orders];

    if (selectedTimePeriod === "daily") {
      filtered = filtered.filter((order) => {
        const orderDateStr =
          order.timestamps?.orderDate ||
          new Date(order.orderTimestamp).toISOString().split("T")[0];
        return orderDateStr === selectedDate;
      });
    } else if (selectedTimePeriod === "weekly") {
      const { start, end } = dateRangeHelpers.getCurrentWeekRange();
      filtered = filtered.filter((order) => {
        const orderDate =
          order.timestamps?.orderDate ||
          new Date(order.orderTimestamp).toISOString().split("T")[0];
        return dateRangeHelpers.isDateInRange(orderDate, start, end);
      });
    } else if (selectedTimePeriod === "monthly") {
      const { start, end } = dateRangeHelpers.getCurrentMonthRange();
      filtered = filtered.filter((order) => {
        const orderDate =
          order.timestamps?.orderDate ||
          new Date(order.orderTimestamp).toISOString().split("T")[0];
        return dateRangeHelpers.isDateInRange(orderDate, start, end);
      });
    }

    return filtered;
  }, [orders, selectedTimePeriod, selectedDate, dateRangeHelpers]);

  // Apply status and search filters
  const filteredOrders = useMemo(() => {
    let filtered = [...timeFilteredOrders];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.normalizedStatus === statusFilter
      );
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber?.toString().toLowerCase().includes(searchLower) ||
          order.id.toLowerCase().includes(searchLower) ||
          order.tableInfo?.toString().toLowerCase().includes(searchLower) ||
          order.items?.some((item) =>
            item.menuName?.toLowerCase().includes(searchLower)
          )
      );
    }

    return filtered;
  }, [timeFilteredOrders, statusFilter, searchTerm]);

  // Calculate comprehensive order statistics
  const orderStats = useMemo(() => {
    const stats = {
      // Basic counts
      total: timeFilteredOrders.length,
      pending: timeFilteredOrders.filter(
        (o) =>
          o.normalizedStatus === "received" || o.normalizedStatus === "pending"
      ).length,
      preparing: timeFilteredOrders.filter(
        (o) => o.normalizedStatus === "preparing"
      ).length,
      ready: timeFilteredOrders.filter((o) => o.normalizedStatus === "ready")
        .length,
      completed: timeFilteredOrders.filter(
        (o) => o.normalizedStatus === "completed"
      ).length,
      rejected: timeFilteredOrders.filter(
        (o) => o.normalizedStatus === "rejected"
      ).length,
      served: timeFilteredOrders.filter((o) => o.normalizedStatus === "served")
        .length,
    };

    // Revenue calculations
    const completedOrders = timeFilteredOrders.filter(
      (o) => o.normalizedStatus === "completed"
    );
    stats.totalRevenue = completedOrders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );
    stats.avgOrderValue =
      completedOrders.length > 0
        ? Math.round(stats.totalRevenue / completedOrders.length)
        : 0;

    // Customer metrics
    const uniqueTables = new Set(
      timeFilteredOrders.map((o) => o.tableInfo).filter(Boolean)
    );
    stats.uniqueCustomers = uniqueTables.size;

    // Peak hour calculation
    const hourCounts = {};
    timeFilteredOrders.forEach((order) => {
      if (order.orderTimestamp) {
        const hour = new Date(order.orderTimestamp).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    const peakHour = Object.keys(hourCounts).reduce(
      (a, b) => (hourCounts[a] > hourCounts[b] ? a : b),
      "0"
    );
    stats.peakHour = peakHour !== "0" ? `${peakHour}:00` : "N/A";

    return stats;
  }, [timeFilteredOrders]);

  // Calculate menu analytics
  const menuAnalytics = useMemo(() => {
    const menuStatsData = {};
    let totalMenuOrders = 0;

    timeFilteredOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const menuName = item.menuName || "Unknown Menu";
        const menuId = item.menuId || item.id;
        const key = menuId || menuName;

        if (!menuStatsData[key]) {
          menuStatsData[key] = {
            menuName,
            menuId,
            orderCount: 0,
            revenue: 0,
            imageUrl:
              item.imageUrl ||
              menuData.find((m) => m.id === menuId || m.menuName === menuName)
                ?.imageUrl,
            category: item.menuCategory || "Uncategorized",
          };
        }

        const quantity = item.quantity || 1;
        const itemRevenue =
          item.itemTotal || item.finalPrice || item.originalPrice || 0;

        menuStatsData[key].orderCount += quantity;
        menuStatsData[key].revenue += itemRevenue * quantity;
        totalMenuOrders += quantity;
      });
    });

    const menuStats = Object.values(menuStatsData)
      .map((data) => ({
        ...data,
        percentage:
          totalMenuOrders > 0 ? (data.orderCount / totalMenuOrders) * 100 : 0,
      }))
      .sort((a, b) => b.orderCount - a.orderCount);

    return {
      menuStats: menuStats.slice(0, 10), // Top 10
      topMenus: menuStats.slice(0, 3), // Top 3
      totalMenuOrders,
    };
  }, [timeFilteredOrders, menuData]);

  // Calculate category analytics
  const categoryAnalytics = useMemo(() => {
    const categoryData = {};
    let totalCategoryOrders = 0;

    timeFilteredOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const category = item.menuCategory || "Uncategorized";

        if (!categoryData[category]) {
          categoryData[category] = { orderCount: 0, revenue: 0 };
        }

        const quantity = item.quantity || 1;
        const itemRevenue =
          item.itemTotal || item.finalPrice || item.originalPrice || 0;

        categoryData[category].orderCount += quantity;
        categoryData[category].revenue += itemRevenue * quantity;
        totalCategoryOrders += quantity;
      });
    });

    const categoryStats = Object.entries(categoryData)
      .map(([category, data]) => ({
        category,
        orderCount: data.orderCount,
        revenue: data.revenue,
        percentage:
          totalCategoryOrders > 0
            ? (data.orderCount / totalCategoryOrders) * 100
            : 0,
      }))
      .sort((a, b) => b.orderCount - a.orderCount);

    return { categoryStats, totalCategoryOrders };
  }, [timeFilteredOrders]);

  // Order management functions
  const updateOrderStatus = useCallback(
    async (orderId, newStatus, additionalData = {}) => {
      if (submitting) return { success: false, error: "Update in progress" };

      setSubmitting(true);
      try {
        const orderRef = ref(db, `/hotels/${hotelName}/orders/${orderId}`);
        const now = new Date().toISOString();

        const updates = {
          "kitchen/status": newStatus,
          "kitchen/lastUpdated": now,
          status: newStatus, // Also update main status for consistency
          "timestamps/lastStatusUpdate": now,
          ...additionalData,
        };

        // Add status-specific timestamps
        const statusTimestamps = {
          preparing: "preparingTime",
          ready: "readyTime",
          completed: "completedTime",
          served: "servedTime",
          rejected: "rejectedTime",
        };

        if (statusTimestamps[newStatus]) {
          updates[`timestamps/${statusTimestamps[newStatus]}`] = now;
        }

        await update(orderRef, updates);
        toast.success(`Order status updated to ${newStatus}`);
        return { success: true };
      } catch (err) {
        console.error("Error updating order status:", err);
        toast.error("Failed to update order status");
        return { success: false, error: err.message };
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  const deleteOrder = useCallback(
    async (orderId) => {
      if (submitting) return { success: false, error: "Operation in progress" };

      setSubmitting(true);
      try {
        const orderRef = ref(db, `/hotels/${hotelName}/orders/${orderId}`);
        await remove(orderRef);
        toast.success("Order deleted successfully");
        return { success: true };
      } catch (err) {
        console.error("Error deleting order:", err);
        toast.error("Failed to delete order");
        return { success: false, error: err.message };
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  const updateOrder = useCallback(
    async (orderId, orderData) => {
      if (submitting) return { success: false, error: "Update in progress" };

      setSubmitting(true);
      try {
        const orderRef = ref(db, `/hotels/${hotelName}/orders/${orderId}`);
        const now = new Date().toISOString();

        const updates = {
          ...orderData,
          "timestamps/lastModified": now,
        };

        await update(orderRef, updates);
        toast.success("Order updated successfully");
        return { success: true };
      } catch (err) {
        console.error("Error updating order:", err);
        toast.error("Failed to update order");
        return { success: false, error: err.message };
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  // Filter and search handlers
  const handleStatusFilterChange = useCallback((filter) => {
    setStatusFilter(filter);
  }, []);

  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const handleDateChange = useCallback(
    (date) => {
      setSelectedDate(date);
      if (selectedTimePeriod !== "daily") {
        setSelectedTimePeriod("daily");
      }
    },
    [selectedTimePeriod]
  );

  const handleTimePeriodChange = useCallback((period) => {
    setSelectedTimePeriod(period);
    if (period === "daily") {
      setSelectedDate(new Date().toISOString().split("T")[0]);
    }
  }, []);

  const clearFilters = useCallback(() => {
    setStatusFilter("all");
    setSearchTerm("");
  }, []);

  const refreshOrders = useCallback(() => {
    setError(null);
    // Real-time subscription will handle the refresh
  }, []);

  return {
    // Data
    orders,
    filteredOrders,
    timeFilteredOrders,
    menuData,

    // Analytics
    orderStats,
    menuAnalytics,
    categoryAnalytics,

    // State
    loading,
    submitting,
    error,
    lastUpdated,

    // Filters
    statusFilter,
    searchTerm,
    selectedDate,
    selectedTimePeriod,

    // Actions
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    handleStatusFilterChange,
    handleSearchChange,
    handleDateChange,
    handleTimePeriodChange,
    clearFilters,
    refreshOrders,

    // Utilities
    dateRangeHelpers,

    // Computed values
    hasOrders: orders.length > 0,
    hasFilteredOrders: filteredOrders.length > 0,
    totalOrders: orders.length,
    filteredOrdersCount: filteredOrders.length,
    periodDisplayText: dateRangeHelpers.getPeriodDisplayText(
      selectedTimePeriod,
      selectedDate
    ),
  };
};
