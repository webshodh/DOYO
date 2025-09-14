// hooks/useOrderData.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { ref, onValue, update, remove, get } from "firebase/database";
import { db } from "../data/firebase/firebaseConfig";
import { toast } from "react-toastify";

/**
 * Enhanced hook for consistent order data management across the application
 * Compatible with AdminDashboard, CaptainDashboard, and MyOrders pages
 */
export const useOrderData = (hotelName, options = {}) => {
  const {
    includeMenuData = false,
    defaultTimePeriod = "daily",
    defaultStatusFilter = "all",
    sortBy = "timestamp",
    sortOrder = "desc",
  } = options;

  // Core state management
  const [orders, setOrders] = useState([]);
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  // Filter and view state
  const [statusFilter, setStatusFilter] = useState(defaultStatusFilter);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTimePeriod, setSelectedTimePeriod] =
    useState(defaultTimePeriod);
  const [searchTerm, setSearchTerm] = useState("");

  // Performance optimization - debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Enhanced data normalization function
  const normalizeOrderData = useCallback((rawData) => {
    if (!rawData) return [];

    return Object.entries(rawData).map(([key, value]) => {
      // Handle different timestamp formats
      const orderTimestamp =
        value.timestamps?.orderPlaced ||
        value.orderTime ||
        value.createdAt ||
        value.timestamp ||
        value.orderTimestamp ||
        new Date().toISOString();

      // Normalize status with fallbacks
      const normalizedStatus =
        value.kitchen?.status ||
        value.status ||
        value.orderStatus ||
        "received";

      // Handle table information consistently
      const tableInfo =
        value.tableNumber ||
        value.tableNo ||
        value.customerInfo?.tableNumber ||
        value.table ||
        value.customerInfo?.table ||
        "Unknown";

      // Calculate totals consistently
      const items = value.items || value.menuItems || [];
      const calculatedTotal = items.reduce((sum, item) => {
        const itemPrice =
          item.itemTotal ||
          item.finalPrice ||
          item.price ||
          item.originalPrice ||
          0;
        const quantity = item.quantity || 1;
        return sum + itemPrice * quantity;
      }, 0);

      const totalAmount =
        value.pricing?.total ||
        value.total ||
        value.orderDetails?.total ||
        value.totalPrice ||
        calculatedTotal ||
        0;

      // Generate consistent order number
      const orderNumber = value.orderNumber || value.orderNo || value.id || key;

      // Calculate order date from timestamp
      const orderDate = orderTimestamp
        ? new Date(orderTimestamp).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      return {
        // Core identifiers
        id: key,
        orderNumber,

        // Status information
        status: normalizedStatus,
        normalizedStatus,

        // Timing information
        orderTimestamp,
        orderDate,
        timestamps: {
          orderPlaced: orderTimestamp,
          orderDate,
          lastUpdated:
            value.timestamps?.lastUpdated || new Date().toISOString(),
          lastStatusUpdate: value.timestamps?.lastStatusUpdate,
          preparingTime: value.timestamps?.preparingTime,
          readyTime: value.timestamps?.readyTime,
          completedTime: value.timestamps?.completedTime,
          servedTime: value.timestamps?.servedTime,
          rejectedTime: value.timestamps?.rejectedTime,
          ...value.timestamps,
        },

        // Customer information
        tableInfo,
        tableNumber: tableInfo,
        customerInfo: {
          tableNumber: tableInfo,
          customerName: value.customerInfo?.customerName || value.customerName,
          phoneNumber: value.customerInfo?.phoneNumber || value.phoneNumber,
          ...value.customerInfo,
        },

        // Order details with enhanced normalization
        items: items.map((item) => ({
          id: item.id || item.menuId,
          menuId: item.menuId || item.id,
          menuName: item.menuName || item.name,
          menuCategory: item.menuCategory || item.category || "Uncategorized",
          quantity: item.quantity || 1,
          price: item.price || item.originalPrice || 0,
          originalPrice: item.originalPrice || item.price || 0,
          finalPrice: item.finalPrice || item.itemTotal || item.price || 0,
          itemTotal:
            item.itemTotal ||
            item.finalPrice ||
            item.price * (item.quantity || 1) ||
            0,
          imageUrl: item.imageUrl,
          notes: item.notes || item.specialInstructions,
          ...item,
        })),

        // Financial information
        totalAmount,
        total: totalAmount,
        totalItems: items.length,

        // Order details structure
        orderDetails: {
          total: totalAmount,
          totalItems: items.length,
          subtotal: value.orderDetails?.subtotal || totalAmount,
          tax: value.orderDetails?.tax || 0,
          discount: value.orderDetails?.discount || 0,
          ...value.orderDetails,
        },

        // Kitchen information
        kitchen: {
          status: normalizedStatus,
          lastUpdated: new Date().toISOString(),
          estimatedTime: value.kitchen?.estimatedTime,
          notes: value.kitchen?.notes,
          ...value.kitchen,
        },

        // Preserve original data
        ...value,

        // Computed fields for UI
        displayOrderNumber: `#${orderNumber}`,
        displayTable: `Table ${tableInfo}`,
        displayStatus:
          normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1),
        displayTime: new Date(orderTimestamp).toLocaleString(),
        displayDate: new Date(orderTimestamp).toLocaleDateString(),
        displayAmount: `₹${totalAmount.toFixed(2)}`,
      };
    });
  }, []);

  // Date range helper functions
  const dateRangeHelpers = useMemo(
    () => ({
      getCurrentWeekRange: () => {
        const now = new Date();
        const first = now.getDate() - now.getDay();
        const firstday = new Date(now.setDate(first));
        const lastday = new Date(firstday);
        lastday.setDate(firstday.getDate() + 6);
        firstday.setHours(0, 0, 0, 0);
        lastday.setHours(23, 59, 59, 999);
        return { start: firstday, end: lastday };
      },

      getCurrentMonthRange: () => {
        const now = new Date();
        const firstday = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastday = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        firstday.setHours(0, 0, 0, 0);
        lastday.setHours(23, 59, 59, 999);
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

  // Subscribe to orders data with enhanced error handling
  useEffect(() => {
    if (!hotelName) {
      setOrders([]);
      setLoading(false);
      setConnectionStatus("disconnected");
      return;
    }

    let unsubscribe = () => {};
    let retryCount = 0;
    const maxRetries = 3;

    const connectToFirebase = () => {
      setLoading(true);
      setError(null);
      setConnectionStatus("connecting");

      const ordersRef = ref(db, `/hotels/${hotelName}/orders`);

      unsubscribe = onValue(
        ordersRef,
        (snapshot) => {
          try {
            const data = snapshot.val();
            const normalizedOrders = normalizeOrderData(data);

            // Apply sorting
            normalizedOrders.sort((a, b) => {
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
              } else if (sortBy === "orderNumber") {
                const aNum = parseInt(a.orderNumber) || 0;
                const bNum = parseInt(b.orderNumber) || 0;
                return sortOrder === "desc" ? bNum - aNum : aNum - bNum;
              }
              return 0;
            });

            setOrders(normalizedOrders);
            setLastUpdated(new Date().toISOString());
            setConnectionStatus("connected");
            setError(null);
            retryCount = 0;
          } catch (err) {
            console.error("Error processing orders:", err);
            setError(new Error(`Error processing orders: ${err.message}`));
            setConnectionStatus("error");
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.error("Firebase orders listener error:", err);
          setError(new Error(`Database connection error: ${err.message}`));
          setConnectionStatus("error");
          setLoading(false);

          // Retry logic for connection failures
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(() => {
              console.log(`Retrying connection... Attempt ${retryCount}`);
              connectToFirebase();
            }, 2000 * retryCount);
          }
        }
      );
    };

    connectToFirebase();

    return () => {
      unsubscribe();
      setConnectionStatus("disconnected");
    };
  }, [hotelName, sortBy, sortOrder, normalizeOrderData]);

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
            menuId: key,
            ...value,
          }));
          setMenuData(menuArray);
        } else {
          setMenuData([]);
        }
      },
      (err) => {
        console.error("Error loading menu items:", err);
      }
    );

    return () => unsubscribe();
  }, [hotelName, includeMenuData]);

  // Filter orders by time period
  const timeFilteredOrders = useMemo(() => {
    if (!orders.length) return [];

    let filtered = [...orders];

    if (selectedTimePeriod === "daily") {
      filtered = filtered.filter((order) => order.orderDate === selectedDate);
    } else if (selectedTimePeriod === "weekly") {
      const { start, end } = dateRangeHelpers.getCurrentWeekRange();
      filtered = filtered.filter((order) =>
        dateRangeHelpers.isDateInRange(order.orderDate, start, end)
      );
    } else if (selectedTimePeriod === "monthly") {
      const { start, end } = dateRangeHelpers.getCurrentMonthRange();
      filtered = filtered.filter((order) =>
        dateRangeHelpers.isDateInRange(order.orderDate, start, end)
      );
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

    // Search filter with debouncing
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter((order) => {
        return (
          order.orderNumber?.toString().toLowerCase().includes(searchLower) ||
          order.id.toLowerCase().includes(searchLower) ||
          order.tableInfo?.toString().toLowerCase().includes(searchLower) ||
          order.customerInfo?.customerName
            ?.toLowerCase()
            .includes(searchLower) ||
          order.items?.some((item) =>
            item.menuName?.toLowerCase().includes(searchLower)
          )
        );
      });
    }

    return filtered;
  }, [timeFilteredOrders, statusFilter, debouncedSearchTerm]);

  // Calculate comprehensive order statistics
  const orderStats = useMemo(() => {
    const stats = {
      total: timeFilteredOrders.length,
      pending: timeFilteredOrders.filter((o) =>
        ["received", "pending"].includes(o.normalizedStatus)
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
    const completedOrders = timeFilteredOrders.filter((o) =>
      ["completed", "served"].includes(o.normalizedStatus)
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
      timeFilteredOrders
        .map((o) => o.tableInfo)
        .filter((table) => table && table !== "Unknown")
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
        const menuName = item.menuName || item.name || "Unknown Menu";
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
            category: item.menuCategory || item.category || "Uncategorized",
          };
        }

        const quantity = item.quantity || 1;
        const itemRevenue =
          item.itemTotal || item.finalPrice || item.price || 0;

        menuStatsData[key].orderCount += quantity;
        menuStatsData[key].revenue += itemRevenue;
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
      menuStats: menuStats.slice(0, 10),
      topMenus: menuStats.slice(0, 3),
      totalMenuOrders,
    };
  }, [timeFilteredOrders, menuData]);

  // Calculate category analytics
  const categoryAnalytics = useMemo(() => {
    const categoryData = {};
    let totalCategoryOrders = 0;

    timeFilteredOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const category = item.menuCategory || item.category || "Uncategorized";

        if (!categoryData[category]) {
          categoryData[category] = { orderCount: 0, revenue: 0 };
        }

        const quantity = item.quantity || 1;
        const itemRevenue =
          item.itemTotal || item.finalPrice || item.price || 0;

        categoryData[category].orderCount += quantity;
        categoryData[category].revenue += itemRevenue;
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

  const updateOrderStatus = useCallback(
    async (orderId, newStatus, additionalData = {}) => {
      if (submitting) {
        toast.warning("Please wait, another operation is in progress");
        return { success: false, error: "Update in progress" };
      }

      if (!orderId || !newStatus) {
        toast.error("Invalid order ID or status");
        return { success: false, error: "Invalid parameters" };
      }

      setSubmitting(true);
      try {
        const orderRef = ref(db, `/hotels/${hotelName}/orders/${orderId}`);
        const now = new Date().toISOString();

        // Verify order exists first
        const orderSnapshot = await get(orderRef);
        if (!orderSnapshot.exists()) {
          throw new Error("Order not found");
        }

        const updates = {
          "kitchen/status": newStatus,
          "kitchen/lastUpdated": now,
          status: newStatus,
          "timestamps/lastStatusUpdate": now,
          "timestamps/lastUpdated": now,
        };

        // Handle additional data carefully to avoid path conflicts
        Object.keys(additionalData).forEach((key) => {
          if (key !== "kitchen" && key !== "timestamps") {
            updates[key] = additionalData[key];
          }
        });

        // Handle nested additional data
        if (additionalData.kitchen) {
          Object.keys(additionalData.kitchen).forEach((kitchenKey) => {
            updates[`kitchen/${kitchenKey}`] =
              additionalData.kitchen[kitchenKey];
          });
        }

        if (additionalData.timestamps) {
          Object.keys(additionalData.timestamps).forEach((timestampKey) => {
            updates[`timestamps/${timestampKey}`] =
              additionalData.timestamps[timestampKey];
          });
        }

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
        toast.error(`Failed to update order status: ${err.message}`);
        return { success: false, error: err.message };
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  const deleteOrder = useCallback(
    async (orderId) => {
      if (submitting) {
        toast.warning("Please wait, another operation is in progress");
        return { success: false, error: "Operation in progress" };
      }

      if (!orderId) {
        toast.error("Invalid order ID");
        return { success: false, error: "Invalid order ID" };
      }

      setSubmitting(true);
      try {
        const orderRef = ref(db, `/hotels/${hotelName}/orders/${orderId}`);

        const orderSnapshot = await get(orderRef);
        if (!orderSnapshot.exists()) {
          throw new Error("Order not found");
        }

        await remove(orderRef);
        toast.success("Order deleted successfully");
        return { success: true };
      } catch (err) {
        console.error("Error deleting order:", err);
        toast.error(`Failed to delete order: ${err.message}`);
        return { success: false, error: err.message };
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  const updateOrder = useCallback(
    async (orderId, orderData) => {
      if (submitting) {
        toast.warning("Please wait, another operation is in progress");
        return { success: false, error: "Update in progress" };
      }

      if (!orderId || !orderData) {
        toast.error("Invalid order data");
        return { success: false, error: "Invalid parameters" };
      }

      setSubmitting(true);
      try {
        const orderRef = ref(db, `/hotels/${hotelName}/orders/${orderId}`);

        const orderSnapshot = await get(orderRef);
        if (!orderSnapshot.exists()) {
          throw new Error("Order not found");
        }

        const currentOrder = orderSnapshot.val();
        const now = new Date().toISOString();

        // Calculate totals if items were updated
        const updatedItems = orderData.items || currentOrder.items || [];
        const calculatedTotal = updatedItems.reduce(
          (sum, item) =>
            sum +
            (item.itemTotal || item.finalPrice || item.price || 0) *
              (item.quantity || 1),
          0
        );

        // Prepare the updates object carefully to avoid path conflicts
        const updates = {};

        // Handle core order data (excluding nested objects that might conflict)
        Object.keys(orderData).forEach((key) => {
          if (
            key !== "kitchen" &&
            key !== "timestamps" &&
            key !== "orderDetails"
          ) {
            updates[key] = orderData[key];
          }
        });

        // Handle kitchen updates properly - flatten to avoid conflicts
        if (orderData.kitchen) {
          Object.keys(orderData.kitchen).forEach((kitchenKey) => {
            updates[`kitchen/${kitchenKey}`] = orderData.kitchen[kitchenKey];
          });
        }

        // Always update kitchen status and lastUpdated
        updates["kitchen/status"] =
          orderData.status ||
          orderData.normalizedStatus ||
          currentOrder.kitchen?.status ||
          currentOrder.status ||
          "received";
        updates["kitchen/lastUpdated"] = now;

        // Handle timestamps updates properly - flatten to avoid conflicts
        if (orderData.timestamps) {
          Object.keys(orderData.timestamps).forEach((timestampKey) => {
            updates[`timestamps/${timestampKey}`] =
              orderData.timestamps[timestampKey];
          });
        }

        // Always update core timestamps
        updates["timestamps/lastModified"] = now;
        updates["timestamps/lastUpdated"] = now;

        // Handle order details updates properly - flatten to avoid conflicts
        if (orderData.orderDetails) {
          Object.keys(orderData.orderDetails).forEach((detailKey) => {
            updates[`orderDetails/${detailKey}`] =
              orderData.orderDetails[detailKey];
          });
        }

        // Update calculated fields if items changed
        if (orderData.items) {
          updates["orderDetails/totalItems"] = updatedItems.length;
          updates.totalAmount = calculatedTotal;
          updates.total = calculatedTotal;
        }

        // Preserve essential fields
        updates.id = orderId;

        // Update main status for consistency
        updates.status =
          orderData.status ||
          orderData.normalizedStatus ||
          currentOrder.status ||
          "received";

        await update(orderRef, updates);
        toast.success("Order updated successfully");
        return { success: true };
      } catch (err) {
        console.error("Error updating order:", err);
        toast.error(`Failed to update order: ${err.message}`);
        return { success: false, error: err.message };
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  // Filter and search handlers
  const handleStatusFilterChange = useCallback((filter) => {
    if (typeof filter === "string") {
      setStatusFilter(filter);
    }
  }, []);

  const handleSearchChange = useCallback((term) => {
    if (typeof term === "string") {
      setSearchTerm(term);
    }
  }, []);

  const handleDateChange = useCallback(
    (date) => {
      if (date && typeof date === "string") {
        setSelectedDate(date);
        if (selectedTimePeriod !== "daily") {
          setSelectedTimePeriod("daily");
        }
      }
    },
    [selectedTimePeriod]
  );

  const handleTimePeriodChange = useCallback((period) => {
    if (period && typeof period === "string") {
      setSelectedTimePeriod(period);
      if (period === "daily") {
        setSelectedDate(new Date().toISOString().split("T")[0]);
      }
    }
  }, []);

  const clearFilters = useCallback(() => {
    setStatusFilter("all");
    setSearchTerm("");
    setDebouncedSearchTerm("");
  }, []);

  const refreshOrders = useCallback(() => {
    setError(null);
    if (connectionStatus === "error") {
      setConnectionStatus("connecting");
    }
  }, [connectionStatus]);

  // Return comprehensive API
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
    connectionStatus,

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

    // Status helpers
    isConnected: connectionStatus === "connected",
    isConnecting: connectionStatus === "connecting",
    hasConnectionError: connectionStatus === "error",
  };
};

export default useOrderData;
