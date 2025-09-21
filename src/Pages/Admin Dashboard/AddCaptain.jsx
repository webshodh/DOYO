// src/Pages/Admin/AddCaptain.jsx
import React, { useState, useCallback, useMemo, memo, Suspense } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle,
  Wifi,
  WifiOff,
} from "lucide-react";

// ✅ NEW: Import context hooks for better integration
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";

import PageTitle from "../../atoms/PageTitle";
import { ViewCaptainColumns } from "../../Constants/Columns";
import { useCaptain } from "../../hooks/useCaptain";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import StatCard from "components/Cards/StatCard";
import NoSearchResults from "molecules/NoSearchResults";
import PrimaryButton from "atoms/Buttons/PrimaryButton";
import SearchWithResults from "molecules/SearchWithResults";
import ErrorMessage from "atoms/Messages/ErrorMessage";

// Lazy load heavy components
const CaptainFormModal = React.lazy(() =>
  import("../../components/FormModals/CaptainFormModal")
);
const DynamicTable = React.lazy(() => import("../../organisms/DynamicTable"));

// Main AddCaptain component
const AddCaptain = memo(() => {
  const { hotelName } = useParams();

  // ✅ NEW: Use context hooks for better integration
  const { currentUser, isAdmin, canManageHotel } = useAuth();
  const { selectedHotel, selectHotelById } = useHotelContext();

  // ✅ ENHANCED: Use the active hotel name with fallback
  const activeHotelName = hotelName || selectedHotel?.name || selectedHotel?.id;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCaptain, setEditingCaptain] = useState(null);

  // ✅ ENHANCED: Use the updated useCaptain hook with all new features
  const {
    captains,
    filteredCaptains,
    searchTerm,
    loading,
    submitting,
    error,
    lastFetch,
    retryCount,
    connectionStatus,
    sortOrder,
    filterStatus,
    handleFormSubmit,
    handleSearchChange,
    handleSortChange,
    handleFilterChange,
    deleteCaptain,
    toggleCaptainStatus,
    prepareForEdit,
    refreshCaptains,
    clearFilters,
    // Enhanced computed values
    captainCount,
    filteredCount,
    hasCaptains,
    hasSearchResults,
    activeCaptains,
    inactiveCaptains,
    hasFiltersApplied,
    isRetrying,
    canRetry,
    dataAge,
    // Additional utilities
    getCaptainStats,
    bulkUpdateStatus,
    exportCaptains,
    getCaptainById,
  } = useCaptain(activeHotelName);

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

  // ✅ ENHANCED: Memoized calculations with additional stats
  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentCount = captains.filter((captain) => {
      const createdDate = captain.createdAt?.toDate
        ? captain.createdAt.toDate()
        : new Date(captain.createdAt);
      return createdDate > weekAgo;
    }).length;

    const thisMonthCount = captains.filter((captain) => {
      const createdDate = captain.createdAt?.toDate
        ? captain.createdAt.toDate()
        : new Date(captain.createdAt);
      return createdDate > monthAgo;
    }).length;

    return {
      total: captainCount,
      active: activeCaptains,
      inactive: inactiveCaptains,
      recent: recentCount,
      thisMonth: thisMonthCount,
    };
  }, [captains, captainCount, activeCaptains, inactiveCaptains]);

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
      alert("You don't have permission to add captains for this hotel.");
      return;
    }
    setEditingCaptain(null);
    setShowModal(true);
  }, [hasPermission]);

  const handleEditClick = useCallback(
    async (captain) => {
      if (!hasPermission) {
        alert("You don't have permission to edit captains for this hotel.");
        return;
      }

      try {
        const captainToEdit = await prepareForEdit(captain);
        if (captainToEdit) {
          setEditingCaptain(captainToEdit);
          setShowModal(true);
        }
      } catch (error) {
        console.error("Error preparing captain for edit:", error);
      }
    },
    [prepareForEdit, hasPermission]
  );

  const handleDeleteClick = useCallback(
    async (captain) => {
      if (!hasPermission) {
        alert("You don't have permission to delete captains for this hotel.");
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to delete "${captain.firstName} ${captain.lastName}"? This action cannot be undone.`
      );

      if (confirmed) {
        try {
          await deleteCaptain(captain);
        } catch (error) {
          console.error("Error deleting captain:", error);
        }
      }
    },
    [deleteCaptain, hasPermission]
  );

  const handleToggleStatus = useCallback(
    async (captainId, currentStatus) => {
      if (!hasPermission) {
        alert("You don't have permission to modify captains for this hotel.");
        return;
      }

      try {
        await toggleCaptainStatus(captainId, currentStatus);
      } catch (error) {
        console.error("Error toggling captain status:", error);
      }
    },
    [toggleCaptainStatus, hasPermission]
  );

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setEditingCaptain(null);
  }, []);

  const handleModalSubmit = useCallback(
    async (captainData, captainId = null) => {
      try {
        const success = await handleFormSubmit(captainData, captainId);
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
    refreshCaptains();
  }, [refreshCaptains]);

  // ✅ NEW: Enhanced filter handlers
  const handleStatusFilter = useCallback(
    (status) => {
      handleFilterChange(status);
    },
    [handleFilterChange]
  );

  const handleClearAllFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  // ✅ NEW: Export functionality
  const handleExport = useCallback(async () => {
    try {
      const data = exportCaptains();
      const csv = data.map((row) => Object.values(row).join(",")).join("\n");
      const headers = Object.keys(data[0] || {}).join(",");
      const csvContent = headers + "\n" + csv;

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `captains_${activeHotelName}_${
          new Date().toISOString().split("T")[0]
        }.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting captains:", error);
    }
  }, [exportCaptains, activeHotelName]);

  // ✅ ENHANCED: Error state with connection info
  if (error && connectionStatus === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <ErrorMessage
              error={error}
              onRetry={handleRefresh}
              title="Error Loading Captains"
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
            You don't have permission to manage captains for this hotel.
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
            Please select a hotel to manage captains.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !captains.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading captains..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Captain Form Modal */}
      <Suspense fallback={<LoadingSpinner />}>
        <CaptainFormModal
          show={showModal}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          editCaptain={editingCaptain}
          existingCaptains={captains}
          title={editingCaptain ? "Edit Captain" : "Add Captain"}
          submitting={submitting}
          hotelName={activeHotelName}
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
                pageTitle="Captain Management"
                className="text-2xl sm:text-3xl font-bold text-gray-900"
                description={`Manage captains for ${activeHotelName}`}
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
              {hasCaptains && (
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
                btnText="Add Captain"
                loading={submitting}
                disabled={!hasPermission}
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {hasCaptains && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Users}
              title="Total Captains"
              value={stats.total}
              color="blue"
              subtitle={`${stats.thisMonth} added this month`}
            />
            <StatCard
              icon={UserCheck}
              title="Active Captains"
              value={stats.active}
              color="green"
              subtitle={`${Math.round(
                (stats.active / stats.total) * 100
              )}% of total`}
            />
            <StatCard
              icon={UserX}
              title="Inactive Captains"
              value={stats.inactive}
              color="red"
              subtitle={stats.inactive > 0 ? "Need attention" : "All active"}
            />
            <StatCard
              icon={Clock}
              title="Recent (7 days)"
              value={stats.recent}
              color="purple"
              subtitle={stats.recent > 0 ? "New additions" : "No new captains"}
            />
          </div>
        )}

        {/* ✅ NEW: Filter Controls */}
        {hasCaptains && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStatusFilter("all")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterStatus === "all"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  onClick={() => handleStatusFilter("active")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterStatus === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Active ({stats.active})
                </button>
                <button
                  onClick={() => handleStatusFilter("inactive")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterStatus === "inactive"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Inactive ({stats.inactive})
                </button>
              </div>

              {hasFiltersApplied && (
                <button
                  onClick={handleClearAllFilters}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        {hasCaptains && (
          <SearchWithResults
            searchTerm={searchTerm}
            onSearchChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search captains by name, email, mobile, or Aadhar..."
            totalCount={captainCount}
            filteredCount={filteredCount}
            onClearSearch={handleClearSearch}
            totalLabel="total captains"
            showResultsCount={true}
          />
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {hasCaptains ? (
            <>
              {hasSearchResults ? (
                <Suspense fallback={<LoadingSpinner text="Loading table..." />}>
                  <DynamicTable
                    columns={ViewCaptainColumns}
                    data={filteredCaptains}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onToggleStatus={handleToggleStatus}
                    loading={submitting}
                    emptyMessage="No captains match your search criteria"
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
                  />
                </Suspense>
              ) : (
                <NoSearchResults
                  btnText="Add Captain"
                  searchTerm={searchTerm}
                  onClearSearch={handleClearSearch}
                  onAddNew={handleAddClick}
                  hasFilters={hasFiltersApplied}
                  onClearFilters={handleClearAllFilters}
                />
              )}
            </>
          ) : (
            <EmptyState
              icon={Users}
              title="No Captains Yet"
              description={`Add your first captain to start managing service staff for ${activeHotelName}. Captains help coordinate between kitchen and customers for better service.`}
              actionLabel="Add Your First Captain"
              onAction={handleAddClick}
              loading={submitting}
              disabled={!hasPermission}
            />
          )}
        </div>

        {/* ✅ NEW: Footer with metadata */}
        <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
          {connectionStatus === "connected" && (
            <div className="flex items-center justify-center gap-4">
              <span>Total captains: {captainCount}</span>
              {filteredCount !== captainCount && (
                <span>Filtered: {filteredCount}</span>
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

AddCaptain.displayName = "AddCaptain";

export default AddCaptain;
