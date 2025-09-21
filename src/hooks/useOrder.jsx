// src/hooks/useOrderData.jsx
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
// ✅ FIRESTORE IMPORTS (replacing Realtime Database)
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useHotelContext } from "../context/HotelContext";

/**
 * Enhanced hook for consistent order data management across the application
 * Compatible with AdminDashboard, CaptainDashboard, and MyOrders pages
 * Simplified to only track: received, completed, and rejected orders
 * ✅ MIGRATED TO FIRESTORE
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

  // ✅ NEW: Enhanced state management
  const [retryCount, setRetryCount] = useState(0);

  // Filter and view state
  const [statusFilter, setStatusFilter] = useState(defaultStatusFilter);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTimePeriod, setSelectedTimePeriod] =
    useState(defaultTimePeriod);
  const [searchTerm, setSearchTerm] = useState("");

  // Refs for cleanup
  const ordersUnsubscribeRef = useRef(null);
  const menuUnsubscribeRef = useRef(null);
  const errorTimeoutRef = useRef(null);

  // Context hooks
  const { currentUser } = useAuth();
  const { selectedHotel } = useHotelContext();

  // ✅ ENHANCED: Auto-use selected hotel if no hotelName provided
  const activeHotelName = hotelName || selectedHotel?.name || selectedHotel?.id;

  // Performance optimization - debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Enhanced and consistent data normalization function
  const normalizeOrderData = useCallback((querySnapshot) => {
    if (!querySnapshot || querySnapshot.empty) return [];

    return querySnapshot.docs.map((doc) => {
      const value = doc.data();
      const key = doc.id;

      // Handle different timestamp formats with better fallbacks
      const orderTimestamp =
        value.timestamps?.orderPlaced?.toDate?.() ||
        value.orderTime?.toDate?.() ||
        value.createdAt?.toDate?.() ||
        value.timestamp?.toDate?.() ||
        value.orderTimestamp?.toDate?.() ||
        new Date(
          value.timestamps?.orderPlaced ||
            value.orderTime ||
            value.createdAt ||
            value.timestamp ||
            value.orderTimestamp ||
            Date.now()
        );

      // Ensure timestamp is in ISO format
      const normalizedTimestamp = orderTimestamp.toISOString();

      // Simplified status mapping - only 3 statuses
      let normalizedStatus =
        value.kitchen?.status ||
        value.status ||
        value.orderStatus ||
        "received";

      // Standardize status names to only 3 options
      const statusMapping = {
        // All new/pending orders become "received"
        new: "received",
        pending: "received",
        placed: "received",
        received: "received",

        // All in-progress statuses become "received" (still being worked on)
        accepted: "received",
        preparing: "received",
        cooking: "received",
        in_progress: "received",
        ready: "received",
        finished: "received",
        done: "received",

        // All final successful statuses become "completed"
        delivered: "completed",
        completed: "completed",
        complete: "completed",
        served: "completed",

        // All cancelled statuses become "rejected"
        cancelled: "rejected",
        canceled: "rejected",
        rejected: "rejected",
      };

      normalizedStatus =
        statusMapping[normalizedStatus.toLowerCase()] ||
        normalizedStatus.toLowerCase();

      // Handle table information consistently
      const tableInfo =
        value.tableNumber ||
        value.tableNo ||
        value.customerInfo?.tableNumber ||
        value.table ||
        value.customerInfo?.table ||
        "0";

      // Normalize items array with consistent structure
      const items = (value.items || value.menuItems || []).map(
        (item, index) => {
          const itemPrice =
            parseFloat(item.itemTotal) ||
            parseFloat(item.finalPrice) ||
            parseFloat(item.price) ||
            parseFloat(item.originalPrice) ||
            0;

          const quantity = parseInt(item.quantity) || 1;
          const totalPrice = itemPrice * quantity;

          return {
            id: item.id || item.menuId || `item-${index}`,
            menuId: item.menuId || item.id,
            menuName: item.menuName || item.name || "Unknown Item",
            menuCategory: item.menuCategory || item.category || "Uncategorized",
            quantity: quantity,
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
            // Preserve any additional item properties
            ...item,
          };
        }
      );

      // Calculate totals consistently
      const calculatedTotal = items.reduce(
        (sum, item) => sum + item.itemTotal,
        0
      );
      const totalAmount =
        parseFloat(value.pricing?.total) ||
        parseFloat(value.total) ||
        parseFloat(value.orderDetails?.total) ||
        parseFloat(value.totalPrice) ||
        calculatedTotal ||
        0;

      // Generate consistent order number
      const orderNumber = value.orderNumber || value.orderNo || value.id || key;

      // Calculate order date from timestamp
      const orderDate = new Date(normalizedTimestamp)
        .toISOString()
        .split("T")[0];

      // Create comprehensive timestamps object
      const timestamps = {
        orderPlaced: normalizedTimestamp,
        orderDate,
        lastUpdated:
          value.timestamps?.lastUpdated?.toDate?.()?.toISOString() ||
          normalizedTimestamp,
        lastStatusUpdate:
          value.timestamps?.lastStatusUpdate?.toDate?.()?.toISOString() || null,
        completedTime:
          value.timestamps?.completedTime?.toDate?.()?.toISOString() || null,
        rejectedTime:
          value.timestamps?.rejectedTime?.toDate?.()?.toISOString() || null,
        // Preserve any additional timestamps (converting Firestore timestamps)
        ...Object.keys(value.timestamps || {}).reduce((acc, key) => {
          const timestamp = value.timestamps[key];
          acc[key] = timestamp?.toDate?.()?.toISOString() || timestamp;
          return acc;
        }, {}),
      };

      // Build comprehensive normalized order object
      const normalizedOrder = {
        // Core identifiers
        id: key,
        orderNumber,

        // Status information (consistent across all components)
        status: normalizedStatus,
        normalizedStatus,

        // Timing information
        orderTimestamp: normalizedTimestamp,
        orderDate,
        timestamps,

        // Customer information
        tableInfo: tableInfo.toString(),
        tableNumber: tableInfo.toString(),
        customerInfo: {
          tableNumber: tableInfo.toString(),
          customerName:
            value.customerInfo?.customerName || value.customerName || "",
          phoneNumber:
            value.customerInfo?.phoneNumber || value.phoneNumber || "",
          // Preserve additional customer info
          ...value.customerInfo,
        },

        // Order items with consistent structure
        items,

        // Financial information
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        total: parseFloat(totalAmount.toFixed(2)),
        totalItems: items.length,

        // Order details structure
        orderDetails: {
          total: parseFloat(totalAmount.toFixed(2)),
          totalItems: items.length,
          subtotal: parseFloat(value.orderDetails?.subtotal || totalAmount),
          tax: parseFloat(value.orderDetails?.tax || 0),
          discount: parseFloat(value.orderDetails?.discount || 0),
          // Preserve additional order details
          ...value.orderDetails,
        },

        // Kitchen information
        kitchen: {
          status: normalizedStatus,
          lastUpdated: timestamps.lastUpdated,
          estimatedTime: value.kitchen?.estimatedTime || null,
          notes: value.kitchen?.notes || "",
          // Preserve additional kitchen info
          ...value.kitchen,
        },

        // Preserve all original data (important for compatibility)
        ...value,

        // Computed fields for UI consistency
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

      return normalizedOrder;
    });
  }, []);

  // Date range helper functions (unchanged)
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

  // ✅ FIRESTORE: Subscribe to orders data with enhanced error handling and real-time updates
  useEffect(() => {
    if (!activeHotelName) {
      setOrders([]);
      setLoading(false);
      setConnectionStatus("disconnected");
      return;
    }

    setLoading(true);
    setError(null);
    setConnectionStatus("connecting");

    // Clear previous subscription
    if (ordersUnsubscribeRef.current) {
      ordersUnsubscribeRef.current();
    }

    // Clear previous error timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    try {
      const ordersRef = collection(db, `hotels/${activeHotelName}/orders`);
      let q = ordersRef;

      // Apply sorting
      if (sortBy === "timestamp") {
        q = query(
          ordersRef,
          orderBy("createdAt", sortOrder === "desc" ? "desc" : "asc")
        );
      } else if (sortBy === "orderNumber") {
        q = query(
          ordersRef,
          orderBy("orderNumber", sortOrder === "desc" ? "desc" : "asc")
        );
      } else {
        q = query(ordersRef, orderBy("createdAt", "desc")); // Default sort
      }

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          try {
            const normalizedOrders = normalizeOrderData(querySnapshot);

            setOrders(normalizedOrders);
            setLastUpdated(new Date().toISOString());
            setConnectionStatus("connected");
            setError(null);
            setRetryCount(0);
          } catch (err) {
            console.error("Error processing orders:", err);
            setError(new Error(`Error processing orders: ${err.message}`));
            setConnectionStatus("error");
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.error("Firestore orders listener error:", err);
          setError(new Error(`Database connection error: ${err.message}`));
          setConnectionStatus("error");
          setLoading(false);
          setRetryCount((prev) => prev + 1);
        }
      );

      ordersUnsubscribeRef.current = unsubscribe;

      // ✅ ENHANCED: Connection timeout with retry logic
      errorTimeoutRef.current = setTimeout(() => {
        if (loading && retryCount < 3) {
          setError(
            new Error("Taking longer than expected to load orders. Retrying...")
          );
          setRetryCount((prev) => prev + 1);
        } else if (retryCount >= 3) {
          setError(new Error("Failed to load orders after multiple attempts"));
          setLoading(false);
          setConnectionStatus("error");
        }
      }, 15000);
    } catch (error) {
      console.error("Error setting up orders subscription:", error);
      setError(error);
      setLoading(false);
      setConnectionStatus("error");
    }

    return () => {
      if (ordersUnsubscribeRef.current) {
        ordersUnsubscribeRef.current();
        ordersUnsubscribeRef.current = null;
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }
      setConnectionStatus("disconnected");
    };
  }, [activeHotelName, sortBy, sortOrder, normalizeOrderData, retryCount]);

  // ✅ FIRESTORE: Subscribe to menu data if requested
  useEffect(() => {
    if (!activeHotelName || !includeMenuData) return;

    // Clear previous subscription
    if (menuUnsubscribeRef.current) {
      menuUnsubscribeRef.current();
    }

    try {
      const menuRef = collection(db, `hotels/${activeHotelName}/menu`);
      const q = query(menuRef, orderBy("menuName", "asc"));

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const menuArray = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            menuId: doc.id,
            ...doc.data(),
          }));
          setMenuData(menuArray);
        },
        (err) => {
          console.error("Error loading menu items:", err);
        }
      );

      menuUnsubscribeRef.current = unsubscribe;
    } catch (error) {
      console.error("Error setting up menu subscription:", error);
    }

    return () => {
      if (menuUnsubscribeRef.current) {
        menuUnsubscribeRef.current();
        menuUnsubscribeRef.current = null;
      }
    };
  }, [activeHotelName, includeMenuData]);

  // Filter orders by time period with improved logic (unchanged)
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
    // For "total" period, return all orders

    return filtered;
  }, [orders, selectedTimePeriod, selectedDate, dateRangeHelpers]);

  // Apply status and search filters (unchanged)
  const filteredOrders = useMemo(() => {
    let filtered = [...timeFilteredOrders];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.normalizedStatus === statusFilter
      );
    }

    // Search filter with comprehensive matching
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase().trim();
      filtered = filtered.filter((order) => {
        return (
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
      });
    }

    return filtered;
  }, [timeFilteredOrders, statusFilter, debouncedSearchTerm]);

  // Calculate comprehensive and accurate order statistics (unchanged)
  const orderStats = useMemo(() => {
    const stats = {
      total: timeFilteredOrders.length,
      received: 0,
      completed: 0,
      rejected: 0,
    };

    // Count orders by simplified status
    timeFilteredOrders.forEach((order) => {
      const status = order.normalizedStatus;
      if (status === "received") {
        stats.received++;
      } else if (status === "completed") {
        stats.completed++;
      } else if (status === "rejected") {
        stats.rejected++;
      }
    });

    // Revenue calculations from completed orders only
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

    // Customer metrics
    const uniqueTables = new Set(
      timeFilteredOrders
        .map((o) => o.tableInfo)
        .filter((table) => table && table !== "Unknown" && table !== "0")
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

  // Calculate menu analytics with improved accuracy (unchanged)
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
      menuStats: menuStats.slice(0, 20), // Show more items for better analytics
      topMenus: menuStats.slice(0, 3),
      totalMenuOrders,
    };
  }, [timeFilteredOrders, menuData]);

  // Calculate category analytics with improved accuracy (unchanged)
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

  // ✅ FIRESTORE: Enhanced update order status function
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
        const orderRef = doc(db, `hotels/${activeHotelName}/orders/${orderId}`);

        // Verify order exists first
        const orderDoc = await getDoc(orderRef);
        if (!orderDoc.exists()) {
          throw new Error("Order not found");
        }

        // Simplified status mapping for updates
        const statusMapping = {
          received: "received",
          completed: "completed",
          rejected: "rejected",
        };

        const normalizedNewStatus =
          statusMapping[newStatus.toLowerCase()] || newStatus.toLowerCase();

        const updateData = {
          kitchen: {
            ...orderDoc.data().kitchen,
            status: normalizedNewStatus,
            lastUpdated: serverTimestamp(),
            ...additionalData.kitchen,
          },
          status: normalizedNewStatus,
          timestamps: {
            ...orderDoc.data().timestamps,
            lastStatusUpdate: serverTimestamp(),
            lastUpdated: serverTimestamp(),
            ...additionalData.timestamps,
          },
          ...additionalData,
        };

        // Add status-specific timestamps
        if (normalizedNewStatus === "completed") {
          updateData.timestamps.completedTime = serverTimestamp();
        } else if (normalizedNewStatus === "rejected") {
          updateData.timestamps.rejectedTime = serverTimestamp();
        }

        await updateDoc(orderRef, updateData);
        toast.success(`Order status updated to ${normalizedNewStatus}`);
        return { success: true, newStatus: normalizedNewStatus };
      } catch (err) {
        console.error("Error updating order status:", err);
        toast.error(`Failed to update order status: ${err.message}`);
        return { success: false, error: err.message };
      } finally {
        setSubmitting(false);
      }
    },
    [activeHotelName, submitting]
  );

  // ✅ FIRESTORE: Enhanced delete order function
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
        const orderRef = doc(db, `hotels/${activeHotelName}/orders/${orderId}`);
        const orderDoc = await getDoc(orderRef);

        if (!orderDoc.exists()) {
          throw new Error("Order not found");
        }

        await deleteDoc(orderRef);
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
    [activeHotelName, submitting]
  );

  // ✅ FIRESTORE: Enhanced update order function
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
        const orderRef = doc(db, `hotels/${activeHotelName}/orders/${orderId}`);
        const orderDoc = await getDoc(orderRef);

        if (!orderDoc.exists()) {
          throw new Error("Order not found");
        }

        const currentOrder = orderDoc.data();

        // Recalculate totals if items were updated
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

        // Prepare updates
        const updateData = {
          ...orderData,
          timestamps: {
            ...currentOrder.timestamps,
            lastModified: serverTimestamp(),
            lastUpdated: serverTimestamp(),
            ...orderData.timestamps,
          },
          kitchen: {
            ...currentOrder.kitchen,
            status:
              orderData.status ||
              orderData.normalizedStatus ||
              currentOrder.kitchen?.status ||
              currentOrder.status ||
              "received",
            lastUpdated: serverTimestamp(),
            ...orderData.kitchen,
          },
          orderDetails: {
            ...currentOrder.orderDetails,
            totalItems: updatedItems.length,
            ...orderData.orderDetails,
          },
        };

        // Update calculated fields
        if (orderData.items) {
          updateData.totalAmount = parseFloat(calculatedTotal.toFixed(2));
          updateData.total = parseFloat(calculatedTotal.toFixed(2));
        }

        await updateDoc(orderRef, updateData);
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
    [activeHotelName, submitting]
  );

  // Filter and search handlers (unchanged)
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
    setRetryCount(0);
    if (connectionStatus === "error") {
      setConnectionStatus("connecting");
    }
  }, [connectionStatus]);

  // Helper functions (unchanged)
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

  // Calculate today's stats (unchanged)
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

  // Export order data as CSV helper function (unchanged)
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

  // Return comprehensive and consistent API
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

    // State
    loading,
    submitting,
    error,
    lastUpdated,
    connectionStatus,
    retryCount,

    // Filter state
    statusFilter,
    selectedDate,
    selectedTimePeriod,
    searchTerm,
    debouncedSearchTerm,

    // Filter handlers
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

    // Simplified status options for UI (only 3 statuses)
    statusOptions: [
      { value: "all", label: "All Orders" },
      { value: "received", label: "Received" },
      { value: "completed", label: "Completed" },
      { value: "rejected", label: "Rejected" },
    ],

    // Time period options for UI
    timePeriodOptions: [
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
      { value: "total", label: "All Time" },
    ],

    // Computed display properties
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
    isRetrying: retryCount > 0 && loading,
    canRetry: retryCount < 3 && error,

    // Meta info
    activeHotelName,
    currentUser,
  };
};
