import React, { useState, useMemo, useCallback, memo, Suspense } from "react";
import {
  Users,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Phone,
  Award,
  UserCheck,
  Star,
  Trophy,
  Crown,
  Heart,
  Zap,
  Target,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ChefHat,
  Gift,
  Eye,
  Filter,
} from "lucide-react";
import { useParams } from "react-router-dom";
import PageTitle from "../../atoms/PageTitle";
import StatCard from "../../components/Cards/StatCard";
import SearchWithResults from "../../molecules/SearchWithResults";
import EmptyState from "atoms/Messages/EmptyState";
import NoSearchResults from "molecules/NoSearchResults";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import { useCustomers } from "../../hooks/useCustomers";
import { t } from "i18next";

const DynamicTable = React.lazy(() => import("../../organisms/DynamicTable"));

const CustomersPage = memo(() => {
  const { hotelName } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSegment, setSelectedSegment] = useState("all");

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

  const [searchTerm, setSearchTerm] = useState("");

  // Enhanced analytics calculations
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
      revenueGrowth: 12.5, // Mock data
      customerGrowth: 8.3,
      retentionRate: Math.round(retentionRate),
      avgLifetimeValue: Math.round(avgLifetimeValue),
      churnRate: Math.round(100 - retentionRate),
      newCustomersThisMonth,
      returningCustomersRate: Math.round(returningCustomersRate),
    };
  }, [customers, totalCustomers, totalRevenue, loyalCustomers]);

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    let filtered = customers;

    // Apply segment filter
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

    // Apply search filter
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

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  // Enhanced table columns
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

  // Helper function for customer segment badges
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

      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
          <div className="border-b border-gray-200/50">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: "overview", name: "Overview", icon: Eye },
                { id: "segments", name: "Segments", icon: Filter },
                { id: "analytics", name: "Analytics", icon: Activity },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all duration-200 ${
                      activeTab === tab.id
                        ? "border-orange-500 text-orange-600 bg-orange-50/50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Primary Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <StatCard
                icon={Users}
                title="Total Customers"
                value={totalCustomers}
                color="blue"
              />
              <StatCard
                icon={UserCheck}
                title="Active (7d)"
                value={activeCustomers}
                color="green"
              />
              <StatCard
                icon={Award}
                title="Loyal (2+ orders)"
                value={loyalCustomers}
                color="purple"
              />
              <StatCard
                icon={DollarSign}
                title="Total Revenue"
                value={`₹${totalRevenue.toLocaleString("en-IN")}`}
                color="yellow"
              />
              <StatCard
                icon={ShoppingCart}
                title="Total Orders"
                value={totalOrders}
                color="orange"
              />
              <StatCard
                icon={TrendingUp}
                title="Avg Order"
                value={`₹${avgOrderValue.toFixed(2)}`}
                color="pink"
              />
            </div>

            {/* Top Customers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-sm">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      🏆 Top Customers by Revenue
                    </h2>
                    <p className="text-gray-500 text-sm">
                      Highest value customers
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {topCustomersByValue.map((c, idx) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${
                            idx === 0
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white"
                              : idx === 1
                              ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white"
                              : idx === 2
                              ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white"
                              : "bg-gradient-to-br from-blue-400 to-blue-500 text-white"
                          }`}
                        >
                          {idx < 3 ? ["🥇", "🥈", "🥉"][idx] : idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {c.name || "Unknown"}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Phone className="w-3 h-3" />
                            <span>{c.mobile || "N/A"}</span>
                            <span>•</span>
                            <span>{c.orderCount || 0} orders</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-lg">
                          ₹
                          {c.totalOrderValue?.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          }) || "0"}
                        </p>
                        <p className="text-xs text-green-600 font-medium">
                          ₹
                          {(
                            (c.totalOrderValue || 0) / (c.orderCount || 1)
                          ).toFixed(0)}{" "}
                          avg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-green-400 to-green-500 rounded-xl shadow-sm">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      ⭐ Most Frequent Visitors
                    </h2>
                    <p className="text-gray-500 text-sm">
                      Regular customers by visits
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {topCustomersByVisits.map((c, idx) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${
                            idx === 0
                              ? "bg-gradient-to-br from-green-400 to-green-500 text-white"
                              : idx === 1
                              ? "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white"
                              : idx === 2
                              ? "bg-gradient-to-br from-teal-400 to-teal-500 text-white"
                              : "bg-gradient-to-br from-cyan-400 to-cyan-500 text-white"
                          }`}
                        >
                          {idx < 3 ? ["👑", "🌟", "💎"][idx] : idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {c.name || "Unknown"}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Phone className="w-3 h-3" />
                            <span>{c.mobile || "N/A"}</span>
                            <span>•</span>
                            <span>
                              ₹
                              {c.totalOrderValue?.toLocaleString("en-IN", {
                                maximumFractionDigits: 0,
                              }) || "0"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-lg">
                          {c.orderCount || 0} visits
                        </p>
                        <div className="text-xs">
                          {getCustomerSegmentBadge(c.orderCount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Segments Tab */}
        {activeTab === "segments" && (
          <>
            {/* Customer Segmentation */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Filter className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Customer Segmentation
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Analyze customers by behavior and value
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <button
                  onClick={() => setSelectedSegment("one-time")}
                  className={`text-center p-4 rounded-xl transition-all duration-200 ${
                    selectedSegment === "one-time"
                      ? "bg-gray-100 border-2 border-gray-400"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <p className="text-2xl font-bold text-gray-900">
                    {oneTimeCustomers}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">One-Time</p>
                  <p className="text-xs text-gray-500">1 order</p>
                </button>

                <button
                  onClick={() => setSelectedSegment("repeat")}
                  className={`text-center p-4 rounded-xl transition-all duration-200 ${
                    selectedSegment === "repeat"
                      ? "bg-yellow-100 border-2 border-yellow-400"
                      : "bg-yellow-50 hover:bg-yellow-100"
                  }`}
                >
                  <Star className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                  <p className="text-2xl font-bold text-yellow-900">
                    {repeatCustomers}
                  </p>
                  <p className="text-sm text-yellow-700 font-medium">Repeat</p>
                  <p className="text-xs text-yellow-600">2 orders</p>
                </button>

                <button
                  onClick={() => setSelectedSegment("frequent")}
                  className={`text-center p-4 rounded-xl transition-all duration-200 ${
                    selectedSegment === "frequent"
                      ? "bg-green-100 border-2 border-green-400"
                      : "bg-green-50 hover:bg-green-100"
                  }`}
                >
                  <Award className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold text-green-900">
                    {frequentCustomers}
                  </p>
                  <p className="text-sm text-green-700 font-medium">Frequent</p>
                  <p className="text-xs text-green-600">3-4 orders</p>
                </button>

                <button
                  onClick={() => setSelectedSegment("super-frequent")}
                  className={`text-center p-4 rounded-xl transition-all duration-200 ${
                    selectedSegment === "super-frequent"
                      ? "bg-pink-100 border-2 border-pink-400"
                      : "bg-pink-50 hover:bg-pink-100"
                  }`}
                >
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-pink-600" />
                  <p className="text-2xl font-bold text-pink-900">
                    {superFrequentCustomers}
                  </p>
                  <p className="text-sm text-pink-700 font-medium">Super</p>
                  <p className="text-xs text-pink-600">5-9 orders</p>
                </button>

                <button
                  onClick={() => setSelectedSegment("elite")}
                  className={`text-center p-4 rounded-xl transition-all duration-200 ${
                    selectedSegment === "elite"
                      ? "bg-purple-100 border-2 border-purple-400"
                      : "bg-purple-50 hover:bg-purple-100"
                  }`}
                >
                  <Crown className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold text-purple-900">
                    {eliteCustomers}
                  </p>
                  <p className="text-sm text-purple-700 font-medium">Elite</p>
                  <p className="text-xs text-purple-600">10+ orders</p>
                </button>
              </div>
            </div>
            {/* Search and Table */}
            <SearchWithResults
              searchTerm={searchTerm}
              onSearchChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search customers by name, mobile, or email..."
              totalCount={customers.length}
              filteredCount={filteredCustomers.length}
              onClearSearch={() => setSearchTerm("")}
              totalLabel="customers"
            />

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              {filteredCustomers.length > 0 ? (
                <Suspense fallback={<LoadingSpinner text="Loading table..." />}>
                  <DynamicTable
                    columns={ViewCustomerColumns}
                    data={filteredCustomers}
                    showPagination
                    initialRowsPerPage={10}
                    sortable
                  />
                </Suspense>
              ) : searchTerm ? (
                <NoSearchResults
                  searchTerm={searchTerm}
                  onClearSearch={() => setSearchTerm("")}
                  message="No customers match your search"
                />
              ) : (
                <EmptyState
                  icon={Users}
                  title="No Customers Found"
                  description="No customer records available."
                />
              )}
            </div>
          </>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <>
            {/* Advanced Analytics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-600">
                    Customer Growth
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  +{analytics.customerGrowth}%
                </div>
                <div className="text-xs text-gray-500">vs last month</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <Target className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-600">
                    Retention Rate
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {analytics.retentionRate}%
                </div>
                <div className="text-xs text-gray-500">customer loyalty</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <Gift className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-gray-600">
                    Avg LTV
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  ₹{(analytics.avgLifetimeValue / 1000).toFixed(1)}K
                </div>
                <div className="text-xs text-gray-500">lifetime value</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <Zap className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium text-gray-600">
                    Return Rate
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {analytics.returningCustomersRate}%
                </div>
                <div className="text-xs text-gray-500">customers return</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

CustomersPage.displayName = "CustomersPage";

export default CustomersPage;
