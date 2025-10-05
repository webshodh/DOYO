import React, { useState, useMemo, useCallback, memo } from "react";
import { useParams } from "react-router-dom";
import {
  Phone,
  ShoppingCart,
  Users,
  Star,
  Award,
  Trophy,
  Crown,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { t } from "i18next";

// Layout and components
import PageTitle from "../../atoms/PageTitle";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import TabNavigation from "../../atoms/Buttons/TabNavigation";

// Reusable Customer Components
import CustomerOverviewStats from "../../components/Dashboard/CustomerOverviewStats";
import TopCustomers from "../../components/Dashboard/TopCustomers";
import CustomerSegmentation from "../../components/Dashboard/CustomerSegmentation";
import CustomerTableSection from "../../components/Dashboard/CustomerTableSection";
import CustomerAnalytics from "../../components/Dashboard/CustomerAnalytics";

// Hooks
import { useCustomers } from "../../hooks/useCustomers";

const CustomersPage = memo(() => {
  const { hotelName } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    customers,
    totalCustomers,
    loyalCustomers,
    totalRevenue,
    avgOrderValue,
    totalOrders,
    activeCustomers,
    oneTimeCustomers,
    repeatCustomers,
    frequentCustomers,
    superFrequentCustomers,
    eliteCustomers,
    error,
  } = useCustomers(hotelName);

  // Enhanced analytics calculations (keeping existing logic)
  const analytics = useMemo(() => {
    if (!customers || customers.length === 0) {
      return {
        revenueGrowth: 0,
        customerGrowth: 0,
        retentionRate: 0,
        avgLifetimeValue: 0,
        churnRate: 0,
        newCustomersThisMonth: 0,
        returningCustomersRate: 0,
      };
    }

    const currentDate = new Date();
    const lastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1
    );

    const newCustomersThisMonth = customers.filter((c) => {
      if (!c.firstOrderDate) return false;
      const orderDate = c.firstOrderDate.toDate
        ? c.firstOrderDate.toDate()
        : new Date(c.firstOrderDate);
      return orderDate >= lastMonth;
    }).length;

    const returningCustomers = customers.filter((c) => c.orderCount > 1).length;
    const returningCustomersRate =
      totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;
    const avgLifetimeValue =
      totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
    const retentionRate =
      totalCustomers > 0 ? (loyalCustomers / totalCustomers) * 100 : 0;

    return {
      revenueGrowth: 12.5,
      customerGrowth: 8.3,
      retentionRate: Math.round(retentionRate),
      avgLifetimeValue: Math.round(avgLifetimeValue),
      churnRate: Math.round(100 - retentionRate),
      newCustomersThisMonth,
      returningCustomersRate: Math.round(returningCustomersRate),
    };
  }, [customers, totalCustomers, totalRevenue, loyalCustomers]);

  // Filtered customers (keeping existing logic)
  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    let filtered = customers;

    if (selectedSegment !== "all") {
      filtered = filtered.filter((c) => {
        const orderCount = c.orderCount || 0;
        switch (selectedSegment) {
          case "new":
            return orderCount === 0;
          case "one-time":
            return orderCount === 1;
          case "repeat":
            return orderCount === 2;
          case "frequent":
            return orderCount >= 3 && orderCount <= 4;
          case "super-frequent":
            return orderCount >= 5 && orderCount <= 9;
          case "elite":
            return orderCount >= 10;
          default:
            return true;
        }
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name?.toLowerCase().includes(term) ||
          c.mobile?.includes(term) ||
          c.email?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [customers, searchTerm, selectedSegment]);

  // Top customers (keeping existing logic)
  const topCustomersByValue = useMemo(() => {
    if (!customers) return [];
    return [...customers]
      .filter((c) => typeof c.totalOrderValue === "number")
      .sort((a, b) => b.totalOrderValue - a.totalOrderValue)
      .slice(0, 5);
  }, [customers]);

  const topCustomersByVisits = useMemo(() => {
    if (!customers) return [];
    return [...customers]
      .filter((c) => typeof c.orderCount === "number")
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5);
  }, [customers]);

  // Helper function for customer segment badges (keeping existing logic)
  const getCustomerSegmentBadge = (orderCount) => {
    const val = orderCount || 0;
    let segment = {
      label: "New",
      color: "bg-blue-100 text-blue-800",
      icon: Sparkles,
    };

    if (val >= 10) {
      segment = {
        label: "Elite",
        color: "bg-purple-100 text-purple-800",
        icon: Crown,
      };
    } else if (val >= 5) {
      segment = {
        label: "Super",
        color: "bg-pink-100 text-pink-800",
        icon: Trophy,
      };
    } else if (val >= 3) {
      segment = {
        label: "Frequent",
        color: "bg-green-100 text-green-800",
        icon: Award,
      };
    } else if (val >= 2) {
      segment = {
        label: "Repeat",
        color: "bg-yellow-100 text-yellow-800",
        icon: Star,
      };
    } else if (val === 1) {
      segment = {
        label: "One-Time",
        color: "bg-gray-100 text-gray-800",
        icon: Users,
      };
    }

    const Icon = segment.icon;
    return (
      <span
        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${segment.color}`}
      >
        <Icon className="w-3 h-3" />
        <span>{segment.label}</span>
      </span>
    );
  };

  // Enhanced table columns (keeping existing logic)
  const ViewCustomerColumns = useMemo(
    () => [
      {
        accessor: "name",
        label: "Customer",
        sortable: true,
        render: (val, row) => (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm">
              {(val || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {val || "Unknown"}
              </div>
              <div className="text-xs text-gray-500 flex items-center space-x-1">
                <Phone className="w-3 h-3" />
                <span>{row.mobile || "N/A"}</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        accessor: "orderCount",
        label: "Orders",
        sortable: true,
        render: (val, row) => (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-gray-400" />
              <span className="font-bold text-gray-900">{val || 0}</span>
            </div>
            <div className="mt-1">{getCustomerSegmentBadge(val)}</div>
          </div>
        ),
      },
      {
        accessor: "totalOrderValue",
        label: "Total Spent",
        sortable: true,
        render: (val) => (
          <div className="text-center">
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 shadow-sm">
              ₹
              {(val || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        ),
      },
      {
        accessor: "averageOrderValue",
        label: "Avg Order",
        sortable: true,
        render: (val) => (
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              ₹
              {(val || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </div>
            <div className="text-xs text-gray-500">per order</div>
          </div>
        ),
      },
      {
        accessor: "lastOrderDate",
        label: "Last Visit",
        sortable: true,
        render: (val) => {
          if (!val)
            return (
              <div className="text-center">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                  Never
                </span>
              </div>
            );
          const date = val.toDate ? val.toDate() : new Date(val);
          const daysDiff = Math.floor(
            (new Date() - date) / (1000 * 60 * 60 * 24)
          );

          return (
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">
                {date.toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <div className="text-xs text-gray-500">
                {daysDiff === 0 ? "Today" : `${daysDiff}d ago`}
              </div>
            </div>
          );
        },
      },
      {
        accessor: "customerLifetimeValue",
        label: "LTV",
        sortable: true,
        render: (val, row) => (
          <div className="text-center">
            <div className="text-sm font-bold text-purple-600">
              ₹
              {((row.totalOrderValue || 0) * 1.5).toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
            <div className="text-xs text-gray-500">estimated</div>
          </div>
        ),
      },
    ],
    []
  );

  // Event handlers
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSegmentChange = useCallback((segment) => {
    setSelectedSegment(segment);
  }, []);

  // Tab configuration
  const tabs = [
    { id: "overview", name: "Overview", icon: Users },
    { id: "segments", name: "Segments", icon: Award },
    { id: "analytics", name: "Analytics", icon: TrendingUp },
  ];

  // Loading and error states
  if (customers === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading customers..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold">
            Error loading customers
          </p>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl shadow-lg p-4 sm:p-6 text-white mb-4">
        <PageTitle
          pageTitle={t("dashboard.title")}
          className="text-xl sm:text-2xl md:text-3xl font-bold mb-2"
        />
        <p className="text-blue-100 text-sm sm:text-base">
          {t("dashboard.welcome")}
        </p>
      </div>

      <div className="py-6 sm:py-8 space-y-8">
        {/* Tab Navigation */}
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={tabs}
        />

        {/* Tab Content */}
        {activeTab === "overview" && (
          <>
            {/* Customer Overview Stats */}
            <CustomerOverviewStats
              totalCustomers={totalCustomers}
              activeCustomers={activeCustomers}
              loyalCustomers={loyalCustomers}
              totalRevenue={totalRevenue}
              totalOrders={totalOrders}
              avgOrderValue={avgOrderValue}
            />

            {/* Top Customers Grid */}
            <TopCustomers
              topCustomersByValue={topCustomersByValue}
              topCustomersByVisits={topCustomersByVisits}
            />
          </>
        )}

        {activeTab === "segments" && (
          <>
            {/* Customer Segmentation */}
            <CustomerSegmentation
              oneTimeCustomers={oneTimeCustomers}
              repeatCustomers={repeatCustomers}
              frequentCustomers={frequentCustomers}
              superFrequentCustomers={superFrequentCustomers}
              eliteCustomers={eliteCustomers}
              selectedSegment={selectedSegment}
              onSegmentChange={handleSegmentChange}
            />

            {/* Customer Table Section */}
            <CustomerTableSection
              customers={customers}
              filteredCustomers={filteredCustomers}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              ViewCustomerColumns={ViewCustomerColumns}
              onClearSearch={() => setSearchTerm("")}
            />
          </>
        )}

        {activeTab === "analytics" && (
          <CustomerAnalytics analytics={analytics} />
        )}
      </div>
    </div>
  );
});

CustomersPage.displayName = "CustomersPage";

export default CustomersPage;
