// src/Pages/SuperAdmin/ViewHotelSubscription.jsx
import React, { useState, useCallback, useMemo } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Building2,
  CreditCard,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Search,
  Filter,
  Users,
  TrendingUp,
  Activity,
  Wifi,
  WifiOff,
  Crown,
  Star,
  Package,
} from "lucide-react";
import {
  collection,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// ✅ NEW: Import Firestore-based hooks and contexts
import { useAuth } from "../../context/AuthContext";
import { useSuperAdmin } from "../../hooks/useSuperAdmin";
import { useFirestoreCollection } from "../../hooks/useFirestoreCollection";

import { PageTitle } from "../../atoms";
import { DynamicTable } from "../../components";
import { hotelsSubscriptionListColumn } from "../../Constants/Columns";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import StatCard from "components/Cards/StatCard";
import SearchWithButton from "molecules/SearchWithAddButton";

// ✅ NEW: Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  free: {
    name: "Free",
    price: 0,
    duration: 30,
    color: "gray",
    features: ["Basic menu", "Up to 50 orders/month"],
  },
  basic: {
    name: "Basic",
    price: 999,
    duration: 30,
    color: "blue",
    features: ["Full menu", "Up to 500 orders/month", "Basic analytics"],
  },
  premium: {
    name: "Premium",
    price: 1999,
    duration: 30,
    color: "purple",
    features: ["Unlimited orders", "Advanced analytics", "Priority support"],
  },
  enterprise: {
    name: "Enterprise",
    price: 4999,
    duration: 30,
    color: "gold",
    features: ["Everything included", "Custom features", "24/7 support"],
  },
};

