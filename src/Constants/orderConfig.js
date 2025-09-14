// utils/orderUtils.js
import {
  Package,
  Clock,
  ChefHat,
  CheckCircle2,
  CheckCircle,
  XCircle,
  Utensils,
} from "lucide-react";

// Order status constants
export const ORDER_STATUSES = [
  {
    value: "received",
    label: "Received",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    icon: Package,
  },
  {
    value: "preparing",
    label: "Preparing",
    color: "yellow",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    icon: ChefHat,
  },
  {
    value: "ready",
    label: "Ready",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    icon: CheckCircle2,
  },
  {
    value: "served",
    label: "Served",
    color: "purple",
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
    icon: Utensils,
  },
  {
    value: "completed",
    label: "Completed",
    color: "gray",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
    icon: CheckCircle,
  },
  {
    value: "rejected",
    label: "Rejected",
    color: "red",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    icon: XCircle,
  },
];

// Time period options
export const TIME_PERIODS = [
  { value: "daily", label: "Today" },
  { value: "weekly", label: "This Week" },
  { value: "monthly", label: "This Month" },
  { value: "total", label: "All Time" },
];

// Order analytics calculations
export const calculateOrderAnalytics = (orders, menuData = []) => {
  if (!orders.length) {
    return {
      totalOrders: 0,
      totalRevenue: 0,
      avgOrderValue: 0,
      completedOrders: 0,
      pendingOrders: 0,
      rejectedOrders: 0,
      successRate: 0,
      rejectionRate: 0,
      uniqueCustomers: 0,
      peakHour: "N/A",
      categoryWiseOrders: {},
      menuWiseOrders: {},
      topSellingDishes: [],
      revenueByCategory: {},
    };
  }

  // Basic metrics
  const totalOrders = orders.length;
  const completedOrders = orders.filter(
    (o) => (o.kitchen?.status || o.status) === "completed"
  );
  const pendingOrders = orders.filter((o) => {
    const status = o.kitchen?.status || o.status || "received";
    return ["received", "preparing", "ready"].includes(status);
  });
  const rejectedOrders = orders.filter(
    (o) => (o.kitchen?.status || o.status) === "rejected"
  );

  const totalRevenue = completedOrders.reduce(
    (sum, order) => sum + (order.pricing?.total || 0),
    0
  );

  const avgOrderValue =
    completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  const successRate =
    totalOrders > 0 ? (completedOrders.length / totalOrders) * 100 : 0;

  const rejectionRate =
    totalOrders > 0 ? (rejectedOrders.length / totalOrders) * 100 : 0;

  // Peak hour calculation
  const hourCounts = {};
  orders.forEach((order) => {
    if (order.timestamps?.orderPlaced) {
      const hour = new Date(order.timestamps.orderPlaced).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });

  const peakHour =
    Object.keys(hourCounts).length > 0
      ? Object.keys(hourCounts).reduce(
          (a, b) => (hourCounts[a] > hourCounts[b] ? a : b),
          "0"
        )
      : "0";

  // Unique customers
  const uniqueTables = new Set(
    orders
      .map((o) => o.tableNumber || o.customerInfo?.tableNumber)
      .filter(Boolean)
  );

  // Category and menu analysis
  const categoryWiseOrders = {};
  const menuWiseOrders = {};
  const revenueByCategory = {};

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      const category = item.menuCategory || "Other";
      const menuName = item.menuName;
      const quantity = item.quantity || 1;
      const itemRevenue =
        (item.finalPrice || item.originalPrice || 0) * quantity;

      // Category wise orders
      categoryWiseOrders[category] =
        (categoryWiseOrders[category] || 0) + quantity;
      revenueByCategory[category] =
        (revenueByCategory[category] || 0) + itemRevenue;

      // Menu wise orders
      if (menuName) {
        menuWiseOrders[menuName] = (menuWiseOrders[menuName] || 0) + quantity;
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
        revenue: count * (menuItem?.finalPrice || menuItem?.originalPrice || 0),
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalOrders,
    totalRevenue,
    avgOrderValue,
    completedOrders: completedOrders.length,
    pendingOrders: pendingOrders.length,
    rejectedOrders: rejectedOrders.length,
    successRate,
    rejectionRate,
    uniqueCustomers: uniqueTables.size,
    peakHour: peakHour !== "0" ? `${peakHour}:00` : "N/A",
    categoryWiseOrders,
    menuWiseOrders,
    topSellingDishes,
    revenueByCategory,
  };
};

// Date utility functions
export const dateUtils = {
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

  formatOrderDate: (order) => {
    return (
      order.timestamps?.orderDate ||
      new Date(order.timestamps?.orderPlaced).toISOString().split("T")[0]
    );
  },

  getTodayString: () => {
    return new Date().toISOString().split("T")[0];
  },
};

// Filter orders by time period
export const filterOrdersByTimePeriod = (
  orders,
  selectedTimePeriod,
  selectedDate
) => {
  if (selectedTimePeriod === "total") {
    return orders;
  }

  if (selectedTimePeriod === "daily") {
    return orders.filter((order) => {
      const orderDateStr = dateUtils.formatOrderDate(order);
      return orderDateStr === selectedDate;
    });
  }

  if (selectedTimePeriod === "weekly") {
    const { start, end } = dateUtils.getCurrentWeekRange();
    return orders.filter((order) => {
      const orderDate = dateUtils.formatOrderDate(order);
      return dateUtils.isDateInRange(orderDate, start, end);
    });
  }

  if (selectedTimePeriod === "monthly") {
    const { start, end } = dateUtils.getCurrentMonthRange();
    return orders.filter((order) => {
      const orderDate = dateUtils.formatOrderDate(order);
      return dateUtils.isDateInRange(orderDate, start, end);
    });
  }

  return orders;
};

// Get period display text
export const getPeriodDisplayText = (selectedTimePeriod, selectedDate) => {
  switch (selectedTimePeriod) {
    case "daily":
      return `Orders for ${new Date(selectedDate).toLocaleDateString()}`;
    case "weekly":
      const weekRange = dateUtils.getCurrentWeekRange();
      return `Orders for this week (${weekRange.start.toLocaleDateString()} - ${weekRange.end.toLocaleDateString()})`;
    case "monthly":
      const monthRange = dateUtils.getCurrentMonthRange();
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

// Format currency
export const formatCurrency = (amount) => {
  return `₹${Math.round(amount || 0).toLocaleString()}`;
};

// Get status configuration
export const getStatusConfig = (status) => {
  return ORDER_STATUSES.find((s) => s.value === status) || ORDER_STATUSES[0];
};

