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

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    if (!searchTerm) return customers;
    const term = searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(term) ||
        c.mobile?.includes(term) ||
        c.email?.toLowerCase().includes(term),
    );
  }, [customers, searchTerm]);

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

  const leastActiveCustomers = useMemo(() => {
    if (!customers) return [];
    return [...customers]
      .filter((c) => typeof c.orderCount === "number")
      .sort((a, b) => a.orderCount - b.orderCount)
      .slice(0, 5);
  }, [customers]);

  const highestAvgOrderCustomers = useMemo(() => {
    if (!customers) return [];
    return [...customers]
      .filter((c) => typeof c.averageOrderValue === "number")
      .sort((a, b) => b.averageOrderValue - a.averageOrderValue)
      .slice(0, 5);
  }, [customers]);

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const ViewCustomerColumns = useMemo(
    () => [
      {
        accessor: "name",
        label: "Customer Name",
        sortable: true,
        render: (val, row) => (
          <div>
            <div className="font-medium text-gray-900">{val || "Unknown"}</div>
            <div className="text-xs text-gray-500">{row.mobile || "N/A"}</div>
          </div>
        ),
      },
      {
        accessor: "orderCount",
        label: "Total Orders",
        sortable: true,
        render: (val) => (
          <div className="flex items-center gap-1">
            <ShoppingCart className="w-3 h-3 text-gray-400" />
            <span className="font-medium">{val || 0}</span>
          </div>
        ),
      },
      {
        accessor: "totalOrderValue",
        label: "Total Spent",
        sortable: true,
        render: (val) => (
          <span className="font-semibold text-green-600">
            ₹{(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        ),
      },
      {
        accessor: "averageOrderValue",
        label: "Avg Order Value",
        sortable: true,
        render: (val) => (
          <span className="text-gray-700">
            ₹{(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        ),
      },
      {
        accessor: "lastOrderAmount",
        label: "Last Order",
        sortable: true,
        render: (val) => (
          <span className="text-gray-700">
            ₹{(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        ),
      },
      {
        accessor: "lastOrderDate",
        label: "Last Visit",
        sortable: true,
        render: (val) => {
          if (!val) return <span className="text-gray-400">Never</span>;
          const date = val.toDate ? val.toDate() : new Date(val);
          return (
            <span className="text-gray-700">
              {date.toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          );
        },
      },
      {
        accessor: "orderCount",
        label: "Segment",
        sortable: true,
        render: (val) => {
          let segment = { label: "New", color: "bg-blue-100 text-blue-800" };
          if (val >= 10)
            segment = {
              label: "Elite",
              color: "bg-purple-100 text-purple-800",
            };
          else if (val >= 5)
            segment = {
              label: "Super Frequent",
              color: "bg-pink-100 text-pink-800",
            };
          else if (val >= 3)
            segment = {
              label: "Frequent",
              color: "bg-green-100 text-green-800",
            };
          else if (val >= 2)
            segment = {
              label: "Repeat",
              color: "bg-yellow-100 text-yellow-800",
            };
          else if (val === 1)
            segment = { label: "One-Time", color: "bg-gray-100 text-gray-800" };

          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${segment.color}`}
            >
              {segment.label}
            </span>
          );
        },
      },
    ],
    [],
  );

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
    <div className="min-h-screen bg-gray-50 p-2">
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

      {/* Customer Segmentation Stats */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          Customer Segmentation by Visits
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <p className="text-2xl font-bold text-gray-900">
              {oneTimeCustomers}
            </p>
            <p className="text-sm text-gray-600">One-Time</p>
            <p className="text-xs text-gray-500">1 order</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Star className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <p className="text-2xl font-bold text-yellow-900">
              {repeatCustomers}
            </p>
            <p className="text-sm text-yellow-700">Repeat</p>
            <p className="text-xs text-yellow-600">2 orders</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Award className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-green-900">
              {frequentCustomers}
            </p>
            <p className="text-sm text-green-700">Frequent</p>
            <p className="text-xs text-green-600">3-4 orders</p>
          </div>
          <div className="text-center p-4 bg-pink-50 rounded-lg">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-pink-600" />
            <p className="text-2xl font-bold text-pink-900">
              {superFrequentCustomers}
            </p>
            <p className="text-sm text-pink-700">Super Frequent</p>
            <p className="text-xs text-pink-600">5-9 orders</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Crown className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-purple-900">
              {eliteCustomers}
            </p>
            <p className="text-sm text-purple-700">Elite</p>
            <p className="text-xs text-purple-600">10+ orders</p>
          </div>
        </div>
      </div>

      {/* Top Customers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-yellow-600" />
            Top 5 by Revenue
          </h2>
          <div className="space-y-3">
            {topCustomersByValue.map((c, idx) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {c.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">{c.mobile || "N/A"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    ₹{c.totalOrderValue?.toLocaleString("en-IN") || "0"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {c.orderCount || 0} orders
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            Top 5 by Visits
          </h2>
          <div className="space-y-3">
            {topCustomersByVisits.map((c, idx) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {c.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">{c.mobile || "N/A"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {c.orderCount || 0} visits
                  </p>
                  <p className="text-xs text-gray-500">
                    ₹{c.totalOrderValue?.toLocaleString("en-IN") || "0"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SearchWithResults
        searchTerm={searchTerm}
        onSearchChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Search by name or mobile..."
        totalCount={customers.length}
        filteredCount={filteredCustomers.length}
        onClearSearch={() => setSearchTerm("")}
        totalLabel="customers"
      />

      <div className="bg-white rounded shadow overflow-hidden">
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
    </div>
  );
});

CustomersPage.displayName = "CustomersPage";

export default CustomersPage;
