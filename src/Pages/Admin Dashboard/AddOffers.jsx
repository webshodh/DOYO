// src/Pages/Admin/AddOffers.jsx
import React, { useState, useCallback, useMemo, memo, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import {
  Plus,
  Tags,
  LoaderCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  DollarSign,
  Wifi,
  WifiOff,
  Gift,
  Target,
  Users,
  Calendar,
} from "lucide-react";

// ✅ NEW: Import context hooks for better integration
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";

import PageTitle from "../../atoms/PageTitle";
import { ViewOffersColumns } from "../../Constants/Columns";
import { useOffers } from "../../hooks/useOffers";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import NoSearchResults from "molecules/NoSearchResults";
import StatCard from "components/Cards/StatCard";
import PrimaryButton from "atoms/Buttons/PrimaryButton";
import SearchWithResults from "molecules/SearchWithResults";
import ErrorMessage from "atoms/Messages/ErrorMessage";

// Lazy load heavy components
const OffersFormModal = React.lazy(() =>
  import("../../components/FormModals/OffersFormModal")
);
const DynamicTable = React.lazy(() => import("../../organisms/DynamicTable"));

// Main AddOffers component
const AddOffers = memo(() => {
  const navigate = useNavigate();
  const { hotelName } = useParams();

  // ✅ NEW: Use context hooks for better integration
  const { currentUser, isAdmin, canManageHotel } = useAuth();
  const { selectedHotel, selectHotelById } = useHotelContext();

  // ✅ ENHANCED: Use the active hotel name with fallback
  const activeHotelName = hotelName || selectedHotel?.name || selectedHotel?.id;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  // ✅ ENHANCED: Use the updated useOffers hook with all new features
  const {
    offers,
    filteredOffers,
    searchTerm,
    loading,
    submitting,
    error,
    connectionStatus,
    lastFetch,
    retryCount,
    sortOrder,
    filterType,
    statusFilter,
    // Enhanced actions
    handleFormSubmit,
    handleSearchChange,
    handleSortChange,
    handleFilterChange,
    handleStatusFilter,
    deleteOffer,
    duplicateOffer,
    toggleOfferStatus,
    prepareForEdit,
    refreshOffers,
    clearAllFilters,
    // Enhanced computed values
    offerCount,
    filteredCount,
    hasOffers,
    hasSearchResults,
    activeOfferCount,
    expiredOfferCount,
    expiringSoonCount,
    hasFiltersApplied,
    isRetrying,
    canRetry,
    dataAge,
    // Additional utilities
    getOfferStats,
    bulkUpdateOfferStatus,
    exportOffers,
    getOfferById,
    getActiveOffers,
    getExpiredOffers,
    getExpiringSoonOffers,
    isOfferExpired,
    isOfferExpiringSoon,
  } = useOffers(activeHotelName);

  // ✅ NEW: Auto-update hotel selection if needed
  React.useEffect(() => {
    if (hotelName && selectedHotel?.name !== hotelName) {
      selectHotelById(hotelName);
    }
  }, [hotelName, selectedHotel, selectHotelById]);

  // ✅ NEW: Permission check
  const hasPermission = useMemo(() => {
    return isAdmin() && canManageHotel(activeHotelName);
  }, [isAdmin, canManageHotel, activeHotelName]);

  // ✅ ENHANCED: Memoized calculations with detailed offer analytics
  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Count offers by different criteria
    const activeCount = offers.filter(
      (offer) => offer.isActive && !isOfferExpired(offer)
    ).length;

    const expiredCount = offers.filter(isOfferExpired).length;

    const expiringSoonCount = offers.filter(isOfferExpiringSoon).length;

    const recentCount = offers.filter((offer) => {
      const createdDate = offer.createdAt?.toDate
        ? offer.createdAt.toDate()
        : new Date(offer.createdAt);
      return createdDate > weekAgo;
    }).length;

    const thisMonthCount = offers.filter((offer) => {
      const createdDate = offer.createdAt?.toDate
        ? offer.createdAt.toDate()
        : new Date(offer.createdAt);
      return createdDate > monthAgo;
    }).length;

    const totalUsage = offers.reduce(
      (sum, offer) => sum + (offer.currentUsageCount || 0),
      0
    );

    const percentageOffers = offers.filter(
      (offer) => offer.offerType === "percentage"
    ).length;

    const fixedOffers = offers.filter(
      (offer) => offer.offerType === "fixed"
    ).length;

    return {
      total: offerCount,
      active: activeCount,
      expired: expiredCount,
      expiringSoon: expiringSoonCount,
      recent: recentCount,
      thisMonth: thisMonthCount,
      totalUsage,
      percentageOffers,
      fixedOffers,
      activePercentage:
        offerCount > 0 ? Math.round((activeCount / offerCount) * 100) : 0,
    };
  }, [offers, offerCount, isOfferExpired, isOfferExpiringSoon]);

  // ✅ NEW: Load offer stats
  const [offerStats, setOfferStats] = React.useState(null);
  React.useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await getOfferStats();
        setOfferStats(stats);
      } catch (error) {
        console.warn("Failed to load offer stats:", error);
      }
    };

    if (hasOffers) {
      loadStats();
    }
  }, [getOfferStats, hasOffers]);

  // ✅ NEW: Connection status indicator
  const ConnectionStatusIndicator = memo(() => {
    if (connectionStatus === "connecting" || isRetrying) {
      return (
        <div className="flex items-center gap-2 text-yellow-600 text-sm">
          <Wifi className="animate-pulse" size={16} />
          <span>{isRetrying ? "Retrying..." : "Connecting..."}</span>
        </div>
      );
    }

    if (connectionStatus === "error") {
      return (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <WifiOff size={16} />
          <span>Connection Error</span>
          {canRetry && (
            <button
              onClick={handleRefresh}
              className="text-blue-600 hover:text-blue-800 underline ml-1"
            >
              Retry
            </button>
          )}
        </div>
      );
    }

    if (connectionStatus === "connected" && dataAge) {
      const ageMinutes = Math.floor(dataAge / (1000 * 60));
      if (ageMinutes > 5) {
        return (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Clock size={14} />
            <span>Updated {ageMinutes}m ago</span>
          </div>
        );
      }
    }

    return null;
  });

  // Event handlers
  const handleAddClick = useCallback(() => {
    if (!hasPermission) {
      alert("You don't have permission to add offers for this hotel.");
      return;
    }
    setEditingOffer(null);
    setShowModal(true);
  }, [hasPermission]);

  const handleEditClick = useCallback(
    async (offer) => {
      if (!hasPermission) {
        alert("You don't have permission to edit offers for this hotel.");
        return;
      }

      try {
        const offerToEdit = await prepareForEdit(offer);
        if (offerToEdit) {
          setEditingOffer(offerToEdit);
          setShowModal(true);
        }
      } catch (error) {
        console.error("Error preparing offer for edit:", error);
      }
    },
    [prepareForEdit, hasPermission]
  );

  const handleDeleteClick = useCallback(
    async (offer) => {
      if (!hasPermission) {
        alert("You don't have permission to delete offers for this hotel.");
        return;
      }

      // Show confirmation dialog with usage information
      const usageInfo =
        offer.currentUsageCount > 0
          ? ` This offer has been used ${offer.currentUsageCount} times.`
          : "";

      const confirmed = window.confirm(
        `Are you sure you want to delete "${
          offer.offerName || offer.title
        }"?${usageInfo} This action cannot be undone.`
      );

      if (confirmed) {
        try {
          await deleteOffer(offer);
        } catch (error) {
          console.error("Error deleting offer:", error);
        }
      }
    },
    [deleteOffer, hasPermission]
  );

  const handleStatusToggle = useCallback(
    async (offer) => {
      if (!hasPermission) {
        alert("You don't have permission to modify offers for this hotel.");
        return;
      }

      try {
        await toggleOfferStatus(offer);
      } catch (error) {
        console.error("Error toggling offer status:", error);
      }
    },
    [toggleOfferStatus, hasPermission]
  );

  // ✅ NEW: Duplicate offer handler
  const handleDuplicateClick = useCallback(
    async (offer) => {
      if (!hasPermission) {
        alert("You don't have permission to duplicate offers for this hotel.");
        return;
      }

      try {
        await duplicateOffer(offer);
      } catch (error) {
        console.error("Error duplicating offer:", error);
      }
    },
    [duplicateOffer, hasPermission]
  );

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setEditingOffer(null);
  }, []);

  const handleModalSubmit = useCallback(
    async (offerData, offerId = null) => {
      try {
        const success = await handleFormSubmit(offerData, offerId);
        if (success) {
          handleModalClose();
        }
        return success;
      } catch (error) {
        console.error("Error submitting form:", error);
        return false;
      }
    },
    [handleFormSubmit, handleModalClose]
  );

  const handleClearSearch = useCallback(() => {
    handleSearchChange("");
  }, [handleSearchChange]);

  const handleRefresh = useCallback(() => {
    refreshOffers();
  }, [refreshOffers]);

  // ✅ NEW: Export functionality
  const handleExport = useCallback(async () => {
    try {
      const data = exportOffers();
      const csv = data.map((row) => Object.values(row).join(",")).join("\n");
      const headers = Object.keys(data[0] || {}).join(",");
      const csvContent = headers + "\n" + csv;

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `offers_${activeHotelName}_${
          new Date().toISOString().split("T")[0]
        }.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting offers:", error);
    }
  }, [exportOffers, activeHotelName]);

  // ✅ ENHANCED: Error state with connection info
  if (error && connectionStatus === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <ErrorMessage
              error={error}
              onRetry={handleRefresh}
              title="Error Loading Offers"
              showRetryButton={canRetry}
            />
            <div className="mt-4 text-center">
              <ConnectionStatusIndicator />
              {retryCount > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Attempted {retryCount} time{retryCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ NEW: Permission check
  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600">
            You don't have permission to manage offers for this hotel.
          </p>
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
            No Hotel Selected
          </h3>
          <p className="text-gray-600">
            Please select a hotel to manage offers.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !offers.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading offers..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Offers Form Modal */}
      <Suspense fallback={<LoadingSpinner />}>
        <OffersFormModal
          show={showModal}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          editOffer={editingOffer}
          title={editingOffer ? "Edit Offer" : "Add Offer"}
          submitting={submitting}
          hotelName={activeHotelName}
          existingOffers={offers}
        />
      </Suspense>

      <div>
        {/* ✅ NEW: Connection Status Bar */}
        {connectionStatus !== "connected" && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 mb-4">
            <div className="flex items-center justify-between">
              <ConnectionStatusIndicator />
              <span className="text-xs text-gray-600">
                Last fetch:{" "}
                {lastFetch ? new Date(lastFetch).toLocaleTimeString() : "Never"}
              </span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center justify-between w-full">
            <div>
              <PageTitle
                pageTitle="Offers Management"
                className="text-2xl sm:text-3xl font-bold text-gray-900"
                description={`Manage promotional offers for ${activeHotelName}`}
              />

              {/* ✅ NEW: Live status indicator */}
              {connectionStatus === "connected" && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Live updates</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* ✅ NEW: Export button */}
              {hasOffers && (
                <button
                  onClick={handleExport}
                  className="text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Export CSV
                </button>
              )}

              <PrimaryButton
                onAdd={handleAddClick}
                btnText="Add Offer"
                loading={submitting}
                disabled={!hasPermission}
              />
            </div>
          </div>
        </div>

        {/* ✅ ENHANCED: Stats Cards with comprehensive offer analytics */}
        {hasOffers && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Gift}
              title="Total Offers"
              value={stats.total}
              color="blue"
              subtitle={`${stats.thisMonth} added this month`}
            />
            <StatCard
              icon={TrendingUp}
              title="Active Offers"
              value={stats.active}
              color="green"
              subtitle={`${stats.activePercentage}% of total`}
            />
            <StatCard
              icon={Clock}
              title="Expiring Soon"
              value={stats.expiringSoon}
              color="yellow"
              subtitle={
                stats.expired > 0 ? `${stats.expired} expired` : "All current"
              }
            />
            <StatCard
              icon={Users}
              title="Total Usage"
              value={stats.totalUsage}
              color="purple"
              subtitle={
                stats.totalUsage > 0 ? "Customer redemptions" : "No usage yet"
              }
            />
          </div>
        )}

        {/* ✅ NEW: Filter Controls */}
        {hasOffers && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  Filter by:
                </span>
                <button
                  onClick={() => handleFilterChange("all")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterType === "all"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  onClick={() => handleFilterChange("active")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterType === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Active ({stats.active})
                </button>
                <button
                  onClick={() => handleFilterChange("expired")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterType === "expired"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Expired ({stats.expired})
                </button>
                <button
                  onClick={() => handleFilterChange("expiring")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterType === "expiring"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Expiring Soon ({stats.expiringSoon})
                </button>
              </div>

              <div className="flex items-center gap-4">
                {/* ✅ NEW: Sort controls */}
                <select
                  value={sortOrder}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="default">Sort: Default</option>
                  <option value="newest">Sort: Newest</option>
                  <option value="expiry_asc">Sort: Expiring First</option>
                  <option value="usage_desc">Sort: Most Used</option>
                  <option value="discount_desc">Sort: Highest Discount</option>
                </select>

                {hasFiltersApplied && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        {hasOffers && (
          <SearchWithResults
            searchTerm={searchTerm}
            onSearchChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search offers by name, description, code, or type..."
            totalCount={offerCount}
            filteredCount={filteredCount}
            onClearSearch={handleClearSearch}
            totalLabel="total offers"
            showResultsCount={true}
          />
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {hasOffers ? (
            <>
              {hasSearchResults ? (
                <Suspense fallback={<LoadingSpinner text="Loading table..." />}>
                  <DynamicTable
                    columns={ViewOffersColumns}
                    data={filteredOffers}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onToggleStatus={handleStatusToggle}
                    loading={submitting}
                    emptyMessage="No offers match your search criteria"
                    showPagination={true}
                    initialRowsPerPage={10}
                    sortable={true}
                    className="border-0"
                    // ✅ NEW: Enhanced table props
                    searchable={false} // We handle search externally
                    exportable={false} // We handle export externally
                    refreshable={true}
                    onRefresh={handleRefresh}
                    connectionStatus={connectionStatus}
                    // ✅ NEW: Custom actions
                    customActions={[
                      {
                        label: "Duplicate",
                        icon: "📋",
                        onClick: handleDuplicateClick,
                        condition: () => hasPermission,
                      },
                    ]}
                  />
                </Suspense>
              ) : (
                <NoSearchResults
                  btnText="Add Offer"
                  searchTerm={searchTerm}
                  onClearSearch={handleClearSearch}
                  onAddNew={handleAddClick}
                  hasFilters={hasFiltersApplied}
                  onClearFilters={clearAllFilters}
                />
              )}
            </>
          ) : (
            <EmptyState
              icon={Gift}
              title="No Offers Yet"
              description={`Create your first promotional offer for ${activeHotelName} to attract more customers. Offers help boost sales and customer engagement with discounts, deals, and special promotions.`}
              actionLabel="Add Your First Offer"
              onAction={handleAddClick}
              loading={submitting}
              disabled={!hasPermission}
              // ✅ NEW: Additional suggestions
              suggestions={[
                "Start with percentage discounts (10%, 20%, etc.)",
                "Create time-limited offers to create urgency",
                "Set minimum order amounts for better profitability",
                "Use clear, attractive offer names and descriptions",
              ]}
            />
          )}
        </div>

        {/* ✅ NEW: Footer with insights */}
        <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
          {connectionStatus === "connected" && (
            <div className="flex items-center justify-center gap-4">
              <span>Total offers: {offerCount}</span>
              {filteredCount !== offerCount && (
                <span>Filtered: {filteredCount}</span>
              )}
              {stats.expiringSoon > 0 && (
                <span className="text-orange-600">
                  {stats.expiringSoon} offers expiring soon
                </span>
              )}
              {stats.expired > 0 && (
                <span className="text-red-600">
                  {stats.expired} offers expired
                </span>
              )}
              {stats.totalUsage > 0 && (
                <span className="text-green-600">
                  {stats.totalUsage} total redemptions
                </span>
              )}
              {lastFetch && (
                <span>
                  Last updated: {new Date(lastFetch).toLocaleTimeString()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
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
});

AddOffers.displayName = "AddOffers";

export default AddOffers;
