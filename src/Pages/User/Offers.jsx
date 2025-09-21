// src/Pages/User/Offers.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
// ✅ REMOVED: Old data hook
// import useOffersData from "../../data/useOffersData";

// ✅ NEW: Import Firestore-based hooks and contexts
import { useOffers } from "../../hooks/useOffers";
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";

import CategoryTabs from "../../molecules/CategoryTab";
import NavBar from "organisms/Navbar";
import { Spinner } from "atoms";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import LoadingSpinner from "atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import {
  Calendar,
  Gift,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
} from "lucide-react";

const Offers = () => {
  const { hotelName } = useParams();
  const navigate = useNavigate();

  // ✅ NEW: Use context hooks
  const { currentUser, isAuthenticated } = useAuth();
  const { selectedHotel, selectHotelById } = useHotelContext();

  // ✅ ENHANCED: Use the active hotel name with fallback
  const activeHotelName = hotelName || selectedHotel?.name || selectedHotel?.id;

  // ✅ NEW: Use Firestore-based offers hook instead of old data hook
  const {
    offers: offersData,
    filteredOffers,
    loading,
    error,
    connectionStatus,
    filterType,
    handleFilterChange,
    refreshOffers,
    // Computed values
    offerCount,
    filteredCount,
    hasOffers,
    activeOfferCount,
    expiredOfferCount,
    expiringSoonCount,
    // Helper functions
    getActiveOffers,
    getExpiredOffers,
    getExpiringSoonOffers,
    getOffersByType,
    isOfferExpired,
    isOfferExpiringSoon,
  } = useOffers(activeHotelName);

  // Local state
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid");

  // ✅ NEW: Auto-update hotel selection if needed
  useEffect(() => {
    if (hotelName && selectedHotel?.name !== hotelName) {
      selectHotelById(hotelName);
    }
  }, [hotelName, selectedHotel, selectHotelById]);

  // ✅ NEW: Get unique offer types from actual data
  const offerTypes = useMemo(() => {
    const types = [...new Set(offersData.map((offer) => offer.offerType))];
    return types.filter(Boolean); // Remove any null/undefined types
  }, [offersData]);

  // Helper function - defined early to avoid hoisting issues
  const getOfferTypeLabel = useCallback((type) => {
    if (!type) return "Unknown";
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, []);

  // ✅ ENHANCED: Create category counts for CategoryTabs with better data handling
  const categoryCountsByType = useMemo(() => {
    const counts = { All: offersData.length };

    offerTypes.forEach((type) => {
      const label = getOfferTypeLabel(type);
      counts[label] = offersData.filter(
        (offer) => offer.offerType === type
      ).length;
    });

    // Add status-based categories
    counts["Active"] = activeOfferCount;
    counts["Expired"] = expiredOfferCount;
    counts["Expiring Soon"] = expiringSoonCount;

    return counts;
  }, [
    offersData,
    offerTypes,
    getOfferTypeLabel,
    activeOfferCount,
    expiredOfferCount,
    expiringSoonCount,
  ]);

  // Handle category filter
  const handleCategoryFilter = useCallback(
    (categoryName, type) => {
      setSelectedCategory(categoryName);

      // Update hook filter based on selection
      if (categoryName === "All") {
        handleFilterChange("all");
      } else if (categoryName === "Active") {
        handleFilterChange("active");
      } else if (categoryName === "Expired") {
        handleFilterChange("expired");
      } else if (categoryName === "Expiring Soon") {
        handleFilterChange("expiring");
      } else {
        // It's an offer type
        handleFilterChange("all"); // Reset filter to show all, then filter by type locally
      }
    },
    [handleFilterChange]
  );

  // ✅ ENHANCED: Filter offers based on selected category and status
  const finalFilteredOffers = useMemo(() => {
    let filtered = [...offersData];

    if (selectedCategory === "All") {
      // Show all offers
    } else if (selectedCategory === "Active") {
      filtered = getActiveOffers();
    } else if (selectedCategory === "Expired") {
      filtered = getExpiredOffers();
    } else if (selectedCategory === "Expiring Soon") {
      filtered = getExpiringSoonOffers();
    } else {
      // Filter by offer type
      const matchingType = offerTypes.find(
        (type) => getOfferTypeLabel(type) === selectedCategory
      );
      if (matchingType) {
        filtered = getOffersByType(matchingType);
      }
    }

    return filtered;
  }, [
    offersData,
    selectedCategory,
    offerTypes,
    getOfferTypeLabel,
    getActiveOffers,
    getExpiredOffers,
    getExpiringSoonOffers,
    getOffersByType,
  ]);

  // ✅ ENHANCED: Date formatting with error handling
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Not specified";

    try {
      // Handle Firestore timestamp or regular date string
      const date = dateString.toDate
        ? dateString.toDate()
        : new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      console.warn("Error formatting date:", error);
      return "Invalid date";
    }
  }, []);

  // ✅ NEW: Get offer status
  const getOfferStatus = useCallback(
    (offer) => {
      if (!offer.isActive)
        return { status: "inactive", color: "gray", icon: XCircle };
      if (isOfferExpired(offer))
        return { status: "expired", color: "red", icon: XCircle };
      if (isOfferExpiringSoon(offer))
        return { status: "expiring", color: "yellow", icon: AlertTriangle };
      return { status: "active", color: "green", icon: CheckCircle };
    },
    [isOfferExpired, isOfferExpiringSoon]
  );

  // ✅ NEW: Calculate discount display
  const getDiscountDisplay = useCallback((offer) => {
    if (!offer.discountValue) return null;

    switch (offer.offerType) {
      case "percentage":
        return `${offer.discountValue}% OFF`;
      case "fixed":
        return `₹${offer.discountValue} OFF`;
      case "free_delivery":
        return "FREE DELIVERY";
      case "buy_one_get_one":
        return "BOGO";
      default:
        return `₹${offer.discountValue} OFF`;
    }
  }, []);

  // ✅ ENHANCED: Create categories array for CategoryTabs (for offer types + status)
  const categoryTabsData = useMemo(() => {
    const categories = [
      { categoryName: "All" },
      { categoryName: "Active" },
      { categoryName: "Expiring Soon" },
      { categoryName: "Expired" },
    ];

    // Add offer type categories
    offerTypes.forEach((type) => {
      categories.push({
        categoryName: getOfferTypeLabel(type),
      });
    });

    return categories;
  }, [offerTypes, getOfferTypeLabel]);

  // ✅ NEW: Connection status indicator
  const ConnectionStatusIndicator = () => {
    if (connectionStatus === "connecting") {
      return (
        <div className="flex items-center gap-2 text-yellow-600 text-sm">
          <Wifi className="animate-pulse" size={16} />
          <span>Connecting...</span>
        </div>
      );
    }

    if (connectionStatus === "error") {
      return (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <WifiOff size={16} />
          <span>Connection Error</span>
          <button
            onClick={refreshOffers}
            className="text-blue-600 hover:text-blue-800 underline ml-1"
          >
            Retry
          </button>
        </div>
      );
    }

    return null;
  };

  // ✅ ENHANCED: Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar
          hotelName={activeHotelName}
          title={activeHotelName}
          Fabar={true}
          style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}
          home={true}
        />
        <div className="pt-20 flex items-center justify-center">
          <LoadingSpinner text="Loading offers..." />
        </div>
      </div>
    );
  }

  // ✅ ENHANCED: Error state
  if (error && connectionStatus === "error") {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar
          hotelName={activeHotelName}
          title={activeHotelName}
          Fabar={true}
          style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}
          home={true}
        />
        <div className="pt-20 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <ErrorMessage
              message={error.message || "Failed to load offers"}
              onRetry={refreshOffers}
              showRetryButton={true}
            />
            <div className="mt-4">
              <ConnectionStatusIndicator />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ NEW: No hotel selected state
  if (!activeHotelName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Restaurant Selected
          </h3>
          <p className="text-gray-600">
            Please select a restaurant to view offers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <NavBar
        hotelName={activeHotelName}
        title={activeHotelName}
        Fabar={true}
        style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}
        home={true}
      />

      {/* ✅ NEW: Connection Status Bar */}
      {connectionStatus !== "connected" && (
        <div className="fixed top-16 left-0 right-0 bg-yellow-50 border-b border-yellow-200 px-4 py-2 z-40">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <ConnectionStatusIndicator />
            {connectionStatus === "error" && (
              <span className="text-xs text-gray-600">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ✅ ENHANCED: Header with stats */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Special Offers</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Gift size={16} />
                {offerCount} Total
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle size={16} className="text-green-600" />
                {activeOfferCount} Active
              </span>
              {expiringSoonCount > 0 && (
                <span className="flex items-center gap-1">
                  <Clock size={16} className="text-yellow-600" />
                  {expiringSoonCount} Expiring
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Filters using CategoryTabs */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="space-y-6">
            {/* Category Filter */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Filter by Category
              </h3>
              <CategoryTabs
                categories={categoryTabsData}
                menuCountsByCategory={categoryCountsByType}
                handleCategoryFilter={handleCategoryFilter}
                initialActiveTab={selectedCategory}
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Showing {finalFilteredOffers.length} of {offerCount} offers
            {selectedCategory !== "All" && (
              <span className="ml-2 text-blue-600 font-medium">
                in {selectedCategory}
              </span>
            )}
          </p>

          {connectionStatus === "connected" && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Live
            </span>
          )}
        </div>

        {/* Offers Grid */}
        {finalFilteredOffers.length === 0 ? (
          hasOffers ? (
            <EmptyState
              title="No offers found"
              message={
                selectedCategory !== "All"
                  ? `No offers found in "${selectedCategory}" category.`
                  : "No offers match your current filters."
              }
              actionLabel={
                selectedCategory !== "All" ? "Show All Offers" : "Refresh"
              }
              onAction={
                selectedCategory !== "All"
                  ? () => handleCategoryFilter("All", "all")
                  : refreshOffers
              }
            />
          ) : (
            <EmptyState
              title="No offers available"
              message="This restaurant hasn't created any offers yet. Check back later for exciting deals!"
              actionLabel="Refresh"
              onAction={refreshOffers}
            />
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {finalFilteredOffers.map((offer) => {
              const offerStatus = getOfferStatus(offer);
              const discountDisplay = getDiscountDisplay(offer);
              const StatusIcon = offerStatus.icon;

              return (
                <div
                  key={offer.offerId || offer.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative"
                >
                  {/* ✅ NEW: Status indicator */}
                  <div
                    className={`absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${offerStatus.color}-100 text-${offerStatus.color}-800`}
                  >
                    <StatusIcon size={12} />
                    <span className="capitalize">{offerStatus.status}</span>
                  </div>

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4 pr-20">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {offer.offerName}
                        </h3>

                        {/* ✅ NEW: Discount display */}
                        {discountDisplay && (
                          <div className="inline-block px-3 py-1 bg-gradient-to-r from-orange-400 to-red-500 text-white text-sm font-bold rounded-full mb-2">
                            {discountDisplay}
                          </div>
                        )}

                        <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {getOfferTypeLabel(offer.offerType)}
                        </span>
                      </div>
                    </div>

                    {/* ✅ NEW: Offer Code */}
                    {offer.offerCode && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Offer Code:
                          </span>
                          <code className="text-lg font-mono font-bold text-gray-900 bg-white px-2 py-1 rounded">
                            {offer.offerCode}
                          </code>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {offer.offerDescription ||
                        "Special offer - terms and conditions apply."}
                    </p>

                    {/* Offer Details */}
                    <div className="space-y-2 mb-4">
                      {offer.minimumOrderAmount && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Minimum Order:</span>
                          <span className="font-medium">
                            ₹{offer.minimumOrderAmount}
                          </span>
                        </div>
                      )}

                      {offer.maxUsageCount && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Usage Limit:</span>
                          <span className="font-medium">
                            {offer.currentUsageCount || 0} /{" "}
                            {offer.maxUsageCount}
                          </span>
                        </div>
                      )}

                      {offer.usagePerCustomer && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Per Customer:</span>
                          <span className="font-medium">
                            Max {offer.usagePerCustomer} uses
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Validity Period */}
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          Validity Period
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 block">From:</span>
                          <span className="font-medium">
                            {formatDate(offer.validFrom)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Until:</span>
                          <span className="font-medium">
                            {formatDate(offer.validUntil)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Terms */}
                    {offer.terms && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-500 leading-relaxed">
                          <span className="font-medium">
                            Terms & Conditions:
                          </span>{" "}
                          {offer.terms}
                        </p>
                      </div>
                    )}

                    {/* ✅ NEW: Usage stats */}
                    {offer.currentUsageCount > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            Used {offer.currentUsageCount} times
                          </span>
                          {offer.lastUsedAt && (
                            <span className="text-gray-400">
                              Last used: {formatDate(offer.lastUsedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Created Info */}
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-gray-400">
                        Created: {formatDate(offer.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;
