import React, { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { BarChart3, ShoppingBag, Users } from "lucide-react";

// Hooks and utilities
import { useOrderData } from "../../customHooks/useOrder";
import {
  useCategoriesData,
  useMainCategoriesData,
  useMenuData,
} from "../../data";
import useOptionsData from "../../data/useOptionsData";

// Context
import { useHotelSelection } from "../../context/HotelSelectionContext";

// Layout and UI components
import AdminDashboardLayout from "../../layout/AdminDashboardLayout";
import StatCard from "../../components/Cards/StatCard";
import TopMenuCards from "../../components/Cards/TopMenuCard";
import { DynamicTable } from "../../components";
import { OrderInsights } from "../../molecules/OrderInsights";
import TimePeriodSelector from "../../atoms/TimePeriodSelector";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import ErrorState from "../../atoms/Messages/ErrorState";
import OrderDetailsModal from "../../components/order-dashboard/OrderDetailsModal";
import OrderDetailsTable from "../../components/order-dashboard/OrderDetailsTable";

// Constants
import {
  OrdersByCategoryColumn,
  OrdersByMenuColumn,
} from "../../Constants/Columns";

/**
 * Admin Dashboard Component
 * Provides comprehensive analytics and management interface for hotel orders
 */
const AdminDashboard = () => {
  const { hotelName } = useParams();
  const { selectedHotel } = useHotelSelection();

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Enhanced order data hook with menu data for analytics
  const {
    orders,
    filteredOrders,
    timeFilteredOrders,
    menuData,
    orderStats,
    menuAnalytics,
    categoryAnalytics,
    loading,
    error,
    selectedDate,
    selectedTimePeriod,
    handleDateChange,
    handleTimePeriodChange,
    periodDisplayText,
    hasOrders,
    updateOrderStatus,
  } = useOrderData(hotelName, {
    includeMenuData: true,
    defaultTimePeriod: "daily",
  });

  // Menu and category management data
  const {
    menuData: managementMenuData,
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

  const {
    optionsData,
    totalOptionsCount,
    categories,
    optionTypes,
    error: optionsError,
  } = useOptionsData(hotelName);

  // Derived values
  const optionsCategoryCount = categories?.length || 0;
  const { totalMainCategories } = useMainCategoriesData(hotelName);

  // Event handlers
  const handleViewDetails = useCallback((order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  }, []);

  // Loading state for menu management data
  const isMenuManagementLoading = menuLoading || categoriesLoading;

  // Error state for menu management data
  const menuManagementError = menuError || categoriesError || optionsError;
console.log("menuAnalytics.topMenus", menuAnalytics.topMenus)
  return (
    <AdminDashboardLayout>
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

        {/* Analytics Section */}
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
          </div>

          {/* Time Period Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <TimePeriodSelector
              selectedTimePeriod={selectedTimePeriod}
              onTimePeriodChange={handleTimePeriodChange}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              variant="default"
              showDatePicker={true}
              className="mb-6"
            />

            {/* Period Display Text */}
            <div className="mt-4 text-sm text-gray-600 font-medium">
              {periodDisplayText}
            </div>
          </div>
        </div>

        {/* Menu Management Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Total Menu Items"
              value={totalMenus || 0}
              color="bg-gradient-to-br from-blue-50 to-blue-100"
              icon={Users}
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Total Categories"
              value={totalCategories || 0}
              color="bg-gradient-to-br from-green-50 to-green-100"
              icon={Users}
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Options Categories"
              value={optionsCategoryCount}
              color="bg-gradient-to-br from-purple-50 to-purple-100"
              icon={Users}
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Total Options"
              value={totalOptionsCount || 0}
              color="bg-gradient-to-br from-orange-50 to-orange-100"
              icon={Users}
            />
          </div>
        </div>

        {/* Order Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Total Orders"
              value={orderStats.total}
              color="bg-gradient-to-br from-indigo-50 to-indigo-100"
              icon={Users}
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Completed Orders"
              value={orderStats.completed}
              color="bg-gradient-to-br from-emerald-50 to-emerald-100"
              icon={Users}
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Rejected Orders"
              value={orderStats.rejected}
              color="bg-gradient-to-br from-red-50 to-red-100"
              icon={Users}
            />
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <StatCard
              title="Total Revenue"
              value={`₹${orderStats.totalRevenue?.toLocaleString() || 0}`}
              color="bg-gradient-to-br from-yellow-50 to-yellow-100"
              icon={Users}
            />
          </div>
        </div>

        {/* Top Menu Items */}
        {menuAnalytics.topMenus.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
            <TopMenuCards
              topMenus={menuAnalytics.topMenus}
              title="Top Performing Menu Items"
            />
          </div>
        )}

        {/* Analytics Tables and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders by Category */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Orders by Category
                </h2>
              </div>

              <DynamicTable
                columns={OrdersByCategoryColumn}
                data={categoryAnalytics.categoryStats}
                showPagination={false}
                showRowsPerPage={false}
                emptyMessage="No category data available"
                className="border-0 shadow-none"
                headerClassName="bg-gradient-to-r from-blue-500 to-blue-600"
              />
            </div>
          </div>

          {/* Order Insights */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-6">
            <OrderInsights analytics={orderStats} />
          </div>
        </div>

        {/* Orders by Menu */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingBag className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Orders by Menu
            </h2>
          </div>

          <DynamicTable
            columns={OrdersByMenuColumn}
            data={menuAnalytics.menuStats}
            showPagination={menuAnalytics.menuStats.length > 10}
            showRowsPerPage={menuAnalytics.menuStats.length > 10}
            initialRowsPerPage={10}
            rowsPerPageOptions={[5, 10, 15, 20]}
            emptyMessage="No menu data available"
            className="border-0 shadow-none"
            headerClassName="bg-gradient-to-r from-purple-500 to-purple-600"
            sortable={true}
            onSort={(sortConfig) => {
              // Optional: Handle sorting if needed
              console.log("Sort config:", sortConfig);
            }}
          />
        </div>

        {/* Recent Orders Table */}
        {hasOrders && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-gray-700" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Orders
                  </h2>
                </div>
                <div className="text-sm text-gray-600">
                  Showing {timeFilteredOrders.length} of {orders.length} orders
                </div>
              </div>

              <OrderDetailsTable
                orders={timeFilteredOrders}
                onViewDetails={handleViewDetails}
                onUpdateStatus={updateOrderStatus}
              />
            </div>
          </div>
        )}

        {/* Loading States */}
        {(loading || isMenuManagementLoading) && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" text="Loading dashboard data..." />
          </div>
        )}

        {/* Error States */}
        {(error || menuManagementError) && (
          <div className="py-8">
            <ErrorState
              size="md"
              message={error || menuManagementError}
              title="Dashboard Error"
              showRetry={true}
              onRetry={() => window.location.reload()}
            />
          </div>
        )}

        {/* Empty State - No Orders */}
        {!loading && !error && !hasOrders && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-12">
            <div className="text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Orders Yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Your dashboard will come alive once you start receiving orders.
                Check your menu setup and ensure everything is configured
                correctly.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Refresh Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={handleCloseDetails}
            onUpdateStatus={updateOrderStatus}
          />
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;
