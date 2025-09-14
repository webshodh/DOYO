import { useState, useEffect, useCallback, useMemo } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "../data/firebase/firebaseConfig";

export const useKitchenOrders = (hotelName, includeMenuData = false) => {
  // State management
  const [orders, setOrders] = useState([]);
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0] // Fixed: was splitting and not taking [0]
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
  }, [hotelName]); // Removed loading dependency to prevent infinite loop

  // Subscribe to menu data if needed
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
      (error) => console.error("Error loading menu items:", error)
    );

    return () => unsubscribe();
  }, [hotelName, includeMenuData]);

  // Filter orders based on time period
  const processedOrders = useMemo(() => {
    let filtered = [...orders];

    // Filter by time period first
    if (selectedTimePeriod === "daily") {
      filtered = filtered.filter((order) => {
        const orderDateStr =
          order.timestamps?.orderDate ||
          new Date(order.timestamps?.orderPlaced).toISOString().split("T")[0]; // Fixed: was missing [0]
        return orderDateStr === selectedDate;
      });
    } else if (selectedTimePeriod === "weekly") {
      const { start, end } = getCurrentWeekRange();
      filtered = filtered.filter((order) => {
        const orderDate =
          order.timestamps?.orderDate ||
          new Date(order.timestamps?.orderPlaced).toISOString().split("T")[0]; // Fixed: was missing [0]
        return isDateInRange(orderDate, start, end);
      });
    } else if (selectedTimePeriod === "monthly") {
      const { start, end } = getCurrentMonthRange();
      filtered = filtered.filter((order) => {
        const orderDate =
          order.timestamps?.orderDate ||
          new Date(order.timestamps?.orderPlaced).toISOString().split("T")[0]; // Fixed: was missing [0]
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

  // Calculate basic order stats
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

  // Enhanced analytics calculations
  const analytics = useMemo(() => {
    const completedOrders = processedOrders.filter(
      (order) => (order.kitchen?.status || order.status) === "completed"
    );

    if (!completedOrders.length) {
      return {
        totalOrders: processedOrders.length,
        totalRevenue: 0,
        avgOrderValue: 0,
        avgResponseTime: 0,
        avgWaitTime: 0,
        categoryWiseOrders: {},
        menuWiseOrders: {},
        topSellingDishes: [],
        revenueByCategory: {},
        customerSatisfaction: 0,
        repeatCustomerRate: 0,
        uniqueCustomers: 0,
        peakHour: "N/A",
      };
    }

    // Basic metrics
    const totalOrders = completedOrders.length;
    const totalRevenue = completedOrders.reduce(
      (sum, order) => sum + (order.pricing?.total || 0),
      0
    );
    const avgOrderValue = totalRevenue / totalOrders;

    // Time-based metrics
    const responseTime = completedOrders
      .filter(
        (order) =>
          order.timestamps?.preparingTime && order.timestamps?.orderPlaced
      )
      .map((order) => {
        const start = new Date(order.timestamps.orderPlaced);
        const response = new Date(order.timestamps.preparingTime);
        return (response - start) / (1000 * 60); // in minutes
      });

    const waitTime = completedOrders
      .filter(
        (order) =>
          order.timestamps?.readyTime && order.timestamps?.preparingTime
      )
      .map((order) => {
        const start = new Date(order.timestamps.preparingTime);
        const ready = new Date(order.timestamps.readyTime);
        return (ready - start) / (1000 * 60); // in minutes
      });

    const avgResponseTime = responseTime.length
      ? responseTime.reduce((a, b) => a + b, 0) / responseTime.length
      : 0;

    const avgWaitTime = waitTime.length
      ? waitTime.reduce((a, b) => a + b, 0) / waitTime.length
      : 0;

    // Category and menu analysis
    const categoryWiseOrders = {};
    const menuWiseOrders = {};
    const revenueByCategory = {};

    completedOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const category = item.menuCategory || "Other";
        const menuName = item.menuName;

        // Category wise orders
        categoryWiseOrders[category] =
          (categoryWiseOrders[category] || 0) + (item.quantity || 1);
        revenueByCategory[category] =
          (revenueByCategory[category] || 0) +
          (item.finalPrice || item.originalPrice || 0) * (item.quantity || 1);

        // Menu wise orders
        if (menuName) {
          menuWiseOrders[menuName] =
            (menuWiseOrders[menuName] || 0) + (item.quantity || 1);
        }
      });
    });

    // Top selling dishes
    const topSellingDishes = Object.entries(menuWiseOrders)
      .map(([dish, count]) => {
        const menuItem = menuData.find((m) => m.menuName === dish);
        return {
          dish,
          count,
          category: menuItem?.menuCategory || "Other",
          revenue:
            count * (menuItem?.finalPrice || menuItem?.originalPrice || 0),
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Peak hour calculation
    const hourCounts = {};
    completedOrders.forEach((order) => {
      if (order.timestamps?.orderPlaced) {
        const hour = new Date(order.timestamps.orderPlaced).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });
    const peakHour = Object.keys(hourCounts).reduce(
      (a, b) => (hourCounts[a] > hourCounts[b] ? a : b),
      "0"
    );

    // Unique customers
    const uniqueTables = new Set(
      completedOrders
        .map((o) => o.tableNumber || o.customerInfo?.tableNumber)
        .filter(Boolean)
    );

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      avgResponseTime,
      avgWaitTime,
      categoryWiseOrders,
      menuWiseOrders,
      topSellingDishes,
      revenueByCategory,
      customerSatisfaction: 4.2, // Mock data
      repeatCustomerRate: 35, // Mock data
      uniqueCustomers: uniqueTables.size,
      peakHour: peakHour !== "0" ? `${peakHour}:00` : "N/A",
    };
  }, [processedOrders, menuData]);

  // Menu statistics for analytics dashboard
  const menuStats = useMemo(() => {
    const menuStatsData = {};
    let totalMenuOrders = 0;

    processedOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const menuName = item.menuName || "Unknown Menu";
        if (!menuStatsData[menuName]) {
          menuStatsData[menuName] = {
            orderCount: 0,
            revenue: 0,
            imageUrl: item.imageUrl,
          };
        }
        menuStatsData[menuName].orderCount += item.quantity || 1;
        menuStatsData[menuName].revenue +=
          item.itemTotal || item.finalPrice || 0;
        totalMenuOrders += item.quantity || 1;
      });
    });

    return Object.entries(menuStatsData)
      .map(([menuName, data]) => ({
        menuName,
        orderCount: data.orderCount,
        revenue: data.revenue,
        imageUrl: data.imageUrl,
        percentage:
          totalMenuOrders > 0 ? (data.orderCount / totalMenuOrders) * 100 : 0,
      }))
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 10);
  }, [processedOrders]);

  // Category statistics for analytics dashboard
  const categoryStats = useMemo(() => {
    const categoryData = {};
    let totalCategoryOrders = 0;

    processedOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const category = item.menuCategory || "Uncategorized";
        if (!categoryData[category]) {
          categoryData[category] = { orderCount: 0, revenue: 0 };
        }
        categoryData[category].orderCount += item.quantity || 1;
        categoryData[category].revenue +=
          item.itemTotal || item.finalPrice || 0;
        totalCategoryOrders += item.quantity || 1;
      });
    });

    return Object.entries(categoryData)
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
  }, [processedOrders]);

  // Top menu items for different views
  const topMenus = useMemo(() => {
    const menuStatsMap = {};

    processedOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const menuId = item.menuId || item.id;
        const menuName = item.menuName || "Unknown Menu";

        if (!menuStatsMap[menuId || menuName]) {
          menuStatsMap[menuId || menuName] = {
            menu:
              menuData.find(
                (m) => m.id === menuId || m.menuName === menuName
              ) || item,
            orderCount: 0,
            revenue: 0,
          };
        }
        menuStatsMap[menuId || menuName].orderCount += item.quantity || 1;
        menuStatsMap[menuId || menuName].revenue +=
          item.itemTotal || item.finalPrice || 0;
      });
    });

    return Object.values(menuStatsMap)
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 3);
  }, [processedOrders, menuData]);

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
          status: newStatus, // Also update the main status field for consistency
          ...additionalData,
        };

        // Add status-specific timestamps
        if (newStatus === "preparing") {
          updates["timestamps/preparationStarted"] = new Date().toISOString();
          updates["timestamps/preparingTime"] = new Date().toISOString();
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
    // Automatically switch to daily when a specific date is selected
    setSelectedTimePeriod("daily");
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
        return `Orders for ${new Date(selectedDate).toLocaleDateString()}`;
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
    menuData,
    loading,
    submitting,
    error,
    activeFilter,
    selectedDate,
    selectedTimePeriod,

    // Basic Stats
    orderStats,

    // Enhanced Analytics
    analytics,
    menuStats,
    categoryStats,
    topMenus,

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
    isDateInRange,

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
