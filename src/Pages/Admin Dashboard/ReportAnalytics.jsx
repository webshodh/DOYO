import React, { useState, useCallback, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  BarChart3,
  ChefHat,
  TrendingUp,
  Smartphone,
  Download,
  Mail,
  Camera,
} from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";

// Hooks
import { useOrder } from "../../hooks/useOrder";
import { useHotelSelection } from "../../context/HotelSelectionContext";
import { useMenu } from "hooks/useMenu";
import { useCategory } from "hooks/useCategory";
import { useMainCategory } from "hooks/useMainCategory";

// Layout and components
import AdminDashboardLayout from "../../layout/AdminDashboardLayout";
import { PageTitle } from "atoms";
import TimePeriodSelector from "../../atoms/Selector/TimePeriodSelector";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import ErrorState from "../../atoms/Messages/ErrorState";
import OrderDetailsModal from "../../components/Dashboard/OrderDetailsModal";

// Reusable Dashboard Components
import TabNavigation from "../../atoms/Buttons/TabNavigation";
import OrderAnalytics from "../../components/Dashboard/OrderAnalytics";
import RevenueOverview from "../../components/Dashboard/RevenueOverview";
import MenuOverview from "../../components/Dashboard/MenuOverview";
import MenuStatus from "../../components/Dashboard/MenuStatus";
import TopMenusByOrders from "../../components/Dashboard/TopMenusByOrders";
import TopOrdersByCategory from "../../components/Dashboard/TopOrdersByCategory";
import TopOrdersByMenu from "../../components/Dashboard/TopOrdersByMenu";
import PlatformAnalytics from "../../components/Dashboard/PlatformAnalytics";

// Other imports
import { useTranslation } from "react-i18next";
import { useHotelDetails } from "hooks/useHotel";
import ErrorBoundary from "atoms/ErrorBoundary";
import DashboardSkeleton from "atoms/Skeleton/DashboardSkeleton";
import OrderDetailsTable from "components/Dashboard/OrderDetailsTable";

