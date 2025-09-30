// useOrder_optimized.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { ref, onValue, update, remove, get } from "firebase/database";
import { rtdb } from "../services/firebase/firebaseConfig";
import { toast } from "react-toastify";

export const useOrder = (hotelName, options = {}) => {
  const {
    includeMenuData = false,
    defaultTimePeriod = "daily",
    defaultStatusFilter = "all",
    sortBy = "timestamp",
    sortOrder = "desc",
  } = options;

  // STATES
  const [orders, setOrders] = useState([]);
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  // Filter state
  const [statusFilter, setStatusFilter] = useState(defaultStatusFilter);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTimePeriod, setSelectedTimePeriod] =
    useState(defaultTimePeriod);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounced search for performance
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoize normalization function to stabilize and avoid unneeded re-renders
  const normalizeOrderData = useCallback((rawData) => {
    if (!rawData) return [];
    return Object.entries(rawData).map(([key, value]) => {
      const orderTimestamp =
        value.timestamps?.orderPlaced ||
        value.orderTime ||
        value.createdAt ||
        value.timestamp ||
        value.orderTimestamp ||
        Date.now();
      const normalizedTimestamp = new Date(orderTimestamp).toISOString();

      let normalizedStatus =
        value.kitchen?.status ||
        value.status ||
        value.orderStatus ||
        "received";

      const statusMapping = {
        new: "received",
        pending: "received",
        placed: "received",
        received: "received",
        accepted: "received",
        preparing: "received",
        cooking: "received",
        in_progress: "received",
        ready: "received",
        finished: "received",
        done: "received",
        delivered: "completed",
        completed: "completed",
        complete: "completed",
        served: "completed",
        cancelled: "rejected",
        canceled: "rejected",
        rejected: "rejected",
      };
      normalizedStatus =
        statusMapping[normalizedStatus?.toLowerCase()] ||
        normalizedStatus?.toLowerCase();

      const tableInfo =
        value.tableNumber ||
        value.tableNo ||
        value.customerInfo?.tableNumber ||
        value.table ||
        value.customerInfo?.table ||
        "0";

      const items = (value.items || value.menuItems || []).map((item, idx) => {
        const itemPrice =
          parseFloat(item.itemTotal) ||
          parseFloat(item.finalPrice) ||
          parseFloat(item.price) ||
          parseFloat(item.originalPrice) ||
          0;
        const quantity = parseInt(item.quantity) || 1;
        const totalPrice = itemPrice * quantity;
        return {
          id: item.id || item.menuId || `item-${idx}`,
          menuId: item.menuId || item.id,
          menuName: item.menuName || item.name || "Unknown Item",
          menuCategory: item.menuCategory || item.category || "Uncategorized",
          quantity,
          price:
            parseFloat(item.price) ||
            parseFloat(item.originalPrice) ||
            itemPrice,
          originalPrice:
            parseFloat(item.originalPrice) ||
            parseFloat(item.price) ||
            itemPrice,
          finalPrice: itemPrice,
          itemTotal: totalPrice,
          imageUrl: item.imageUrl || null,
          notes: item.notes || item.specialInstructions || "",
          ...item,
        };
      });

      const calculatedTotal = items.reduce((sum, i) => sum + i.itemTotal, 0);
      const totalAmount =
        parseFloat(value.pricing?.total) ||
        parseFloat(value.total) ||
        parseFloat(value.orderDetails?.total) ||
        parseFloat(value.totalPrice) ||
        calculatedTotal ||
        0;

      const orderNumber = value.orderNumber || value.orderNo || value.id || key;
      const orderDate = new Date(normalizedTimestamp)
        .toISOString()
        .split("T")[0];
      const timestamps = {
        orderPlaced: normalizedTimestamp,
        orderDate,
        lastUpdated: value.timestamps?.lastUpdated || normalizedTimestamp,
        lastStatusUpdate: value.timestamps?.lastStatusUpdate || null,
        completedTime: value.timestamps?.completedTime || null,
        rejectedTime: value.timestamps?.rejectedTime || null,
        ...value.timestamps,
      };

      return {
        id: key,
        orderNumber,
        status: normalizedStatus,
        normalizedStatus,
        orderTimestamp: normalizedTimestamp,
        orderDate,
        timestamps,
        tableInfo: tableInfo.toString(),
        tableNumber: tableInfo.toString(),
        customerInfo: {
          tableNumber: tableInfo.toString(),
          customerName:
            value.customerInfo?.customerName || value.customerName || "",
          phoneNumber:
            value.customerInfo?.phoneNumber || value.phoneNumber || "",
          ...value.customerInfo,
        },
        items,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        total: parseFloat(totalAmount.toFixed(2)),
        totalItems: items.length,
        orderDetails: {
          total: parseFloat(totalAmount.toFixed(2)),
          totalItems: items.length,
          subtotal: parseFloat(value.orderDetails?.subtotal || totalAmount),
          tax: parseFloat(value.orderDetails?.tax || 0),
          discount: parseFloat(value.orderDetails?.discount || 0),
          ...value.orderDetails,
        },
        kitchen: {
          status: normalizedStatus,
          lastUpdated: timestamps.lastUpdated,
          estimatedTime: value.kitchen?.estimatedTime || null,
          notes: value.kitchen?.notes || "",
          ...value.kitchen,
        },
        ...value,
        displayOrderNumber: `#${orderNumber}`,
        displayTable: `Table ${tableInfo}`,
        displayStatus:
          normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1),
        displayTime: new Date(normalizedTimestamp).toLocaleString(),
        displayDate: new Date(normalizedTimestamp).toLocaleDateString(),
        displayAmount: `₹${parseFloat(
          totalAmount.toFixed(2)
        ).toLocaleString()}`,
      };
    });
  }, []);

  // Memoize all range/date helpers to avoid function recreation
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

  // Real-time order subscription with error handling and retry
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

      const ordersRef = ref(rtdb, `/hotels/${hotelName}/orders`);
      unsubscribe = onValue(
        ordersRef,
        (snapshot) => {
          try {
            const data = snapshot.val();
            const normalizedOrders = normalizeOrderData(data);
            normalizedOrders.sort((a, b) => {
              if (sortBy === "timestamp") {
                const aTime = new Date(a.orderTimestamp);
                const bTime = new Date(b.orderTimestamp);
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
            setError(new Error(`Error processing orders: ${err.message}`));
            setConnectionStatus("error");
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          setError(new Error(`Database connection error: ${err.message}`));
          setConnectionStatus("error");
          setLoading(false);
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(() => connectToFirebase(), 2000 * retryCount);
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

  // RTDB menu live subscription (optional)
  useEffect(() => {
    if (!hotelName || !includeMenuData) return;
    const menuRef = ref(rtdb, `/hotels/${hotelName}/menu`);
    const unsubscribe = onValue(
      menuRef,
      (snapshot) => {
        const data = snapshot.val();
        setMenuData(
          data
            ? Object.entries(data).map(([key, val]) => ({
                id: key,
                menuId: key,
                ...val,
              }))
            : []
        );
      },
      (err) => {}
    );
    return () => unsubscribe();
  }, [hotelName, includeMenuData]);

  // Memoize filter/sort logic for large lists
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

  const filteredOrders = useMemo(() => {
    let filtered = [...timeFilteredOrders];
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.normalizedStatus === statusFilter
      );
    }
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber?.toString().toLowerCase().includes(searchLower) ||
          order.id.toLowerCase().includes(searchLower) ||
          order.tableInfo?.toString().toLowerCase().includes(searchLower) ||
          order.customerInfo?.customerName
            ?.toLowerCase()
            .includes(searchLower) ||
          order.customerInfo?.phoneNumber
            ?.toLowerCase()
            .includes(searchLower) ||
          order.items?.some((item) =>
            item.menuName?.toLowerCase().includes(searchLower)
          ) ||
          order.normalizedStatus.toLowerCase().includes(searchLower)
      );
    }
    return filtered;
  }, [timeFilteredOrders, statusFilter, debouncedSearchTerm]);

  // Analytics and stats are memoized
  const orderStats = useMemo(() => {
    const stats = {
      total: timeFilteredOrders.length,
      received: 0,
      completed: 0,
      rejected: 0,
    };
    timeFilteredOrders.forEach((order) => {
      if (order.normalizedStatus === "received") stats.received++;
      else if (order.normalizedStatus === "completed") stats.completed++;
      else if (order.normalizedStatus === "rejected") stats.rejected++;
    });
    const revenueOrders = timeFilteredOrders.filter((o) =>
      ["completed"].includes(o.normalizedStatus)
    );
    stats.totalRevenue = revenueOrders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );
    stats.avgOrderValue =
      revenueOrders.length > 0
        ? Math.round(stats.totalRevenue / revenueOrders.length)
        : 0;
    const uniqueTables = new Set(
      timeFilteredOrders
        .map((o) => o.tableInfo)
        .filter((table) => table && table !== "Unknown" && table !== "0")
    );
    stats.uniqueCustomers = uniqueTables.size;
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

  // Menu analytics
  const menuAnalytics = useMemo(() => {
    const menuStatsData = {};
    let totalMenuOrders = 0;
    timeFilteredOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const menuName = item.menuName || "Unknown Menu";
        const menuId = item.menuId || item.id;
        const key = `${menuId}-${menuName}`;
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
        const itemRevenue = item.itemTotal || 0;
        menuStatsData[key].orderCount += quantity;
        menuStatsData[key].revenue += itemRevenue;
        totalMenuOrders += quantity;
      });
    });
    const menuStats = Object.values(menuStatsData)
      .map((data) => ({
        ...data,
        revenue: parseFloat(data.revenue.toFixed(2)),
        percentage:
          totalMenuOrders > 0 ? (data.orderCount / totalMenuOrders) * 100 : 0,
      }))
      .sort((a, b) => b.orderCount - a.orderCount);
    return {
      menuStats: menuStats.slice(0, 20),
      topMenus: menuStats.slice(0, 3),
      totalMenuOrders,
    };
  }, [timeFilteredOrders, menuData]);

  // Category analytics
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
        const itemRevenue = item.itemTotal || 0;
        categoryData[category].orderCount += quantity;
        categoryData[category].revenue += itemRevenue;
        totalCategoryOrders += quantity;
      });
    });
    const categoryStats = Object.entries(categoryData)
      .map(([category, data]) => ({
        category,
        orderCount: data.orderCount,
        revenue: parseFloat(data.revenue.toFixed(2)),
        percentage:
          totalCategoryOrders > 0
            ? (data.orderCount / totalCategoryOrders) * 100
            : 0,
      }))
      .sort((a, b) => b.orderCount - a.orderCount);
    return { categoryStats, totalCategoryOrders };
  }, [timeFilteredOrders]);

  // Enhanced order status update, delete, update functions - all RTDB compatible
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
        const orderRef = ref(rtdb, `/hotels/${hotelName}/orders/${orderId}`);
        const now = new Date().toISOString();
        const orderSnapshot = await get(orderRef);
        if (!orderSnapshot.exists()) throw new Error("Order not found");
        const statusMapping = {
          received: "received",
          completed: "completed",
          rejected: "rejected",
        };
        const normalizedNewStatus =
          statusMapping[newStatus.toLowerCase()] || newStatus.toLowerCase();
        const updates = {
          "kitchen/status": normalizedNewStatus,
          "kitchen/lastUpdated": now,
          status: normalizedNewStatus,
          "timestamps/lastStatusUpdate": now,
          "timestamps/lastUpdated": now,
        };
        Object.keys(additionalData).forEach((key) => {
          if (key !== "kitchen" && key !== "timestamps")
            updates[key] = additionalData[key];
        });
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
        if (normalizedNewStatus === "completed") {
          updates[`timestamps/completedTime`] = now;
        } else if (normalizedNewStatus === "rejected") {
          updates[`timestamps/rejectedTime`] = now;
        }
        await update(orderRef, updates);
        toast.success(`Order status updated to ${normalizedNewStatus}`);
        return { success: true, newStatus: normalizedNewStatus };
      } catch (err) {
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
        const orderRef = ref(rtdb, `/hotels/${hotelName}/orders/${orderId}`);
        const orderSnapshot = await get(orderRef);
        if (!orderSnapshot.exists()) throw new Error("Order not found");
        await remove(orderRef);
        toast.success("Order deleted successfully");
        return { success: true };
      } catch (err) {
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
        const orderRef = ref(rtdb, `/hotels/${hotelName}/orders/${orderId}`);
        const orderSnapshot = await get(orderRef);
        if (!orderSnapshot.exists()) throw new Error("Order not found");
        const currentOrder = orderSnapshot.val();
        const now = new Date().toISOString();
        const updatedItems = orderData.items || currentOrder.items || [];
        const calculatedTotal = updatedItems.reduce(
          (sum, item) =>
            sum +
            (parseFloat(item.itemTotal) ||
              parseFloat(item.finalPrice) ||
              parseFloat(item.price) ||
              0) *
              (parseInt(item.quantity) || 1),
          0
        );
        const updates = {};
        Object.keys(orderData).forEach((key) => {
          if (
            key !== "kitchen" &&
            key !== "timestamps" &&
            key !== "orderDetails"
          ) {
            updates[key] = orderData[key];
          }
        });
        if (orderData.kitchen) {
          Object.keys(orderData.kitchen).forEach((kitchenKey) => {
            updates[`kitchen/${kitchenKey}`] = orderData.kitchen[kitchenKey];
          });
        }
        const newStatus =
          orderData.status ||
          orderData.normalizedStatus ||
          currentOrder.kitchen?.status ||
          currentOrder.status ||
          "received";
        updates["kitchen/status"] = newStatus;
        updates["kitchen/lastUpdated"] = now;
        if (orderData.timestamps) {
          Object.keys(orderData.timestamps).forEach((timestampKey) => {
            updates[`timestamps/${timestampKey}`] =
              orderData.timestamps[timestampKey];
          });
        }
        updates["timestamps/lastModified"] = now;
        updates["timestamps/lastUpdated"] = now;
        if (orderData.orderDetails) {
          Object.keys(orderData.orderDetails).forEach((detailKey) => {
            updates[`orderDetails/${detailKey}`] =
              orderData.orderDetails[detailKey];
          });
        }
        if (orderData.items) {
          updates["orderDetails/totalItems"] = updatedItems.length;
          updates.totalAmount = parseFloat(calculatedTotal.toFixed(2));
          updates.total = parseFloat(calculatedTotal.toFixed(2));
        }
        updates.status = newStatus;
        updates.id = orderId;
        await update(orderRef, updates);
        toast.success("Order updated successfully");
        return { success: true };
      } catch (err) {
        toast.error(`Failed to update order: ${err.message}`);
        return { success: false, error: err.message };
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  // Filter and search handlers, all memoized
  const handleStatusFilterChange = useCallback((filter) => {
    if (typeof filter === "string") setStatusFilter(filter);
  }, []);
  const handleSearchChange = useCallback((term) => {
    if (typeof term === "string") setSearchTerm(term);
  }, []);
  const handleDateChange = useCallback(
    (date) => {
      if (date && typeof date === "string") {
        setSelectedDate(date);
        if (selectedTimePeriod !== "daily") setSelectedTimePeriod("daily");
      }
    },
    [selectedTimePeriod]
  );
  const handleTimePeriodChange = useCallback((period) => {
    if (period && typeof period === "string") {
      setSelectedTimePeriod(period);
      if (period === "daily")
        setSelectedDate(new Date().toISOString().split("T")[0]);
    }
  }, []);
  const clearFilters = useCallback(() => {
    setStatusFilter("all");
    setSearchTerm("");
    setDebouncedSearchTerm("");
  }, []);
  const refreshOrders = useCallback(() => {
    setError(null);
    if (connectionStatus === "error") setConnectionStatus("connecting");
  }, [connectionStatus]);

  // Helper functions, memoized
  const getOrderById = useCallback(
    (orderId) => {
      return orders.find((order) => order.id === orderId) || null;
    },
    [orders]
  );
  const getOrdersByStatus = useCallback(
    (status) => {
      return orders.filter((order) => order.normalizedStatus === status);
    },
    [orders]
  );
  const getOrdersByTable = useCallback(
    (tableNumber) => {
      return orders.filter(
        (order) => order.tableInfo === tableNumber.toString()
      );
    },
    [orders]
  );

  // Today's stats
  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayOrders = orders.filter((order) => order.orderDate === today);
    return {
      total: todayOrders.length,
      revenue: todayOrders
        .filter((o) => ["completed"].includes(o.normalizedStatus))
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      received: todayOrders.filter((o) => o.normalizedStatus === "received")
        .length,
      completed: todayOrders.filter((o) => o.normalizedStatus === "completed")
        .length,
      rejected: todayOrders.filter((o) => o.normalizedStatus === "rejected")
        .length,
    };
  }, [orders]);

  // Export CSV helper
  const exportOrdersCSV = useCallback(() => {
    if (!filteredOrders.length) {
      toast.warning("No orders to export");
      return;
    }
    const csvData = filteredOrders.map((order) => ({
      OrderNumber: order.orderNumber,
      Date: order.displayDate,
      Time: order.displayTime,
      Table: order.tableInfo,
      CustomerName: order.customerInfo?.customerName || "",
      Status: order.displayStatus,
      Items:
        order.items
          ?.map((item) => `${item.menuName} (${item.quantity})`)
          .join("; ") || "",
      TotalAmount: order.totalAmount,
      Phone: order.customerInfo?.phoneNumber || "",
    }));
    const csvContent = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `orders_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Orders exported successfully");
  }, [filteredOrders]);

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
    todayStats,

    // Status and state
    loading,
    submitting,
    error,
    lastUpdated,
    connectionStatus,

    // Filter state
    statusFilter,
    selectedDate,
    selectedTimePeriod,
    searchTerm,
    debouncedSearchTerm,

    // Handlers
    handleStatusFilterChange,
    handleSearchChange,
    handleDateChange,
    handleTimePeriodChange,
    clearFilters,

    // Actions
    updateOrderStatus,
    deleteOrder,
    updateOrder,
    refreshOrders,
    exportOrdersCSV,

    // Helper functions
    getOrderById,
    getOrdersByStatus,
    getOrdersByTable,
    dateRangeHelpers,

    statusOptions: [
      { value: "all", label: "All Orders" },
      { value: "received", label: "Received" },
      { value: "completed", label: "Completed" },
      { value: "rejected", label: "Rejected" },
    ],
    timePeriodOptions: [
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
      { value: "total", label: "All Time" },
    ],
    periodDisplayText: dateRangeHelpers.getPeriodDisplayText(
      selectedTimePeriod,
      selectedDate
    ),
    hasOrders: orders.length > 0,
    hasFilteredOrders: filteredOrders.length > 0,
    isConnected: connectionStatus === "connected",
    isLoading: loading,
    isError: !!error,
    errorMessage: error?.message || null,
  };
};
