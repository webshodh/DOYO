import React, { useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  BarChart3,
  ShoppingBag,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  Award,
  DollarSign,
} from "lucide-react";

import { useOrder } from "../../hooks/useOrder";
import { useHotelSelection } from "../../context/HotelSelectionContext";
import AdminDashboardLayout from "../../layout/AdminDashboardLayout";
import StatCard from "../../components/Cards/StatCard";
import TopMenuCards from "../../components/Cards/TopMenuCard";
import { DynamicTable } from "../../components";
import { OrderInsights } from "../../molecules/OrderInsights";
import TimePeriodSelector from "../../atoms/TimePeriodSelector";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import ErrorState from "../../atoms/Messages/ErrorState";
import OrderDetailsModal from "../../components/order-dashboard/OrderDetailsModal";
import AddMenu from "./AddMenu";
import { useTranslation } from "react-i18next";
import { useTheme } from "context/ThemeContext";
import { useMenu } from "hooks/useMenu";
import { useCategory } from "hooks/useCategory";
import { useMainCategory } from "hooks/useMainCategory";
import useColumns from "../../Constants/Columns";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { currentTheme, isDark } = useTheme();
  const { hotelName } = useParams();
  const { selectedHotel } = useHotelSelection();

  // Columns for tables
  const { OrdersByCategoryColumn, OrdersByMenuColumn } = useColumns();

  // Modal & UI state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch orders & analytics via optimized hooks
  const {
    orders,
    filteredOrders,
    timeFilteredOrders,
    menuData,
    orderStats,
    todayStats,
    menuAnalytics,
    categoryAnalytics,
    loading,
    submitting,
    error,
    connectionStatus,
    lastUpdated,
    selectedDate,
    selectedTimePeriod,
    periodDisplayText,
    searchTerm,
    statusFilter,
    hasOrders,
    hasFilteredOrders,
    updateOrderStatus,
    refreshOrders,
    exportDataCSV: exportOrdersCSV,
    handleSearchChange,
    handleStatusFilterChange,
    handleDateChange,
    handleTimePeriodChange,
    clearFilters,
    getOrdersByStatus,
    getOrdersById,
    statusOptions,
    timePeriodOptions,
  } = useOrder(hotelName, {
    includeMenuData: true,
    defaultTimePeriod: "daily",
    defaultStatusFilter: "all",
    sortBy: "timestamp",
    sortOrder: "desc",
  });

  // Fetch menu and categories data
  const {
    filteredAndSorted: filteredMenus,
    loading: menuLoading,
    error: menuError,
    refresh: refreshMenus,
    count: menuCount,
    hasMenus,
    hasFiltered: hasMenusFiltered,
  } = useMenu(hotelName);

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    count: categoryCount,
  } = useCategory(hotelName);

  const { total: totalMainCategories } = useMainCategory(hotelName) || {};

  // Connection status indicator
  const connectionStatusInfo = useMemo(() => {
    switch (connectionStatus) {
      case "connected":
        return { color: "green", text: "Live Data", icon: CheckCircle };
      case "connecting":
        return { color: "yellow", text: "Connecting...", icon: Loader };
      case "error":
        return { color: "red", text: "Connection Error", icon: AlertCircle };
      case "disconnected":
        return { color: "gray", text: "Offline", icon: AlertCircle };
      default:
        return { color: "gray", text: "Unknown", icon: AlertCircle };
    }
  }, [connectionStatus]);

  // Derived restaurant info once
  const restaurantInfo = useMemo(
    () => ({
      name: hotelName || "Restaurant Name",
      address: "Restaurant address, City, State - 123456",
      phone: "+91 12345 67890",
      gst: "12ABCDE3456F",
      taxRate: 0.18,
      footer: "Thank you for dining with us!",
    }),
    [hotelName]
  );

  // Stats memoization
  const displayStats = useMemo(() => {
    if (!orderStats) return {};

    const total = orderStats.total || 0;
    const received = orderStats.received || 0;
    const completed = orderStats.completed || 0;
    const rejected = orderStats.rejected || 0;
    const revenue = orderStats.totalRevenue || 0;

    return {
      total,
      received,
      completed,
      rejected,
      revenue,
      activeOrders: received,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [orderStats]);

  // Menu statistics
  const menuStats = useMemo(() => {
    if (!filteredMenus) return {};

    const total = filteredMenus.length;
    const available = filteredMenus.filter(
      (m) => m.availability === "Available"
    ).length;
    const discounted = filteredMenus.filter(
      (m) => m.discount && m.discount > 0
    ).length;
    const uniqueCategories = new Set(
      filteredMenus.map((m) => m.menuCategory || "Other")
    ).size;

    return { total, available, discounted, uniqueCategories };
  }, [filteredMenus]);

  // Handlers wrapped with useCallback
  const handleViewDetails = useCallback((order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedOrder(null);
    setShowOrderDetails(false);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshOrders();
      await refreshMenus();
    } catch (e) {
      console.error("Refresh error", e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [refreshOrders, refreshMenus]);

  const handleExport = useCallback(() => {
    try {
      exportOrdersCSV();
    } catch (e) {
      console.error("Export error", e);
    }
  }, [exportOrdersCSV]);

  const handleUpdateStatus = useCallback(
    async (orderId, newStatus) => {
      const res = await updateOrderStatus(orderId, newStatus, {
        updatedBy: "admin",
        updatedAt: new Date().toISOString(),
        kitchen: { notes: "Status updated via admin dashboard" },
      });

      // Update selected order locally if matched
      if (res.success && selectedOrder?.id === orderId) {
        setSelectedOrder((s) => ({
          ...s,
          status: newStatus,
          normalizedStatus: newStatus,
        }));
      }
      return res;
    },
    [updateOrderStatus, selectedOrder]
  );

  return (
    <AdminDashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header and welcome */}
        <div>
          <h1 className={`text-3xl font-bold`}>{t("dashboard.title")}</h1>
          <p className="text-gray-600">
            {t("dashboard.welcome")} {selectedHotel?.name || "-"}{" "}
            {t("dashboard.today")}
          </p>
        </div>

        {/* Controls */}
        <TimePeriodSelector
          selectedValue={selectedTimePeriod}
          onChange={handleDateChange}
          onPeriodChange={handleDateChange}
          options={timePeriodOptions}
          selectedDate={selectedDate}
        />

        {/* Status info */}
        <div>
          <span>{periodDisplayText}</span>
          <span>{filteredOrders.length} Orders</span>
          {displayStats.revenue && <span>₹{displayStats.revenue}</span>}
          <span>{displayStats.completionRate}% Completion</span>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard
            title={t("dashboard.totalOrders")}
            value={displayStats.total}
            icon={ShoppingBag}
            color="blue"
          />
          <StatCard
            title={t("dashboard.completedOrders")}
            value={displayStats.completed}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title={t("dashboard.rejectedOrders")}
            value={displayStats.rejected}
            icon={AlertCircle}
            color="red"
          />
          <StatCard
            title={t("dashboard.revenue")}
            value={`₹${displayStats.revenue || 0}`}
            icon={DollarSign}
            color="yellow"
          />
        </div>

        {/* Menu stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard
            title={t("dashboard.totalMenuItems")}
            value={menuStats.total}
            icon={ShoppingBag}
            color="purple"
          />
          <StatCard
            title={t("dashboard.availableItems")}
            value={menuStats.available}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title={t("dashboard.discountedItems")}
            value={menuStats.discounted}
            icon={TrendingUp}
            color="orange"
          />
          <StatCard
            title={t("dashboard.menuCategories")}
            value={menuStats.uniqueCategories}
            icon={BarChart3}
            color="blue"
          />
        </div>

        {/* Error and loading handling */}
        {loading && <LoadingSpinner text={t("dashboard.loading")} />}
        {(error || menuError || categoriesError) && (
          <ErrorState
            title={t("dashboard.errorTitle")}
            message={error?.message || menuError || categoriesError}
            retryAction={handleRefresh}
          />
        )}

        {/* Orders Table */}
        <DynamicTable columns={OrdersByCategoryColumn} data={filteredOrders} />

        {/* Modal */}
        {showOrderDetails && selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={handleCloseDetails}
            onStatusUpdate={handleUpdateStatus}
            isSubmitting={submitting}
            orderStatuses={statusOptions}
          />
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;
