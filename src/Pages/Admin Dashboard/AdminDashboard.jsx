import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { db } from "../../data/firebase/firebaseConfig";
import { LoaderCircle, Calendar } from "lucide-react";
import { useHotelSelection } from "../../context/HotelSelectionContext";
import AdminDashboardLayout from "../AdminDashboardLayout";
import AddMenu from "./AddMenu";
import { useCategoriesData, useMainCategoriesData, useMenuData } from "data";
import StatCard from "components/Cards/StatCard";
import useOptionsData from "data/useOptionsData";
import { simplifyOptions } from "utility/ConvertOptions";
import { Spinner } from "atoms";
import ErrorState from "atoms/Messages/ErrorState";
import OrderDetailsModal from "components/order-dashboard/OrderDetailsModal";
import OrderDetailsTable from "components/order-dashboard/OrderDetailsTable";
import OrdersByCategory from "components/order-dashboard/OrdersByCategory";
import TopMenuCards from "components/Cards/TopMenuCard";
import OrdersByMenu from "components/order-dashboard/OrdersByMenu";

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("daily");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const { hotelName } = useParams();
  const { selectedHotel } = useHotelSelection();

  const {
    menuData,
    totalMenus,
    loading: menuLoading,
    error: menuError,
  } = useMenuData(hotelName);

  const {
    categoriesData,
    totalCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategoriesData(hotelName);

  const { optionsData, totalOptionsCount, categories, optionTypes, error } =
    useOptionsData(hotelName);

  console.log("categories1231", totalOptionsCount);
  const optionsCategoryCount = categories.length;

  const { mainCategoriesData, totalMainCategories } =
    useMainCategoriesData(hotelName);
  console.log("mainCategoriesData_____", mainCategoriesData);

  // Helper functions for date ranges
  const getCurrentWeekRange = () => {
    const now = new Date();
    const first = now.getDate() - now.getDay();
    const firstday = new Date(now.setDate(first));
    const lastday = new Date(firstday);
    lastday.setDate(firstday.getDate() + 6);
    return { start: firstday, end: lastday };
  };

  const getCurrentMonthRange = () => {
    const now = new Date();
    const firstday = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastday = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: firstday, end: lastday };
  };

  const isDateInRange = (orderDate, startDate, endDate) => {
    const date = new Date(orderDate);
    date.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return date >= start && date <= end;
  };

  // Fetch orders data
  useEffect(() => {
    if (!hotelName) return;

    const ordersRef = ref(db, `/hotels/${hotelName}/orders`);
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ordersArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        setOrders(
          ordersArray.sort(
            (a, b) =>
              new Date(b.timestamps?.orderPlaced || 0) -
              new Date(a.timestamps?.orderPlaced || 0)
          )
        );
      } else {
        setOrders([]);
      }
    });

    // Set menus from menuData when available
    if (menuData) {
      setMenus(menuData);
    }
  }, [hotelName, menuData]);

  // Filter orders by time period
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    if (selectedTimePeriod === "daily") {
      filtered = filtered.filter((order) => {
        const orderDateStr =
          order.timestamps?.orderDate ||
          new Date(order.timestamps?.orderPlaced).toISOString().split("T")[0];
        return orderDateStr === selectedDate;
      });
    } else if (selectedTimePeriod === "weekly") {
      const { start, end } = getCurrentWeekRange();
      filtered = filtered.filter((order) => {
        const orderDate =
          order.timestamps?.orderDate ||
          new Date(order.timestamps?.orderPlaced).toISOString().split("T")[0];
        return isDateInRange(orderDate, start, end);
      });
    } else if (selectedTimePeriod === "monthly") {
      const { start, end } = getCurrentMonthRange();
      filtered = filtered.filter((order) => {
        const orderDate =
          order.timestamps?.orderDate ||
          new Date(order.timestamps?.orderPlaced).toISOString().split("T")[0];
        return isDateInRange(orderDate, start, end);
      });
    }

    return filtered;
  }, [orders, selectedDate, selectedTimePeriod]);

  // Calculate order statistics
  const orderStats = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const completedOrders = filteredOrders.filter(
      (o) => (o.kitchen?.status || o.status) === "completed"
    ).length;
    const rejectedOrders = filteredOrders.filter(
      (o) => (o.kitchen?.status || o.status) === "rejected"
    ).length;
    const pendingOrders = filteredOrders.filter(
      (o) => (o.kitchen?.status || o.status || "received") === "received"
    ).length;

    const totalRevenue = filteredOrders
      .filter((o) => (o.kitchen?.status || o.status) === "completed")
      .reduce((sum, order) => sum + (order.pricing?.total || 0), 0);

    const avgOrderValue =
      totalOrders > 0 ? Math.round(totalRevenue / completedOrders) || 0 : 0;

    // Calculate peak hour
    const hourCounts = {};
    filteredOrders.forEach((order) => {
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
      filteredOrders
        .map((o) => o.tableNumber || o.customerInfo?.tableNumber)
        .filter(Boolean)
    );

    return {
      totalOrders,
      completedOrders,
      rejectedOrders,
      pendingOrders,
      totalRevenue,
      avgOrderValue,
      peakHour: peakHour !== "0" ? `${peakHour}:00` : "N/A",
      uniqueCustomers: uniqueTables.size,
    };
  }, [filteredOrders]);
  // Calculate top menu items
  const topMenus = useMemo(() => {
    const menuStats = {};

    filteredOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const menuId = item.menuId || item.id;
        if (!menuStats[menuId]) {
          menuStats[menuId] = {
            menu: menus.find((m) => m.id === menuId) || item,
            orderCount: 0,
            revenue: 0,
          };
        }
        menuStats[menuId].orderCount += item.quantity || 1;
        menuStats[menuId].revenue += item.itemTotal || item.finalPrice || 0;
      });
    });

    return Object.values(menuStats)
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 3);
  }, [filteredOrders, menus]);

  // Calculate menu statistics
  const menuStats = useMemo(() => {
    const menuData = {};
    let totalMenuOrders = 0;

    filteredOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const menuName = item.menuName || "Unknown Menu";
        if (!menuData[menuName]) {
          menuData[menuName] = {
            orderCount: 0,
            revenue: 0,
            imageUrl:
              item.imageUrl ||
              menus.find((m) => m.menuName === menuName)?.imageUrl,
          };
        }
        menuData[menuName].orderCount += item.quantity || 1;
        menuData[menuName].revenue += item.itemTotal || item.finalPrice || 0;
        totalMenuOrders += item.quantity || 1;
      });
    });

    return Object.entries(menuData)
      .map(([menuName, data]) => ({
        menuName,
        orderCount: data.orderCount,
        revenue: data.revenue,
        imageUrl: data.imageUrl,
        percentage:
          totalMenuOrders > 0 ? (data.orderCount / totalMenuOrders) * 100 : 0,
      }))
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 10); // Top 10 menus
  }, [filteredOrders, menus]);

  // Calculate category statistics
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

  const handleTimePeriodChange = useCallback((period) => {
    setSelectedTimePeriod(period);
    if (period === "daily") {
      setSelectedDate(new Date().toISOString().split("T")[0]);
    }
  }, []);

  const handleViewDetails = useCallback((order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  }, []);

  const getPeriodDisplayText = () => {
    switch (selectedTimePeriod) {
      case "daily":
        return `Analytics for ${selectedDate}`;
      case "weekly":
        const weekRange = getCurrentWeekRange();
        return `Analytics for this week (${weekRange.start.toLocaleDateString()} - ${weekRange.end.toLocaleDateString()})`;
      case "monthly":
        const monthRange = getCurrentMonthRange();
        return `Analytics for ${monthRange.start.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}`;
      case "total":
        return "All-time analytics";
      default:
        return "Analytics";
    }
  };
  return (
    <AdminDashboardLayout>
      {/* Dashboard Content - Now properly contained within layout */}
      <div className="space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div>
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-3">
              Dashboard Overview
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed max-w-2xl">
              Welcome back! Here's what's happening at{" "}
              <span className="font-semibold text-orange-600">
                {selectedHotel?.name || "your hotel"}
              </span>{" "}
              today.
            </p>
          </div>
        </div>

        {/* NEW ANALYTICS SECTION */}
        {/* Time Period Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Order Analytics
              </h2>
              <p className="text-gray-600">
                Comprehensive insights and performance metrics
              </p>
            </div>
            <div className="flex items-center gap-4">
              {selectedTimePeriod === "daily" && (
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                  <Calendar size={16} className="text-gray-500" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="bg-transparent border-none focus:outline-none text-sm"
                  />
                </div>
              )}
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <LoaderCircle size={16} />
                Refresh
              </button>
            </div>
          </div>

          {/* Time Period Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {[
                { key: "daily", label: "Today" },
                { key: "weekly", label: "This Week" },
                { key: "monthly", label: "This Month" },
                { key: "total", label: "All Time" },
              ].map((period) => (
                <button
                  key={period.key}
                  onClick={() => handleTimePeriodChange(period.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTimePeriod === period.key
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {getPeriodDisplayText()}
            </div>
          </div>
        </div>

        {/* Stats Grid - Enhanced Responsive Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Total Menu Items"
              value={totalMenus || 0}
              color="bg-gradient-to-br from-blue-50 to-blue-100"
              icon={
                <div className="p-2 bg-blue-500 rounded-lg">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              }
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Total Categories"
              value={totalCategories || 0}
              color="bg-gradient-to-br from-green-50 to-green-100"
              icon={
                <div className="p-2 bg-green-500 rounded-lg">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              }
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Options Categories"
              value={optionsCategoryCount || 0}
              color="bg-gradient-to-br from-purple-50 to-purple-100"
              icon={
                <div className="p-2 bg-purple-500 rounded-lg">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    />
                  </svg>
                </div>
              }
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Options for Options Categories"
              value={totalOptionsCount || 0}
              color="bg-gradient-to-br from-orange-50 to-orange-100"
              icon={
                <div className="p-2 bg-orange-500 rounded-lg">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              }
            />
          </div>
        </div>
        {/* Order Statistics Cards - Using Same Style as Existing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Total Orders"
              value={orderStats.totalOrders || 0}
              color="bg-gradient-to-br from-indigo-50 to-indigo-100"
              icon={
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
              }
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Completed Orders"
              value={orderStats.completedOrders || 0}
              color="bg-gradient-to-br from-emerald-50 to-emerald-100"
              icon={
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              }
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Rejected Orders"
              value={orderStats.rejectedOrders || 0}
              color="bg-gradient-to-br from-red-50 to-red-100"
              icon={
                <div className="p-2 bg-red-500 rounded-lg">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              }
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Total Revenue"
              value={`₹${orderStats.totalRevenue?.toLocaleString() || 0}`}
              color="bg-gradient-to-br from-yellow-50 to-yellow-100"
              icon={
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
              }
            />
          </div>
        </div>
        {/* Top Menu Items */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
          <TopMenuCards topMenus={topMenus} title="Top Performing Menu Items" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Orders by Category */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
            <OrdersByCategory categoryData={categoryStats} />
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Insights
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-semibold text-green-600">
                  {orderStats.totalOrders > 0
                    ? (
                        (orderStats.completedOrders / orderStats.totalOrders) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Rejection Rate</span>
                <span className="font-semibold text-red-600">
                  {orderStats.totalOrders > 0
                    ? (
                        (orderStats.rejectedOrders / orderStats.totalOrders) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Order Value</span>
                <span className="font-semibold text-purple-600">
                  ₹{orderStats.avgOrderValue || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Peak Hour</span>
                <span className="font-semibold text-orange-600">
                  {orderStats.peakHour}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Orders by Category and Quick Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders by Menu */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
            <OrdersByMenu menuData={menuStats} />
          </div>
        </div>

        {/* Orders Table */}
        {orders.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
            <OrderDetailsTable
              orders={filteredOrders}
              onViewDetails={handleViewDetails}
            />
          </div>
        )}
        {/* Loading States */}
        {(menuLoading || categoriesLoading) && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <Spinner />
            </div>
          </div>
        )}

        {/* Error States */}
        {(menuError || categoriesError || error) && (
          <ErrorState size={"md"} message={menuError} />
        )}

        {/* AddMenu Component - Enhanced Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
          <div className="p-0">
            <AddMenu onlyView={true} />
          </div>
        </div>
        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={handleCloseDetails}
          />
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;