const ReportAnalytics = () => {
  const { t } = useTranslation();
  const { hotelName } = useParams();
  const { selectedHotel } = useHotelSelection();
  const [activeTab, setActiveTab] = useState("Orders");
  const { isOrderEnabled } = useHotelDetails(hotelName);

  // Ref for screenshot capture
  const contentRef = useRef(null);

  // Modal & UI state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrderForBill, setSelectedOrderForBill] = useState(null);
  const [showPrintBill, setShowPrintBill] = useState(false);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);

  // Enhanced order data hook with comprehensive analytics
  const {
    orders,
    filteredOrders,

    orderStats,

    menuAnalytics,
    categoryAnalytics,
    platformAnalytics,
    loading,
    submitting,
    error,

    selectedDate,
    selectedTimePeriod,

    orderTypeFilter,
    platformFilter,
    priorityFilter,

    updateOrderStatus,
    refreshOrders,
    exportDataCSV: exportOrdersCSV,

    handleOrderTypeFilterChange,
    handlePlatformFilterChange,
    handlePriorityFilterChange,
    handleDateChange,
    handleTimePeriodChange,

    statusOptions,
    timePeriodOptions,
  } = useOrder(hotelName, {
    includeMenuData: true,
    defaultTimePeriod: "daily",
    defaultStatusFilter: "all",
    sortBy: "timestamp",
    sortOrder: "desc",
  });

  // Menu and categories data
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

  // Enhanced Stats with all new analytics
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
        avgOrderValue: 0,
        pendingOrders: 0,
        rejectionRate: 0,
        directOrders: 0,
        swiggyOrders: 0,
        zomatoOrders: 0,
        uberEatsOrders: 0,
        otherPlatformOrders: 0,
        dineInOrders: 0,
        takeawayOrders: 0,
        deliveryOrders: 0,
        cashPayments: 0,
        upiPayments: 0,
        cardPayments: 0,
        pendingPayments: 0,
        trends: {
          totalTrend: 0,
          revenueTrend: 0,
          completionTrend: 0,
        },
      };
    }

    const total = orderStats.total || 0;
    const received = orderStats.received || 0;
    const completed = orderStats.completed || 0;
    const rejected = orderStats.rejected || 0;
    const revenue = orderStats.totalRevenue || 0;
    const avgOrderValue = orderStats.avgOrderValue || 0;
    const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;

    return {
      total,
      received,
      completed,
      rejected,
      revenue,
      activeOrders: received,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      avgOrderValue,
      pendingOrders: received,
      rejectionRate,
      directOrders: orderStats.totalDirectOrders || 0,
      swiggyOrders: orderStats.totalSwiggyOrders || 0,
      zomatoOrders: orderStats.totalZomatoOrders || 0,
      uberEatsOrders: orderStats.totalUberEatsOrders || 0,
      otherPlatformOrders:
        (orderStats.totalDunzoOrders || 0) +
        (orderStats.totalAmazonFoodOrders || 0) +
        (orderStats.totalOtherPlatformOrders || 0),
      dineInOrders: orderStats.totalDineInOrders || 0,
      takeawayOrders: orderStats.totalTakeawayOrders || 0,
      deliveryOrders: orderStats.totalDeliveryOrders || 0,
      cashPayments: orderStats.cashPayments || 0,
      upiPayments: orderStats.upiPayments || 0,
      cardPayments: orderStats.cardPayments || 0,
      pendingPayments: orderStats.pendingPayments || 0,
      directRevenue: orderStats.directRevenue || 0,
      swiggyRevenue: orderStats.swiggyRevenue || 0,
      zomatoRevenue: orderStats.zomatoRevenue || 0,
      uberEatsRevenue: orderStats.uberEatsRevenue || 0,
      totalPlatformCommission: orderStats.totalPlatformCommission || 0,
      trends: {
        totalTrend: Math.floor(Math.random() * 20) - 10,
        revenueTrend: Math.floor(Math.random() * 30) - 15,
        completionTrend: Math.floor(Math.random() * 10) - 5,
      },
    };
  }, [orderStats]);

  // Enhanced Menu statistics
  const menuStats = useMemo(() => {
    if (!filteredAndSortedMenus || filteredAndSortedMenus.length === 0) {
      return {
        total: 0,
        available: 0,
        unavailable: 0,
        discounted: 0,
        uniqueCategories: 0,
        featuredItems: 0,
        newItems: 0,
      };
    }

    const total = filteredAndSortedMenus.length;
    const available = filteredAndSortedMenus.filter(
      (m) => m.availability === "Available"
    ).length;
    const unavailable = total - available;
    const discounted = filteredAndSortedMenus.filter(
      (m) => m.discount && m.discount > 0
    ).length;
    const uniqueCategories = new Set(
      filteredAndSortedMenus.map((m) => m.menuCategory || "Other")
    ).size;
    const featuredItems = filteredAndSortedMenus.filter(
      (m) => m.featured || m.isFeatured
    ).length;
    const newItems = filteredAndSortedMenus.filter((m) => {
      if (m.createdAt) {
        const itemDate = new Date(m.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return itemDate > weekAgo;
      }
      return false;
    }).length;

    return {
      total,
      available,
      unavailable,
      discounted,
      uniqueCategories,
      featuredItems,
      newItems,
    };
  }, [filteredAndSortedMenus]);

  // Top performing data using enhanced analytics
  const topMenusByOrders = useMemo(() => {
    return menuAnalytics?.topMenus?.slice(0, 5) || [];
  }, [menuAnalytics]);

  const topOrdersByCategory = useMemo(() => {
    return categoryAnalytics?.categoryStats?.slice(0, 5) || [];
  }, [categoryAnalytics]);

  const topOrdersByMenu = useMemo(() => {
    return menuAnalytics?.menuStats?.slice(0, 5) || [];
  }, [menuAnalytics]);

  // Screenshot capture utility
  const captureScreenshot = useCallback(async (options = {}) => {
    if (!contentRef.current) {
      toast.error("Content not found for screenshot");
      return null;
    }

    try {
      setIsCapturingScreenshot(true);

      const canvas = await html2canvas(contentRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#f9fafb",
        scale: 2, // Higher quality
        logging: false,
        ignoreElements: (element) => {
          // Ignore elements with data-html2canvas-ignore attribute
          return element.getAttribute("data-html2canvas-ignore") === "true";
        },
        ...options,
      });

      const dataURL = canvas.toDataURL("image/png", 1.0);
      return dataURL;
    } catch (error) {
      console.error("Error capturing screenshot:", error);
      toast.error("Failed to capture screenshot");
      return null;
    } finally {
      setIsCapturingScreenshot(false);
    }
  }, []);

  // Download screenshot functionality
  const handleDownloadScreenshot = useCallback(async () => {
    const dataURL = await captureScreenshot();
    if (!dataURL) return;

    try {
      const link = document.createElement("a");
      link.download = `${hotelName}_Analytics_Report_${
        new Date().toISOString().split("T")[0]
      }.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Screenshot downloaded successfully!");
    } catch (error) {
      console.error("Error downloading screenshot:", error);
      toast.error("Failed to download screenshot");
    }
  }, [captureScreenshot, hotelName]);

  // Event handlers
  const handleViewDetails = useCallback((order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedOrder(null);
    setShowOrderDetails(false);
  }, []);

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
    [updateOrderStatus, selectedOrder]
  );

  const handlePrintBill = useCallback((order) => {
    setSelectedOrderForBill(order);
    setShowPrintBill(true);
  }, []);

  const isLoading =
    loading || menuLoading || categoriesLoading || mainCategoryLoading;

  return (
    <div className="min-h-screen">
      {/* Enhanced Header Section with Action Buttons */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl shadow-lg p-4 sm:p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <PageTitle
              pageTitle={t("dashboard.title")}
              className="text-xl sm:text-2xl md:text-3xl font-bold mb-2"
            />
            <p className="text-orange-100 text-sm sm:text-base">
              {t("dashboard.welcome", {
                hotelName: selectedHotel?.name || hotelName,
              })}{" "}
              {t("dashboard.today")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3" data-html2canvas-ignore="true">
            <button
              onClick={handleDownloadScreenshot}
              disabled={isCapturingScreenshot}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {isCapturingScreenshot ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download Report
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - This will be captured in screenshot */}
      <div ref={contentRef} className="py-2 sm:py-4 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-center mt-2">
          {/* Time Period Selector */}
          {isOrderEnabled && (
            <div className="mt-2">
              <TimePeriodSelector
                selectedTimePeriod={selectedTimePeriod}
                onTimePeriodChange={handleTimePeriodChange}
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                variant="compact"
                showDatePicker={true}
                className="mb-0"
                options={timePeriodOptions}
                disableFutureDates={true}
              />
            </div>
          )}
        </div>

        {/* Error handling */}
        {(error || menuError || categoriesError) && (
          <ErrorBoundary error={error || menuError || categoriesError} />
        )}

        {/* Loading state */}
        {isLoading ? (
          <DashboardSkeleton
            activeTab={activeTab}
            isOrderEnabled={isOrderEnabled}
          />
        ) : (
          <>
            <MenuOverview menuStats={menuStats} />
            <OrderAnalytics displayStats={displayStats} />

            <PlatformAnalytics
              displayStats={displayStats}
              platformAnalytics={platformAnalytics}
              orderTypeFilter={orderTypeFilter}
              platformFilter={platformFilter}
              priorityFilter={priorityFilter}
              onOrderTypeFilterChange={handleOrderTypeFilterChange}
              onPlatformFilterChange={handlePlatformFilterChange}
              onPriorityFilterChange={handlePriorityFilterChange}
            />
            <RevenueOverview displayStats={displayStats} />

            <MenuStatus menuStats={menuStats} />

            <TopMenusByOrders topMenusByOrders={topMenusByOrders} />
            <TopOrdersByCategory topOrdersByCategory={topOrdersByCategory} />
            <TopOrdersByMenu topOrdersByMenu={topOrdersByMenu} />

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-xl font-bold text-gray-900">
                      Recent Orders
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      Showing {filteredOrders.length} of {orders.length} orders
                    </span>
                  </div>
                </div>

                <OrderDetailsTable
                  orders={filteredOrders.slice(0, 20)}
                  onViewDetails={handleViewDetails}
                  onUpdateStatus={handleUpdateStatus}
                  isUpdating={submitting}
                  onPrintBill={handlePrintBill}
                  showEnhancedColumns={true}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Loading Overlay for Screenshot */}
      {isCapturingScreenshot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3 shadow-lg">
            <Camera className="w-6 h-6 text-blue-600 animate-pulse" />
            <div>
              <p className="font-medium text-gray-900">
                Capturing Screenshot...
              </p>
              <p className="text-sm text-gray-600">
                Please wait while we generate your report
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showOrderDetails && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={handleCloseDetails}
          onStatusUpdate={handleUpdateStatus}
          isSubmitting={submitting}
          orderStatuses={statusOptions}
          showEnhancedDetails={true}
        />
      )}
    </div>
  );
};

export default ReportAnalytics;