const ViewHotelSubscription = () => {
  const navigate = useNavigate();

  // ✅ NEW: Use context hooks for better integration
  const { currentUser, isSuperAdmin } = useAuth();
  const { hasPermissions } = useSuperAdmin();

  // ✅ ENHANCED: Use Firestore collection hook for hotels with subscriptions
  const {
    documents: hotels,
    loading,
    error,
    connectionStatus,
    lastFetch,
    retryCount,
    refresh: refetchHotels,
    isRetrying,
    canRetry,
  } = useFirestoreCollection("hotels", {
    orderBy: [["createdAt", "desc"]],
    realtime: true,
    enableRetry: true,
  });

  // ✅ NEW: Also fetch subscriptions collection for detailed subscription data
  const {
    documents: subscriptions,
    loading: subscriptionsLoading,
    error: subscriptionsError,
    refresh: refetchSubscriptions,
  } = useFirestoreCollection("subscriptions", {
    orderBy: [["createdAt", "desc"]],
    realtime: true,
    enableRetry: true,
  });

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ NEW: Permission check
  const hasPermission = useMemo(() => {
    return isSuperAdmin() && hasPermissions;
  }, [isSuperAdmin, hasPermissions]);

  // ✅ ENHANCED: Process hotels with subscription data
  const processedHotels = useMemo(() => {
    if (!hotels || hotels.length === 0) return [];

    let processed = hotels.map((hotel, index) => {
      // Find matching subscription
      const hotelSubscription = subscriptions?.find(
        (sub) => sub.hotelId === hotel.id
      );

      // Calculate subscription status
      const now = new Date();
      let subscriptionStatus = "expired";
      let daysLeft = 0;

      if (hotelSubscription?.endDate) {
        const endDate = hotelSubscription.endDate.toDate
          ? hotelSubscription.endDate.toDate()
          : new Date(hotelSubscription.endDate);

        daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

        if (daysLeft > 0) {
          subscriptionStatus = daysLeft <= 7 ? "expiring" : "active";
        }
      }

      const currentPlan =
        hotelSubscription?.plan || hotel.subscription?.plan || "free";
      const planDetails =
        SUBSCRIPTION_PLANS[currentPlan] || SUBSCRIPTION_PLANS.free;

      return {
        srNo: index + 1,
        id: hotel.id,
        ...hotel,

        // Basic hotel info
        hotelName:
          hotel.businessName ||
          hotel.name ||
          hotel.hotelName ||
          hotel.info?.businessName ||
          "No Name provided",

        ownerName:
          hotel.adminDetails?.name ||
          hotel.admin?.name ||
          hotel.info?.admin?.name ||
          hotel.ownerName ||
          "N/A",

        email:
          hotel.email ||
          hotel.admin?.email ||
          hotel.info?.admin?.email ||
          "N/A",

        contactInfo:
          hotel.phone ||
          hotel.contact ||
          hotel.info?.primaryContact ||
          "No contact provided",

        // Location info
        district:
          hotel.address?.district ||
          hotel.district ||
          hotel.info?.district ||
          "N/A",

        state:
          hotel.address?.state || hotel.state || hotel.info?.state || "N/A",

        // Subscription specific fields
        currentPlan,
        planName: planDetails.name,
        planPrice: `₹${planDetails.price}`,
        subscriptionStatus,
        daysLeft,

        // Subscription dates
        startDate: hotelSubscription?.startDate?.toDate
          ? hotelSubscription.startDate.toDate().toLocaleDateString()
          : hotelSubscription?.startDate
          ? new Date(hotelSubscription.startDate).toLocaleDateString()
          : "N/A",

        endDate: hotelSubscription?.endDate?.toDate
          ? hotelSubscription.endDate.toDate().toLocaleDateString()
          : hotelSubscription?.endDate
          ? new Date(hotelSubscription.endDate).toLocaleDateString()
          : "N/A",

        // Payment info
        lastPayment: hotelSubscription?.lastPayment?.toDate
          ? hotelSubscription.lastPayment.toDate().toLocaleDateString()
          : hotelSubscription?.lastPayment
          ? new Date(hotelSubscription.lastPayment).toLocaleDateString()
          : "N/A",

        totalRevenue: hotelSubscription?.totalPaid || 0,

        // Usage stats
        monthlyOrders: hotel.stats?.monthlyOrders || 0,
        totalOrders: hotel.stats?.totalOrders || 0,

        // Status indicators
        status:
          hotel.isActive !== false && hotel.status !== "inactive"
            ? "Active"
            : "Inactive",

        // Created date
        createdDate: hotel.createdAt?.toDate
          ? hotel.createdAt.toDate().toLocaleDateString()
          : hotel.createdAt
          ? new Date(hotel.createdAt).toLocaleDateString()
          : "N/A",

        // Plan features
        planFeatures: planDetails.features,
        planColor: planDetails.color,

        // Auto-renewal status
        autoRenewal: hotelSubscription?.autoRenewal || false,
      };
    });

    // Apply filters
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      processed = processed.filter(
        (hotel) =>
          hotel.hotelName?.toLowerCase().includes(search) ||
          hotel.ownerName?.toLowerCase().includes(search) ||
          hotel.email?.toLowerCase().includes(search) ||
          hotel.district?.toLowerCase().includes(search) ||
          hotel.state?.toLowerCase().includes(search) ||
          hotel.currentPlan?.toLowerCase().includes(search)
      );
    }

    if (planFilter !== "all") {
      processed = processed.filter((hotel) => hotel.currentPlan === planFilter);
    }

    if (statusFilter !== "all") {
      processed = processed.filter(
        (hotel) => hotel.subscriptionStatus === statusFilter
      );
    }

    return processed;
  }, [hotels, subscriptions, searchTerm, planFilter, statusFilter]);

  // ✅ NEW: Subscription statistics
  const subscriptionStats = useMemo(() => {
    if (!processedHotels || processedHotels.length === 0) {
      return { total: 0, active: 0, expiring: 0, expired: 0, revenue: 0 };
    }

    const total = processedHotels.length;
    const active = processedHotels.filter(
      (hotel) => hotel.subscriptionStatus === "active"
    ).length;
    const expiring = processedHotels.filter(
      (hotel) => hotel.subscriptionStatus === "expiring"
    ).length;
    const expired = processedHotels.filter(
      (hotel) => hotel.subscriptionStatus === "expired"
    ).length;
    const monthlyRevenue = processedHotels.reduce((sum, hotel) => {
      const planPrice = SUBSCRIPTION_PLANS[hotel.currentPlan]?.price || 0;
      return hotel.subscriptionStatus === "active" ? sum + planPrice : sum;
    }, 0);

    return { total, active, expiring, expired, revenue: monthlyRevenue };
  }, [processedHotels]);

  // ✅ NEW: Plan distribution
  const planDistribution = useMemo(() => {
    const distribution = { free: 0, basic: 0, premium: 0, enterprise: 0 };
    processedHotels.forEach((hotel) => {
      if (distribution.hasOwnProperty(hotel.currentPlan)) {
        distribution[hotel.currentPlan]++;
      }
    });
    return distribution;
  }, [processedHotels]);

  // Handle search change
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  // ✅ NEW: Update subscription plan
  const updateSubscriptionPlan = useCallback(
    async (hotel, newPlan) => {
      if (!hasPermission) {
        toast.error("You don't have permission to modify subscriptions.");
        return;
      }

      setSubmitting(true);

      try {
        const planDetails = SUBSCRIPTION_PLANS[newPlan];
        const now = new Date();
        const endDate = new Date(
          now.getTime() + planDetails.duration * 24 * 60 * 60 * 1000
        );

        // Update hotel document
        const hotelDocRef = doc(db, "hotels", hotel.id);
        await updateDoc(hotelDocRef, {
          "subscription.plan": newPlan,
          "subscription.updatedAt": serverTimestamp(),
          updatedAt: serverTimestamp(),
          updatedBy: currentUser?.uid,
        });

        // Create or update subscription document
        const subscriptionData = {
          hotelId: hotel.id,
          plan: newPlan,
          startDate: Timestamp.fromDate(now),
          endDate: Timestamp.fromDate(endDate),
          price: planDetails.price,
          status: "active",
          updatedAt: serverTimestamp(),
          updatedBy: currentUser?.uid,
        };

        // Check if subscription exists
        const existingSubscription = subscriptions?.find(
          (sub) => sub.hotelId === hotel.id
        );
        if (existingSubscription) {
          const subscriptionDocRef = doc(
            db,
            "subscriptions",
            existingSubscription.id
          );
          await updateDoc(subscriptionDocRef, subscriptionData);
        } else {
          // Create new subscription document
          const subscriptionDocRef = doc(collection(db, "subscriptions"));
          await updateDoc(subscriptionDocRef, {
            ...subscriptionData,
            createdAt: serverTimestamp(),
            createdBy: currentUser?.uid,
          });
        }

        toast.success(
          `${hotel.hotelName} subscription updated to ${planDetails.name} plan successfully.`
        );
      } catch (error) {
        console.error("Error updating subscription:", error);
        toast.error("Error updating subscription: " + error.message);
      } finally {
        setSubmitting(false);
      }
    },
    [hasPermission, currentUser, subscriptions]
  );

  // ✅ NEW: Extend subscription
  const extendSubscription = useCallback(
    async (hotel, days = 30) => {
      if (!hasPermission) {
        toast.error("You don't have permission to extend subscriptions.");
        return;
      }

      setSubmitting(true);

      try {
        const existingSubscription = subscriptions?.find(
          (sub) => sub.hotelId === hotel.id
        );
        if (!existingSubscription) {
          toast.error("No subscription found for this hotel.");
          return;
        }

        const currentEndDate = existingSubscription.endDate.toDate();
        const newEndDate = new Date(
          currentEndDate.getTime() + days * 24 * 60 * 60 * 1000
        );

        const subscriptionDocRef = doc(
          db,
          "subscriptions",
          existingSubscription.id
        );
        await updateDoc(subscriptionDocRef, {
          endDate: Timestamp.fromDate(newEndDate),
          extendedBy: days,
          extendedAt: serverTimestamp(),
          updatedBy: currentUser?.uid,
        });

        toast.success(
          `${hotel.hotelName} subscription extended by ${days} days successfully.`
        );
      } catch (error) {
        console.error("Error extending subscription:", error);
        toast.error("Error extending subscription: " + error.message);
      } finally {
        setSubmitting(false);
      }
    },
    [hasPermission, currentUser, subscriptions]
  );

  // ✅ NEW: Refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchHotels(), refetchSubscriptions()]);
    } catch (error) {
      console.error("Error refreshing subscription data:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [refetchHotels, refetchSubscriptions]);

  // ✅ NEW: Export functionality
  const handleExport = useCallback(() => {
    try {
      const csvData = processedHotels.map((hotel) => ({
        "Sr. No": hotel.srNo,
        "Hotel Name": hotel.hotelName,
        Owner: hotel.ownerName,
        Email: hotel.email,
        Phone: hotel.contactInfo,
        District: hotel.district,
        State: hotel.state,
        "Current Plan": hotel.planName,
        "Plan Price": hotel.planPrice,
        "Subscription Status": hotel.subscriptionStatus,
        "Days Left": hotel.daysLeft,
        "Start Date": hotel.startDate,
        "End Date": hotel.endDate,
        "Last Payment": hotel.lastPayment,
        "Monthly Orders": hotel.monthlyOrders,
        "Total Orders": hotel.totalOrders,
        "Auto Renewal": hotel.autoRenewal ? "Yes" : "No",
        "Hotel Status": hotel.status,
        "Created Date": hotel.createdDate,
      }));

      const csv = csvData.map((row) => Object.values(row).join(",")).join("\n");
      const headers = Object.keys(csvData[0] || {}).join(",");
      const csvContent = headers + "\n" + csv;

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `hotel_subscriptions_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting subscription data:", error);
      toast.error("Error exporting data");
    }
  }, [processedHotels]);

  // ✅ ENHANCED: Table columns with subscription-specific rendering
  const enhancedColumns = [
    ...hotelsSubscriptionListColumn,
    {
      key: "planName",
      label: "Plan",
      render: (value, item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium bg-${item.planColor}-100 text-${item.planColor}-800`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "subscriptionStatus",
      label: "Status",
      render: (value, item) => {
        const statusConfig = {
          active: { color: "green", icon: CheckCircle, text: "Active" },
          expiring: {
            color: "yellow",
            icon: AlertTriangle,
            text: `Expiring (${item.daysLeft}d)`,
          },
          expired: { color: "red", icon: XCircle, text: "Expired" },
        };

        const config = statusConfig[value] || statusConfig.expired;
        const Icon = config.icon;

        return (
          <div className="flex items-center gap-1">
            <Icon size={14} className={`text-${config.color}-500`} />
            <span className={`text-${config.color}-700 text-xs font-medium`}>
              {config.text}
            </span>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, item) => (
        <div className="flex gap-1">
          <select
            onChange={(e) => updateSubscriptionPlan(item, e.target.value)}
            value={item.currentPlan}
            disabled={submitting || !hasPermission}
            className="text-xs px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
              <option key={key} value={key}>
                {plan.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => extendSubscription(item, 30)}
            disabled={submitting || !hasPermission}
            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            +30d
          </button>
        </div>
      ),
    },
  ];

  const hotelCount = processedHotels.length;
  const hasHotels = hotels && hotels.length > 0;
  const hasSearchResults = processedHotels.length > 0;

  // ✅ NEW: Permission check UI
  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600">
            You don't have super admin permissions to view hotel subscriptions.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  // if ((loading || subscriptionsLoading) && (!hotels || hotels.length === 0)) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <LoadingSpinner size="lg" text="Loading subscription data..." />
  //     </div>
  //   );
  // }

  // Error state
  if ((error || subscriptionsError) && connectionStatus === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorMessage
            error={error || subscriptionsError}
            onRetry={handleRefresh}
            title="Subscription Data Error"
            showRetryButton={canRetry}
          />
          <div className="mt-4 text-center">
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Attempted {retryCount} time{retryCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* ✅ ENHANCED: Header with subscription focus */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <PageTitle
              pageTitle="Hotel Subscriptions"
              className="text-2xl sm:text-3xl font-bold text-gray-900"
              description="Manage hotel subscription plans and billing"
            />

            {/* ✅ NEW: Live status indicator */}
            {connectionStatus === "connected" && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Live subscription data</span>
              </div>
            )}

            {/* Result count */}
            {hasHotels && (
              <div className="text-sm text-gray-600 mt-1">
                {searchTerm || planFilter !== "all" || statusFilter !== "all"
                  ? `Showing ${hotelCount} of ${subscriptionStats.total} hotels`
                  : `Total: ${subscriptionStats.total} hotels`}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={!hasHotels}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              Export CSV
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                isRefreshing ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              <RefreshCw
                size={16}
                className={isRefreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* ✅ NEW: Subscription Statistics Cards */}
        {hasHotels && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard
              icon={Building2}
              title="Total Hotels"
              value={subscriptionStats.total}
              color="blue"
              loading={loading}
            />
            <StatCard
              icon={CheckCircle}
              title="Active Subscriptions"
              value={subscriptionStats.active}
              color="green"
              subtitle={`${Math.round(
                (subscriptionStats.active / subscriptionStats.total) * 100
              )}% active`}
              loading={loading}
            />
            <StatCard
              icon={AlertTriangle}
              title="Expiring Soon"
              value={subscriptionStats.expiring}
              color="yellow"
              subtitle="Within 7 days"
              loading={loading}
            />
            <StatCard
              icon={XCircle}
              title="Expired"
              value={subscriptionStats.expired}
              color="red"
              loading={loading}
            />
            <StatCard
              icon={DollarSign}
              title="Monthly Revenue"
              value={`₹${(subscriptionStats.revenue / 1000).toFixed(1)}K`}
              color="purple"
              subtitle="From active plans"
              loading={loading}
            />
          </div>
        )}

        {/* ✅ NEW: Plan Distribution Cards */}
        {hasHotels && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Object.entries(planDistribution).map(([plan, count]) => {
              const planDetails = SUBSCRIPTION_PLANS[plan];
              return (
                <div
                  key={plan}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        {planDetails.name}
                      </h4>
                      <p className="text-2xl font-bold text-gray-900">
                        {count}
                      </p>
                    </div>
                    <div
                      className={`p-2 rounded-full bg-${planDetails.color}-100`}
                    >
                      <Package
                        className={`w-5 h-5 text-${planDetails.color}-600`}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ₹{planDetails.price}/month
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* ✅ ENHANCED: Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search hotels by name, owner, email, or location..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Plans</option>
                {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                  <option key={key} value={key}>
                    {plan.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expiring">Expiring Soon</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Filter summary */}
          {(searchTerm || planFilter !== "all" || statusFilter !== "all") && (
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {hotelCount} result{hotelCount !== 1 ? "s" : ""}
              </span>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setPlanFilter("all");
                  setStatusFilter("all");
                }}
                className="text-red-600 hover:text-red-800 underline"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* ✅ ENHANCED: Subscription Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {hasHotels ? (
            <>
              {hasSearchResults ? (
                <DynamicTable
                  columns={enhancedColumns}
                  data={processedHotels}
                  loading={submitting}
                  emptyMessage="No hotel subscriptions match your search criteria"
                  showPagination={true}
                  initialRowsPerPage={10}
                  sortable={true}
                  // ✅ NEW: Enhanced table props
                  searchable={false} // We handle search externally
                  exportable={false} // We handle export externally
                  refreshable={true}
                  onRefresh={handleRefresh}
                  connectionStatus={connectionStatus}
                />
              ) : (
                <div className="text-center py-12">
                  <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h5 className="text-lg font-medium text-gray-900 mb-2">
                    No subscriptions found
                  </h5>
                  <p className="text-gray-600 mb-4">
                    No hotel subscriptions match your search criteria
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setPlanFilter("all");
                      setStatusFilter("all");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h5 className="text-lg font-medium text-gray-900 mb-2">
                No Hotel Subscriptions
              </h5>
              <p className="text-gray-600 mb-6">
                Hotels will appear here once they have active subscriptions
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default ViewHotelSubscription;
