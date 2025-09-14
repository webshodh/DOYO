// hooks/useOrderDashboard.js
import { useState, useCallback, useMemo } from "react";
import { useKitchenOrders } from "./useKitchenOrders";
import { calculateOrderAnalytics, filterOrdersByTimePeriod, getPeriodDisplayText } from "Constants/orderConfig";


export const useOrderDashboard = (hotelName, options = {}) => {
  const {
    includeMenuData = false,
    defaultTimePeriod = "daily",
    defaultStatusFilter = "all",
  } = options;

  const [statusFilter, setStatusFilter] = useState(defaultStatusFilter);

  // Use the kitchen orders hook
  const {
    orders,
    menuData,
    loading,
    submitting,
    error,
    selectedDate,
    selectedTimePeriod,
    handleDateChange,
    handleTimePeriodChange,
    refreshOrders,
    updateOrderStatus,
  } = useKitchenOrders(hotelName, includeMenuData);

  // Filter orders by time period
  const processedOrders = useMemo(() => {
    return filterOrdersByTimePeriod(orders, selectedTimePeriod, selectedDate);
  }, [orders, selectedTimePeriod, selectedDate]);

  // Filter by status
  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") {
      return processedOrders;
    }
    return processedOrders.filter((order) => {
      const status = order.kitchen?.status || order.status || "received";
      return status === statusFilter;
    });
  }, [processedOrders, statusFilter]);

  // Calculate analytics
  const analytics = useMemo(() => {
    return calculateOrderAnalytics(filteredOrders, menuData);
  }, [filteredOrders, menuData]);

  // Menu statistics
  const menuStats = useMemo(() => {
    const menuStatsData = {};
    let totalMenuOrders = 0;

    filteredOrders.forEach((order) => {
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
  }, [filteredOrders]);

  // Category statistics
  const categoryStats = useMemo(() => {
    const categoryData = {};
    let totalCategoryOrders = 0;

    filteredOrders.forEach((order) => {
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
  }, [filteredOrders]);

  // Top menu items
  const topMenus = useMemo(() => {
    const menuStatsMap = {};

    filteredOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const menuId = item.menuId || item.id;
        const menuName = item.menuName || "Unknown Menu";
        const key = menuId || menuName;

        if (!menuStatsMap[key]) {
          menuStatsMap[key] = {
            menu:
              menuData.find(
                (m) => m.id === menuId || m.menuName === menuName
              ) || item,
            orderCount: 0,
            revenue: 0,
          };
        }
        menuStatsMap[key].orderCount += item.quantity || 1;
        menuStatsMap[key].revenue += item.itemTotal || item.finalPrice || 0;
      });
    });

    return Object.values(menuStatsMap)
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 3);
  }, [filteredOrders, menuData]);

  const handleStatusFilterChange = useCallback((filter) => {
    setStatusFilter(filter);
  }, []);

  const periodDisplayText = useMemo(() => {
    return getPeriodDisplayText(selectedTimePeriod, selectedDate);
  }, [selectedTimePeriod, selectedDate]);

  return {
    // Data
    orders,
    processedOrders,
    filteredOrders,
    menuData,

    // Analytics
    analytics,
    menuStats,
    categoryStats,
    topMenus,

    // Filters
    statusFilter,
    selectedDate,
    selectedTimePeriod,
    periodDisplayText,

    // Actions
    handleDateChange,
    handleTimePeriodChange,
    handleStatusFilterChange,
    refreshOrders,
    updateOrderStatus,

    // State
    loading,
    submitting,
    error,

    // Computed
    hasOrders: orders.length > 0,
    hasFilteredOrders: filteredOrders.length > 0,
    totalOrders: orders.length,
    filteredOrdersCount: filteredOrders.length,
  };
};
