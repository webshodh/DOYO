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
  Calendar,
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
import { PageTitle } from "atoms";

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
    filteredAndSortedMenus, // FIXED: Changed from filteredAndSorted
    loading: menuLoading,
    error: menuError,
    refreshMenus, // FIXED: Changed from refresh
    menuCount, // FIXED: Changed from count
    hasMenus, // FIXED: This is correct
  } = useMenu(hotelName);

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    categoryCount, // FIXED: Changed from count
  } = useCategory(hotelName);

  const {
    mainCategoryCount, // FIXED: Changed from total
    loading: mainCategoryLoading,
  } = useMainCategory(hotelName) || {};

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

  // Stats memoization - FIXED: Better null/undefined handling
  const displayStats = useMemo(() => {
    if (!orderStats) {
      return {
        total: 0,
        received: 0,
        completed: 0,
        rejected: 0,
        revenue: 0,
        activeOrders: 0,
        completionRate: 0,
      };
    }

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

  // Menu statistics - FIXED: Using correct variable name
  const menuStats = useMemo(() => {
    if (!filteredAndSortedMenus || filteredAndSortedMenus.length === 0) {
      return {
        total: 0,
        available: 0,
        discounted: 0,
        uniqueCategories: 0,
      };
    }

    const total = filteredAndSortedMenus.length;
    const available = filteredAndSortedMenus.filter(
      (m) => m.availability === "Available"
    ).length;
    const discounted = filteredAndSortedMenus.filter(
      (m) => m.discount && m.discount > 0
    ).length;
    const uniqueCategories = new Set(
      filteredAndSortedMenus.map((m) => m.menuCategory || "Other")
    ).size;

    return { total, available, discounted, uniqueCategories };
  }, [filteredAndSortedMenus]);

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

  // FIXED: Better loading state
  const isLoading =
    loading || menuLoading || categoriesLoading || mainCategoryLoading;

  return (
    <AdminDashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-row items-center justify-between gap-4 mb-1">
          <PageTitle
            pageTitle={t("dashboard.title")}
            className="text-2xl sm:text-3xl font-bold text-gray-900"
            description={
              t("dashboard.welcome", {
                hotelName: selectedHotel?.name || hotelName,
              }) +
              " " +
              t("dashboard.today")
            }
          />

          {selectedTimePeriod === "daily" && (
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
              <Calendar size={16} className="text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="bg-transparent border-none focus:outline-none text-sm"
              />
            </div>
          )}
        </div>

        {/* Enhanced Time Period Navigation */}
        <TimePeriodSelector
          selectedTimePeriod={selectedTimePeriod}
          onTimePeriodChange={handleTimePeriodChange}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          variant="default"
          showDatePicker={true}
          className="mb-6"
          options={timePeriodOptions}
          disableFutureDates={true}
        />

        {/* Status info */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="font-medium">{periodDisplayText}</span>
          <span className="text-gray-600">
            {filteredOrders?.length || 0} Orders
          </span>
          {displayStats.revenue > 0 && (
            <span className="text-green-600 font-semibold">
              ₹{displayStats.revenue.toLocaleString()}
            </span>
          )}
          <span className="text-blue-600">
            {displayStats.completionRate}% Completion
          </span>
        </div>

        {/* Error handling - FIXED: Show before stats */}
        {(error || menuError || categoriesError) && (
          <ErrorState
            title={t("dashboard.errorTitle")}
            message={error?.message || menuError || categoriesError}
            retryAction={handleRefresh}
          />
        )}

        {/* Loading state - FIXED */}
        {isLoading &&
        !filteredOrders?.length &&
        !filteredAndSortedMenus?.length ? (
          <LoadingSpinner text={t("dashboard.loading")} />
        ) : (
          <>
            {/* Order Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                value={`₹${(displayStats.revenue || 0).toLocaleString()}`}
                icon={DollarSign}
                color="yellow"
              />
            </div>

            {/* Menu stats cards - FIXED: Now using correct data */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

            {/* Orders Table - FIXED: Added conditional rendering */}
            {filteredOrders && filteredOrders.length > 0 && (
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
                <DynamicTable
                  columns={OrdersByCategoryColumn}
                  data={filteredOrders}
                  onView={handleViewDetails}
                />
              </div>
            )}
          </>
        )}

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
