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
import { DynamicTable, HorizontalMenuCard } from "../../components";
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
    filteredAndSortedMenus,
    loading: menuLoading,
    error: menuError,
    refreshMenus,
    menuCount,
    hasMenus,
  } = useMenu(hotelName);

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    categoryCount,
  } = useCategory(hotelName);

  const { mainCategoryCount, loading: mainCategoryLoading } =
    useMainCategory(hotelName) || {};

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
    [hotelName],
  );

  // Stats memoization
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

  // Menu statistics
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
      (m) => m.availability === "Available",
    ).length;
    const discounted = filteredAndSortedMenus.filter(
      (m) => m.discount && m.discount > 0,
    ).length;
    const uniqueCategories = new Set(
      filteredAndSortedMenus.map((m) => m.menuCategory || "Other"),
    ).size;

    return { total, available, discounted, uniqueCategories };
  }, [filteredAndSortedMenus]);

  // Calculate Top 5 Menus by Order Count - FIXED REVENUE CALCULATION
  const topMenusByOrders = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) {
      return [];
    }

    const menuOrderCount = {};

    filteredOrders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const menuId = item.menuId || item.id || item.menuName;
          if (menuId) {
            if (!menuOrderCount[menuId]) {
              menuOrderCount[menuId] = {
                menuId,
                menuName: item.menuName || "Unknown",
                orderCount: 0,
                totalQuantity: 0,
                totalRevenue: 0,
              };
            }
            menuOrderCount[menuId].orderCount += 1;
            menuOrderCount[menuId].totalQuantity += item.quantity || 0;
            // Use itemTotal which is already calculated in useOrder hook
            menuOrderCount[menuId].totalRevenue += parseFloat(
              item.itemTotal || 0,
            );
          }
        });
      }
    });

    return Object.values(menuOrderCount)
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5);
  }, [filteredOrders]);

  // Calculate Top 10 Orders by Category - FIXED REVENUE CALCULATION
  const topOrdersByCategory = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) {
      return [];
    }

    const categoryOrderCount = {};

    filteredOrders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const category =
            item.menuCategory || item.category || "Uncategorized";
          if (!categoryOrderCount[category]) {
            categoryOrderCount[category] = {
              category,
              orderCount: 0,
              totalQuantity: 0,
              totalRevenue: 0,
              itemCount: 0,
            };
          }
          categoryOrderCount[category].orderCount += 1;
          categoryOrderCount[category].totalQuantity += item.quantity || 0;
          // Use itemTotal which is already calculated
          categoryOrderCount[category].totalRevenue += parseFloat(
            item.itemTotal || 0,
          );
          categoryOrderCount[category].itemCount += 1;
        });
      }
    });

    return Object.values(categoryOrderCount)
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 10);
  }, [filteredOrders]);

  // Calculate Top 10 Orders by Menu - FIXED REVENUE CALCULATION
  const topOrdersByMenu = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) {
      return [];
    }

    const menuOrderCount = {};

    filteredOrders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const menuId = item.menuId || item.id || item.menuName;
          const menuName = item.menuName || "Unknown";

          if (menuId) {
            if (!menuOrderCount[menuId]) {
              menuOrderCount[menuId] = {
                menuId,
                menuName,
                category: item.menuCategory || item.category || "Uncategorized",
                orderCount: 0,
                totalQuantity: 0,
                totalRevenue: 0,
                avgPrice: 0,
              };
            }
            menuOrderCount[menuId].orderCount += 1;
            menuOrderCount[menuId].totalQuantity += item.quantity || 0;
            // Use itemTotal which is already calculated
            menuOrderCount[menuId].totalRevenue += parseFloat(
              item.itemTotal || 0,
            );
          }
        });
      }
    });

    const menuArray = Object.values(menuOrderCount);
    menuArray.forEach((menu) => {
      menu.avgPrice =
        menu.totalQuantity > 0 ? menu.totalRevenue / menu.totalQuantity : 0;
    });

    return menuArray.sort((a, b) => b.orderCount - a.orderCount).slice(0, 10);
  }, [filteredOrders]);

  // FIXED: Table columns with proper accessor format
  const categoryTableColumns = useMemo(
    () => [
      {
        Header: "Rank",
        accessor: "rank",
        Cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm shadow-sm">
              {row.index + 1}
            </span>
          </div>
        ),
      },
      {
        Header: "Category",
        accessor: "category",
        Cell: ({ value }) => (
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-blue-500 mr-3"></div>
            <span className="font-semibold text-gray-900">{value}</span>
          </div>
        ),
      },
      {
        Header: "Order Count",
        accessor: "orderCount",
        Cell: ({ value }) => (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
            {value}
          </span>
        ),
      },
      {
        Header: "Total Quantity",
        accessor: "totalQuantity",
        Cell: ({ value }) => (
          <span className="text-gray-700 font-medium">{value}</span>
        ),
      },
      {
        Header: "Revenue",
        accessor: "totalRevenue",
        Cell: ({ value }) => (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
            ₹
            {parseFloat(value).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ),
      },
      {
        Header: "Items",
        accessor: "itemCount",
        Cell: ({ value }) => (
          <span className="text-gray-600 font-medium">{value}</span>
        ),
      },
    ],
    [],
  );

  const menuTableColumns = useMemo(
    () => [
      {
        Header: "Rank",
        accessor: "rank",
        Cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white font-bold text-sm shadow-sm">
              {row.index + 1}
            </span>
          </div>
        ),
      },
      {
        Header: "Menu Name",
        accessor: "menuName",
        Cell: ({ row }) => (
          <div>
            <p className="font-semibold text-gray-900">
              {row.original.menuName}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                {row.original.category}
              </span>
            </p>
          </div>
        ),
      },
      {
        Header: "Order Count",
        accessor: "orderCount",
        Cell: ({ value }) => (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
            {value}
          </span>
        ),
      },
      {
        Header: "Total Quantity",
        accessor: "totalQuantity",
        Cell: ({ value }) => (
          <span className="text-gray-700 font-medium">{value}</span>
        ),
      },
      {
        Header: "Avg Price",
        accessor: "avgPrice",
        Cell: ({ value }) => (
          <span className="text-gray-700 font-medium">
            ₹{parseFloat(value).toFixed(2)}
          </span>
        ),
      },
      {
        Header: "Total Revenue",
        accessor: "totalRevenue",
        Cell: ({ value }) => (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
            ₹
            {parseFloat(value).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ),
      },
    ],
    [],
  );

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

      if (res.success && selectedOrder?.id === orderId) {
        setSelectedOrder((s) => ({
          ...s,
          status: newStatus,
          normalizedStatus: newStatus,
        }));
      }
      return res;
    },
    [updateOrderStatus, selectedOrder],
  );

  const isLoading =
    loading || menuLoading || categoriesLoading || mainCategoryLoading;

  return (
    <AdminDashboardLayout>
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 py-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl shadow-lg p-4 sm:p-6 text-white">
          <PageTitle
            pageTitle={t("dashboard.title")}
            className="text-xl sm:text-2xl md:text-3xl font-bold mb-2"
          />
          <p className="text-blue-100 text-sm sm:text-base">
            {t("dashboard.welcome", {
              hotelName: selectedHotel?.name || hotelName,
            })}{" "}
            {t("dashboard.today")}
          </p>
        </div>

        {/* Enhanced Time Period Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
          <TimePeriodSelector
            selectedTimePeriod={selectedTimePeriod}
            onTimePeriodChange={handleTimePeriodChange}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            variant="default"
            showDatePicker={true}
            className="mb-0"
            options={timePeriodOptions}
            disableFutureDates={true}
          />
        </div>

        {/* Status info */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <span className="font-semibold text-gray-900 px-3 py-1 bg-blue-50 rounded-full">
              {periodDisplayText}
            </span>
            <span className="text-gray-700 px-3 py-1 bg-gray-50 rounded-full">
              {filteredOrders?.length || 0} Orders
            </span>
            {displayStats.revenue > 0 && (
              <span className="text-green-700 font-bold px-3 py-1 bg-green-50 rounded-full">
                ₹
                {displayStats.revenue.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            )}
            <span className="text-blue-700 font-semibold px-3 py-1 bg-blue-50 rounded-full">
              {displayStats.completionRate}% Complete
            </span>
          </div>
        </div>

        {/* Error handling */}
        {(error || menuError || categoriesError) && (
          <ErrorState
            title={t("dashboard.errorTitle")}
            message={error?.message || menuError || categoriesError}
            retryAction={handleRefresh}
          />
        )}

        {/* Loading state */}
        {isLoading &&
        !filteredOrders?.length &&
        !filteredAndSortedMenus?.length ? (
          <LoadingSpinner text={t("dashboard.loading")} />
        ) : (
          <>
            {/* Order Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
                value={`₹${(displayStats.revenue || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}`}
                icon={DollarSign}
                color="yellow"
              />
            </div>

            {/* Menu stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

            {/* Top 5 Menus by Orders - Horizontal Card Style */}
            {topMenusByOrders.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-sm">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    Top 5 Menu Items by Orders
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                  {topMenusByOrders.map((menu, index) => {
                    const rankColors = [
                      {
                        gradient: "from-yellow-400 to-orange-500",
                        text: "text-yellow-600",
                      },
                      {
                        gradient: "from-gray-400 to-gray-600",
                        text: "text-gray-600",
                      },
                      {
                        gradient: "from-orange-400 to-red-500",
                        text: "text-orange-600",
                      },
                      {
                        gradient: "from-blue-400 to-blue-600",
                        text: "text-blue-600",
                      },
                      {
                        gradient: "from-purple-400 to-purple-600",
                        text: "text-purple-600",
                      },
                    ];
                    const color = rankColors[index];

                    return (
                      <article
                        key={menu.menuId}
                        className="w-full h-28 sm:h-32"
                      >
                        <div className="h-full bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden relative group transition-all duration-300 ease-in-out transform hover:-translate-y-1 border border-gray-100 hover:border-orange-300 cursor-pointer">
                          <div className="flex h-full">
                            {/* Rank Section - Left Side (Image Replacement) */}
                            <div
                              className={`w-24 sm:w-32 flex-shrink-0 bg-gradient-to-br ${color.gradient} relative flex items-center justify-center`}
                            >
                              <div className="text-center z-10">
                                <div className="text-3xl sm:text-4xl font-black text-white mb-1">
                                  #{index + 1}
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full">
                                  Top Seller
                                </div>
                              </div>

                              {/* Decorative circles */}
                              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                              <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full -ml-6 -mb-6"></div>
                            </div>

                            {/* Order Count Badge - Top Right */}
                            <div className="absolute top-2 right-2 z-10">
                              <div className="flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                                <TrendingUp className="w-3 h-3" />
                                <span>{menu.orderCount} orders</span>
                              </div>
                            </div>

                            {/* Content Container */}
                            <div className="flex-1 p-3 flex flex-col justify-between relative min-w-0">
                              {/* Top Section */}
                              <div className="flex-1 pr-16">
                                {/* Menu Name */}
                                <h3 className="text-sm sm:text-base font-bold text-gray-800 leading-tight mb-2 line-clamp-2">
                                  {menu.menuName}
                                </h3>
                              </div>

                              {/* Bottom Section */}
                              <div className="flex items-center justify-between">
                                {/* Revenue Display */}
                                <div className="flex flex-col">
                                  <span className="text-xs text-gray-500">
                                    Total Revenue
                                  </span>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-lg sm:text-xl font-bold text-green-600">
                                      ₹
                                      {parseFloat(
                                        menu.totalRevenue,
                                      ).toLocaleString("en-IN", {
                                        maximumFractionDigits: 0,
                                      })}
                                    </span>
                                  </div>
                                </div>

                                {/* Stats Row */}
                                <div className="flex items-center gap-3 text-xs text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <ShoppingBag className="w-3 h-3 text-blue-500" />
                                    <span className="font-medium">
                                      {menu.totalQuantity} QTY
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Hover Effects */}
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-transparent to-red-50 opacity-0 group-hover:opacity-40 transition-all duration-500 pointer-events-none" />

                          {/* Animated glow effect */}
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-red-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none blur-sm" />
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Top 10 Orders by Category - Table */}
            {topOrdersByCategory.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className=" p-2 sm:p-4">
                  <div className="flex items-center gap-2 text-black">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                    <h2 className="text-lg sm:text-xl font-bold">
                      Top 10 Categories by Orders
                    </h2>
                  </div>
                </div>
                <div className=" overflow-x-auto">
                  <DynamicTable
                    columns={categoryTableColumns}
                    data={topOrdersByCategory}
                  />
                </div>
              </div>
            )}

            {/* Top 10 Orders by Menu - Table */}
            {topOrdersByMenu.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className=" p-2 sm:p-4">
                  <div className="flex items-center gap-2 text-black">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                    <h2 className="text-lg sm:text-xl font-bold">
                      Top 10 Menu Items by Orders
                    </h2>
                  </div>
                </div>
                <div className=" overflow-x-auto">
                  <DynamicTable
                    columns={menuTableColumns}
                    data={topOrdersByMenu}
                  />
                </div>
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
