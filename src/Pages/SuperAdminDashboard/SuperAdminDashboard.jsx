// src/Pages/SuperAdmin/SuperAdminDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Building2,
  Coffee,
  Wine,
  MapPin,
  BarChart3,
  Users,
  Globe,
  Utensils,
  Home,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  DollarSign,
  Star,
  Package,
} from "lucide-react";

// Import hooks and contexts
import { useAuth } from "../../context/AuthContext";
import { useSuperAdmin } from "../../hooks/useSuperAdmin";
import { useFirestoreCollection } from "../../hooks/useFirestoreCollection";

import StatCard from "components/Cards/StatCard";
import { Spinner } from "atoms";
import SuperAdminDashboardLayout from "layout/SuperAdminDashboardLayout";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import LoadingSpinner from "../../atoms/LoadingSpinner";

const SuperAdminDashboard = () => {
  // Add debugging state
  const [debugInfo, setDebugInfo] = useState({});

  // Context hooks with error handling
  const authContext = useAuth();
  const superAdminContext = useSuperAdmin();

  // Debug auth context
  useEffect(() => {
    console.log("Auth Context:", authContext);
    console.log("SuperAdmin Context:", superAdminContext);
    setDebugInfo((prev) => ({
      ...prev,
      authLoaded: !!authContext,
      superAdminLoaded: !!superAdminContext,
      currentUser: authContext?.currentUser?.uid || "No user",
      isSuperAdmin: authContext?.isSuperAdmin?.() || false,
    }));
  }, [authContext, superAdminContext]);

  // Safely extract values with fallbacks
  const currentUser = authContext?.currentUser;
  const isSuperAdmin = authContext?.isSuperAdmin || (() => false);
  const hasPermissions = superAdminContext?.hasPermissions ?? false;

  // Firestore collections with timeout and error handling
  const {
    documents: hotels,
    loading: hotelsLoading,
    error: hotelsError,
    connectionStatus: hotelsConnection,
    lastFetch: hotelsLastFetch,
    refresh: refreshHotels,
  } = useFirestoreCollection("hotels", {
    orderBy: [["createdAt", "desc"]],
    realtime: true,
    enableRetry: true,
    timeout: 10000, // 10 second timeout
  });

  const {
    documents: admins,
    loading: adminsLoading,
    error: adminsError,
    refresh: refreshAdmins,
  } = useFirestoreCollection("admins", {
    orderBy: [["createdAt", "desc"]],
    realtime: true,
    enableRetry: true,
    timeout: 10000,
  });

  const {
    documents: subscriptions,
    loading: subscriptionsLoading,
    error: subscriptionsError,
    refresh: refreshSubscriptions,
  } = useFirestoreCollection("subscriptions", {
    orderBy: [["createdAt", "desc"]],
    realtime: true,
    enableRetry: true,
    timeout: 10000,
  });

  // State management
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Add loading timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (hotelsLoading || adminsLoading || subscriptionsLoading) {
        console.warn("Loading timeout reached, something might be wrong");
        setLoadingTimeout(true);
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timer);
  }, [hotelsLoading, adminsLoading, subscriptionsLoading]);

  // Debug logging
  useEffect(() => {
    console.log("Loading states:", {
      hotels: hotelsLoading,
      admins: adminsLoading,
      subscriptions: subscriptionsLoading,
      connection: hotelsConnection,
    });

    console.log("Data states:", {
      hotelsCount: hotels?.length || 0,
      adminsCount: admins?.length || 0,
      subscriptionsCount: subscriptions?.length || 0,
    });

    console.log("Error states:", {
      hotelsError,
      adminsError,
      subscriptionsError,
    });
  }, [
    hotelsLoading,
    adminsLoading,
    subscriptionsLoading,
    hotels,
    admins,
    subscriptions,
    hotelsError,
    adminsError,
    subscriptionsError,
    hotelsConnection,
  ]);

  // Permission check - simplified
  const hasPermission = useMemo(() => {
    const superAdmin = isSuperAdmin();
    const permissions = hasPermissions;
    console.log("Permission check:", {
      superAdmin,
      permissions,
      result: superAdmin && permissions,
    });
    return superAdmin && permissions;
  }, [isSuperAdmin, hasPermissions]);

  // Calculate statistics with better error handling
  const calculateStats = useCallback(() => {
    console.log("Calculating stats with hotels:", hotels);

    if (!hotels || !Array.isArray(hotels) || hotels.length === 0) {
      return {
        totalHotels: 0,
        totalCafes: 0,
        totalRestaurants: 0,
        totalBars: 0,
        totalDhaba: 0,
        totalStates: 0,
        totalDistricts: 0,
        totalCities: 0,
        activeHotels: 0,
        inactiveHotels: 0,
        totalProperties: 0,
        totalRevenue: 0,
        avgRating: 0,
        totalOrders: 0,
      };
    }

    try {
      // Business type categorization
      const businessTypes = {
        hotels: 0,
        cafes: 0,
        restaurants: 0,
        bars: 0,
        dhaba: 0,
        others: 0,
      };

      // Geographic data
      const statesSet = new Set();
      const districtsSet = new Set();
      const citiesSet = new Set();

      // Performance metrics
      let totalRevenue = 0;
      let totalRating = 0;
      let ratedHotels = 0;
      let totalOrders = 0;

      // Status counts
      let activeCount = 0;
      let inactiveCount = 0;

      hotels.forEach((hotel) => {
        if (!hotel) return;

        // Business type classification
        const businessType = (
          hotel.businessType ||
          hotel.info?.businessType ||
          ""
        ).toLowerCase();

        if (businessType.includes("hotel")) businessTypes.hotels++;
        else if (businessType.includes("cafe")) businessTypes.cafes++;
        else if (businessType.includes("restaurant"))
          businessTypes.restaurants++;
        else if (businessType.includes("bar")) businessTypes.bars++;
        else if (businessType.includes("dhaba")) businessTypes.dhaba++;
        else businessTypes.others++;

        // Geographic data
        const state = hotel.address?.state || hotel.state || hotel.info?.state;
        const district =
          hotel.address?.district || hotel.district || hotel.info?.district;
        const city = hotel.address?.city || hotel.city || hotel.info?.city;

        if (state) statesSet.add(state);
        if (district) districtsSet.add(district);
        if (city) citiesSet.add(city);

        // Status counting
        if (hotel.isActive !== false && hotel.status !== "inactive") {
          activeCount++;
        } else {
          inactiveCount++;
        }

        // Performance metrics
        if (hotel.stats) {
          totalRevenue += hotel.stats.totalRevenue || 0;
          totalOrders += hotel.stats.totalOrders || 0;

          if (hotel.stats.rating && hotel.stats.rating > 0) {
            totalRating += hotel.stats.rating;
            ratedHotels++;
          }
        }
      });

      return {
        totalHotels: businessTypes.hotels,
        totalCafes: businessTypes.cafes,
        totalRestaurants: businessTypes.restaurants,
        totalBars: businessTypes.bars,
        totalDhaba: businessTypes.dhaba,
        totalOthers: businessTypes.others,
        totalStates: statesSet.size,
        totalDistricts: districtsSet.size,
        totalCities: citiesSet.size,
        activeHotels: activeCount,
        inactiveHotels: inactiveCount,
        totalProperties: hotels.length,
        totalRevenue,
        avgRating: ratedHotels > 0 ? (totalRating / ratedHotels).toFixed(1) : 0,
        totalOrders,
      };
    } catch (error) {
      console.error("Error calculating stats:", error);
      return {
        totalHotels: 0,
        totalCafes: 0,
        totalRestaurants: 0,
        totalBars: 0,
        totalDhaba: 0,
        totalOthers: 0,
        totalStates: 0,
        totalDistricts: 0,
        totalCities: 0,
        activeHotels: 0,
        inactiveHotels: 0,
        totalProperties: 0,
        totalRevenue: 0,
        avgRating: 0,
        totalOrders: 0,
      };
    }
  }, [hotels]);

  // Geographic distributions with error handling
  const getGeographicDistributions = useCallback(() => {
    if (!hotels || !Array.isArray(hotels) || hotels.length === 0) {
      return {
        hotelsByState: {},
        hotelsByDistrict: {},
        hotelsByCity: {},
        hotelsByType: {},
      };
    }

    try {
      const stateCount = {};
      const districtCount = {};
      const cityCount = {};
      const typeCount = {};

      hotels.forEach((hotel) => {
        if (!hotel) return;

        // Geographic distributions
        const state = hotel.address?.state || hotel.state || hotel.info?.state;
        const district =
          hotel.address?.district || hotel.district || hotel.info?.district;
        const city = hotel.address?.city || hotel.city || hotel.info?.city;

        if (state) {
          stateCount[state] = (stateCount[state] || 0) + 1;
        }
        if (district) {
          districtCount[district] = (districtCount[district] || 0) + 1;
        }
        if (city) {
          cityCount[city] = (cityCount[city] || 0) + 1;
        }

        // Business type distribution
        const businessType =
          hotel.businessType || hotel.info?.businessType || "Other";
        typeCount[businessType] = (typeCount[businessType] || 0) + 1;
      });

      return {
        hotelsByState: stateCount,
        hotelsByDistrict: districtCount,
        hotelsByCity: cityCount,
        hotelsByType: typeCount,
      };
    } catch (error) {
      console.error("Error getting geographic distributions:", error);
      return {
        hotelsByState: {},
        hotelsByDistrict: {},
        hotelsByCity: {},
        hotelsByType: {},
      };
    }
  }, [hotels]);

  // Subscription statistics with error handling
  const getSubscriptionStats = useCallback(() => {
    if (
      !subscriptions ||
      !Array.isArray(subscriptions) ||
      subscriptions.length === 0
    ) {
      return {
        activeSubscriptions: 0,
        expiringSubscriptions: 0,
        monthlyRevenue: 0,
        totalSubscriptions: 0,
      };
    }

    try {
      const now = new Date();
      let activeCount = 0;
      let expiringCount = 0;
      let monthlyRevenue = 0;

      subscriptions.forEach((subscription) => {
        if (!subscription) return;

        const endDate = subscription.endDate?.toDate
          ? subscription.endDate.toDate()
          : new Date(subscription.endDate);

        const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

        if (daysLeft > 7) {
          activeCount++;
          monthlyRevenue += subscription.price || 0;
        } else if (daysLeft > 0) {
          expiringCount++;
          monthlyRevenue += subscription.price || 0;
        }
      });

      return {
        activeSubscriptions: activeCount,
        expiringSubscriptions: expiringCount,
        monthlyRevenue,
        totalSubscriptions: subscriptions.length,
      };
    } catch (error) {
      console.error("Error getting subscription stats:", error);
      return {
        activeSubscriptions: 0,
        expiringSubscriptions: 0,
        monthlyRevenue: 0,
        totalSubscriptions: 0,
      };
    }
  }, [subscriptions]);

  // Computed values
  const calculatedStats = useMemo(() => calculateStats(), [calculateStats]);
  const geographicData = useMemo(
    () => getGeographicDistributions(),
    [getGeographicDistributions]
  );
  const subscriptionStats = useMemo(
    () => getSubscriptionStats(),
    [getSubscriptionStats]
  );

  // Improved loading logic
  const loading =
    (hotelsLoading || adminsLoading || subscriptionsLoading) && !loadingTimeout;
  const error = hotelsError || adminsError || subscriptionsError;

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setLoadingTimeout(false);
    try {
      await Promise.all([
        refreshHotels(),
        refreshAdmins(),
        refreshSubscriptions(),
      ]);
    } catch (error) {
      console.error("Error refreshing dashboard:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [refreshHotels, refreshAdmins, refreshSubscriptions]);

  // Chart Component
  const ChartCard = ({
    title,
    data,
    color,
    maxValue,
    icon: Icon,
    delay = 0,
  }) => (
    <div
      className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 animate-fade-in-up overflow-hidden`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-${color}-100`}>
            <Icon className={`text-lg text-${color}-600`} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {Object.entries(data || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count], index) => (
              <div
                key={name}
                className="group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[200px] group-hover:text-gray-900 transition-colors">
                    {name}
                  </span>
                  <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                    {count}
                  </span>
                </div>
                <div className="flex-1 bg-gray-200 h-3 rounded-full overflow-hidden">
                  <div
                    className={`bg-${color}-500 h-3 rounded-full transition-all duration-1000 ease-out`}
                    style={{
                      width: `${(count / Math.max(maxValue, 1)) * 100}%`,
                      animationDelay: `${index * 100}ms`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
        </div>
        {Object.keys(data || {}).length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Icon className="mx-auto text-4xl mb-2 opacity-20" />
            <p>No data available</p>
          </div>
        )}
      </div>
    </div>
  );

  // Quick Insights Component
  const QuickInsights = () => {
    const mostPopularState = Object.entries(
      geographicData.hotelsByState || {}
    ).sort((a, b) => b[1] - a[1])[0];

    const mostPopularDistrict = Object.entries(
      geographicData.hotelsByDistrict || {}
    ).sort((a, b) => b[1] - a[1])[0];

    const mostPopularType = Object.entries(
      geographicData.hotelsByType || {}
    ).sort((a, b) => b[1] - a[1])[0];

    return (
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-2xl animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Business Insights</h3>
          <BarChart3 className="text-2xl opacity-70" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm">
            <Users className="mx-auto text-2xl mb-2" />
            <p className="text-2xl font-bold">{calculatedStats.activeHotels}</p>
            <p className="text-sm opacity-80">Active Properties</p>
          </div>
          <div className="text-center p-4 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm">
            <Globe className="mx-auto text-2xl mb-2" />
            <p className="text-lg font-bold">
              {mostPopularState ? mostPopularState[0] : "N/A"}
            </p>
            <p className="text-sm opacity-80">
              Top State ({mostPopularState ? mostPopularState[1] : 0})
            </p>
          </div>
          <div className="text-center p-4 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm">
            <MapPin className="mx-auto text-2xl mb-2" />
            <p className="text-lg font-bold">
              {mostPopularDistrict ? mostPopularDistrict[0] : "N/A"}
            </p>
            <p className="text-sm opacity-80">
              Top District ({mostPopularDistrict ? mostPopularDistrict[1] : 0})
            </p>
          </div>
          <div className="text-center p-4 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm">
            <Building2 className="mx-auto text-2xl mb-2" />
            <p className="text-lg font-bold">
              {mostPopularType ? mostPopularType[0] : "N/A"}
            </p>
            <p className="text-sm opacity-80">
              Top Type ({mostPopularType ? mostPopularType[1] : 0})
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Show debug info in development
  const showDebug = process.env.NODE_ENV === "development";

  // Permission check UI
  if (!hasPermission && !loading) {
    return (
      <SuperAdminDashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600">
              You don't have super admin permissions to view this dashboard.
            </p>
          </div>
        </div>
      </SuperAdminDashboardLayout>
    );
  }

  return (
    <SuperAdminDashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Enhanced Header Section */}
        <div className="animate-fade-in-down p-2">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                Super Admin Dashboard
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed max-w-3xl">
                Welcome to your command center. Monitor and manage all
                properties across the platform with real-time insights and
                analytics.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
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
        </div>

        {/* Error State */}
        {error && (
          <div className="py-8">
            <ErrorMessage
              error={error}
              onRetry={handleRefresh}
              title="Dashboard Error"
              showRetryButton={true}
            />
          </div>
        )}

        {/* Main Content - Show when not loading or when we have data */}
        {(!loading || calculatedStats.totalProperties > 0) && !error && (
          <>
            {/* Performance Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 p-2">
              <StatCard
                title="Total Revenue"
                value={`₹${(calculatedStats.totalRevenue / 1000).toFixed(1)}K`}
                color="blue"
                icon={DollarSign}
                subtitle="Across all properties"
              />
              <StatCard
                title="Total Orders"
                value={calculatedStats.totalOrders}
                color="green"
                icon={Package}
                subtitle="Platform wide"
              />
              <StatCard
                title="Average Rating"
                value={calculatedStats.avgRating}
                color="yellow"
                icon={Star}
                subtitle="Customer satisfaction"
              />
              <StatCard
                title="Monthly Revenue"
                value={`₹${(subscriptionStats.monthlyRevenue / 1000).toFixed(
                  1
                )}K`}
                color="purple"
                icon={TrendingUp}
                subtitle="From subscriptions"
              />
            </div>

            {/* Business Type Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 p-2">
              <StatCard
                title="Hotels"
                value={calculatedStats.totalHotels}
                color="blue"
                icon={Building2}
              />
              <StatCard
                title="Restaurants"
                value={calculatedStats.totalRestaurants}
                color="orange"
                icon={Utensils}
              />
              <StatCard
                title="Cafes"
                value={calculatedStats.totalCafes}
                color="green"
                icon={Coffee}
              />
              <StatCard
                title="Bars"
                value={calculatedStats.totalBars}
                color="purple"
                icon={Wine}
              />
              <StatCard
                title="Dhabas"
                value={calculatedStats.totalDhaba}
                color="red"
                icon={Home}
              />
              <StatCard
                title="Others"
                value={calculatedStats.totalOthers}
                color="gray"
                icon={Building2}
              />
            </div>

            {/* Geographic Coverage Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 p-2">
              <StatCard
                title="States Covered"
                value={calculatedStats.totalStates}
                color="indigo"
                icon={Globe}
                subtitle="Geographic reach"
              />
              <StatCard
                title="Districts Covered"
                value={calculatedStats.totalDistricts}
                color="teal"
                icon={MapPin}
                subtitle="Local presence"
              />
              <StatCard
                title="Cities Covered"
                value={calculatedStats.totalCities}
                color="rose"
                icon={Users}
                subtitle="Urban coverage"
              />
            </div>

            {/* Subscription Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 p-2">
              <StatCard
                title="Active Subscriptions"
                value={subscriptionStats.activeSubscriptions}
                color="green"
                icon={CheckCircle}
                subtitle="Currently active"
              />
              <StatCard
                title="Expiring Soon"
                value={subscriptionStats.expiringSubscriptions}
                color="yellow"
                icon={AlertTriangle}
                subtitle="Within 7 days"
              />
              <StatCard
                title="Total Subscriptions"
                value={subscriptionStats.totalSubscriptions}
                color="blue"
                icon={Package}
                subtitle="All time"
              />
            </div>

            {/* Quick Insights Card */}
            <div className=" p-2">
              <QuickInsights />
            </div>
            {/* Data Visualization Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 p-2">
              <ChartCard
                title="Properties by State"
                data={geographicData.hotelsByState || {}}
                color="blue"
                maxValue={Math.max(
                  ...Object.values(geographicData.hotelsByState || {}),
                  1
                )}
                icon={MapPin}
                delay={0}
              />
              <ChartCard
                title="Properties by District"
                data={geographicData.hotelsByDistrict || {}}
                color="green"
                maxValue={Math.max(
                  ...Object.values(geographicData.hotelsByDistrict || {}),
                  1
                )}
                icon={Globe}
                delay={200}
              />
            </div>

            {/* Additional Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 p-2">
              <ChartCard
                title="Properties by City"
                data={geographicData.hotelsByCity || {}}
                color="purple"
                maxValue={Math.max(
                  ...Object.values(geographicData.hotelsByCity || {}),
                  1
                )}
                icon={Building2}
                delay={400}
              />
              <ChartCard
                title="Properties by Type"
                data={geographicData.hotelsByType || {}}
                color="orange"
                maxValue={Math.max(
                  ...Object.values(geographicData.hotelsByType || {}),
                  1
                )}
                icon={Utensils}
                delay={600}
              />
            </div>
          </>
        )}

        {/* Footer Info */}
        {!loading && !error && (
          <div className="text-center py-6 animate-fade-in-up">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
              <div>
                <span className="font-semibold text-green-600">
                  {calculatedStats.activeHotels}
                </span>{" "}
                Active
              </div>
              <div>
                <span className="font-semibold text-red-600">
                  {calculatedStats.inactiveHotels}
                </span>{" "}
                Inactive
              </div>
              <div>
                <span className="font-semibold text-blue-600">
                  {calculatedStats.totalStates}
                </span>{" "}
                States
              </div>
              <div>
                <span className="font-semibold text-purple-600">
                  {calculatedStats.totalDistricts}
                </span>{" "}
                Districts
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Dashboard powered by Real-time Firestore Analytics • Data
              refreshed automatically • Total Properties:{" "}
              <span className="font-semibold">
                {calculatedStats.totalProperties}
              </span>
            </p>
          </div>
        )}
      </div>
    </SuperAdminDashboardLayout>
  );
};

export default SuperAdminDashboard;
