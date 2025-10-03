import React, { useState, useCallback, useMemo, memo, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import {
  Building2,
  Activity,
  AlertTriangle,
  TrendingUp,
  Users,
  Settings,
} from "lucide-react";
import PageTitle from "../../atoms/PageTitle";
import useColumns from "../../Constants/Columns";
import { useHotel } from "../../hooks/useHotel";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import NoSearchResults from "molecules/NoSearchResults";
import StatCard from "components/Cards/StatCard";
import SearchWithResults from "molecules/SearchWithResults";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import { useTranslation } from "react-i18next";
import { useTheme } from "context/ThemeContext";

// Lazy load heavy components
const AddHotelFormModal = React.lazy(() =>
  import("../../components/FormModals/HotelFormModal")
);
const DynamicTable = React.lazy(() => import("../../organisms/DynamicTable"));

// Advanced Filters Component
const AdvancedFilters = memo(
  ({
    filters,
    filterOptions,
    onFilterChange,
    showAdvanced,
    onToggleAdvanced,
  }) => (
    <div className="flex gap-2 flex-wrap">
      <select
        value={filters.status}
        onChange={(e) => onFilterChange("status", e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <select
        value={filters.businessType}
        onChange={(e) => onFilterChange("businessType", e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="all">All Types</option>
        {filterOptions.businessTypes.map((type) => (
          <option key={type} value={type}>
            {type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ")}
          </option>
        ))}
      </select>

      {showAdvanced && (
        <>
          <select
            value={filters.city}
            onChange={(e) => onFilterChange("city", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Cities</option>
            {filterOptions.cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <select
            value={filters.state}
            onChange={(e) => onFilterChange("state", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All States</option>
            {filterOptions.states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          <select
            value={filters.subscriptionPlan}
            onChange={(e) => onFilterChange("subscriptionPlan", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Plans</option>
            {filterOptions.subscriptionPlans.map((plan) => (
              <option key={plan} value={plan}>
                {plan}
              </option>
            ))}
          </select>
        </>
      )}

      <button
        onClick={onToggleAdvanced}
        className={`px-3 py-2 border rounded-lg transition-colors text-sm ${
          showAdvanced
            ? "border-blue-500 bg-blue-50 text-blue-700"
            : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        {showAdvanced ? "Less" : "More"} Filters
      </button>
    </div>
  )
);

// Bulk Actions Component
const BulkActions = memo(
  ({ selectedCount, onBulkUpdate, onClearSelection }) => {
    if (selectedCount === 0) return null;

    return (
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-600">{selectedCount} selected</span>
        <div className="flex gap-1">
          <button
            onClick={() => onBulkUpdate("active")}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
          >
            Activate
          </button>
          <button
            onClick={() => onBulkUpdate("inactive")}
            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
          >
            Deactivate
          </button>
          <button
            onClick={onClearSelection}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    );
  }
);

// Main ViewHotel component
const ViewHotel = memo(() => {
  const { ViewHotelColumns } = useColumns();
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Use custom hook for hotel management
  const {
    hotels,
    filteredHotels,
    searchTerm,
    filters,
    filterOptions,
    loading,
    submitting,
    error,
    hotelStats,
    handleFormSubmit,
    handleSearchChange,
    handleFilterChange,
    clearAllFilters,
    deleteHotel,
    bulkUpdateHotels,
    prepareForEdit,
    refreshHotels,
    selectedHotels,
    handleHotelSelection,
    handleSelectAllHotels,
    clearSelection,
    hotelCount,
    hasHotels,
    hasSearchResults,
    hasFiltersApplied,
    clearError,
  } = useHotel({
    onHotelAdded: (hotelData) => {
      // Generate hotelId the same way as in services
      const hotelId = hotelData.businessName
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toLowerCase();
      // Redirect to add admin route for this newly created hotel
      navigate(`/super-admin/${hotelId}/add-admin`);
    },
  });

  // Memoized calculations
  const stats = useMemo(
    () => ({
      total: hotelStats.total,
      active: hotelStats.active,
      inactive: hotelStats.inactive,
      avgAdminsPerHotel: hotelStats.avgAdminsPerHotel,
      businessTypes: hotelStats.businessTypes,
    }),
    [hotelStats]
  );

  // Event handlers
  const handleAddClick = useCallback(() => {
    setEditingHotel(null);
    setShowModal(true);
    if (error) clearError();
  }, [error, clearError]);

  const handleEditClick = useCallback(
    async (hotel) => {
      try {
        const hotelToEdit = await prepareForEdit(hotel);
        if (hotelToEdit) {
          setEditingHotel(hotelToEdit);
          setShowModal(true);
        }
      } catch (err) {
        console.error("Error preparing hotel for edit:", err);
      }
    },
    [prepareForEdit]
  );

  const handleDeleteClick = useCallback(
    async (hotel) => {
      const hotelName = hotel.businessName || hotel.hotelName || "this hotel";
      const adminCount = hotel.metrics?.totalAdmins || 0;
      const menuCount = hotel.metrics?.totalMenuItems || 0;

      const message =
        adminCount > 0 || menuCount > 0
          ? `⚠️ WARNING: "${hotelName}" has ${adminCount} admin(s) and ${menuCount} menu item(s). Deleting will permanently remove ALL data including orders, categories, and admin accounts.\n\nThis action cannot be undone. Are you sure?`
          : `Are you sure you want to delete "${hotelName}"? This action cannot be undone.`;

      const confirmed = window.confirm(message);

      if (confirmed) {
        try {
          await deleteHotel(hotel);
        } catch (err) {
          console.error("Error deleting hotel:", err);
        }
      }
    },
    [deleteHotel]
  );

  const handleBulkStatusUpdate = useCallback(
    async (status) => {
      if (selectedHotels.length === 0) return;

      const confirmed = window.confirm(
        `Are you sure you want to ${status} ${selectedHotels.length} selected hotel(s)?`
      );

      if (confirmed) {
        try {
          await bulkUpdateHotels(selectedHotels, {
            status: status,
            isActive: status,
          });
          clearSelection();
        } catch (err) {
          console.error("Error updating hotels:", err);
        }
      }
    },
    [selectedHotels, bulkUpdateHotels, clearSelection]
  );

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setEditingHotel(null);
    if (error) clearError();
  }, [error, clearError]);

  const handleModalSubmit = useCallback(
    async (hotelData, hotelId = null) => {
      try {
        const success = await handleFormSubmit(hotelData, hotelId);
        return success;
      } catch (error) {
        console.error("Error submitting hotel form:", error);
        return false;
      }
    },
    [handleFormSubmit]
  );

  const handleClearSearch = useCallback(() => {
    handleSearchChange("");
  }, [handleSearchChange]);

  const handleManageHotel = useCallback(
    (hotel) => {
      const hotelId =
        hotel.hotelId ||
        hotel.businessName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
      navigate(`/super-admin/${hotelId}/dashboard`);
    },
    [navigate]
  );

  const handleRefresh = useCallback(() => {
    try {
      if (typeof refreshHotels === "function") {
        refreshHotels();
      } else {
        console.warn("Refresh function not available");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error refreshing hotels:", error);
      window.location.reload();
    }
  }, [refreshHotels]);

  // Table actions configuration
  const tableActions = useMemo(
    () => [
      {
        label: "Manage",
        onClick: handleManageHotel,
        icon: Users,
        variant: "primary",
      },
      {
        label: "Settings",
        onClick: (hotel) => navigate(`/super-admin/${hotel.hotelId}/settings`),
        icon: Settings,
        variant: "secondary",
      },
    ],
    [handleManageHotel, navigate]
  );

  // Error state
  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={handleRefresh}
        title={t("hotels.errorLoading")}
      />
    );
  }

  // Loading state
  if (loading && !hotels.length) {
    return <LoadingSpinner size="lg" text={t("hotels.loading")} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hotel Form Modal */}
      <Suspense fallback={<LoadingSpinner />}>
        <AddHotelFormModal
          show={showModal}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          editHotel={editingHotel}
          title={editingHotel ? t("hotels.editTitle") : t("hotels.addTitle")}
          submitting={submitting}
        />
      </Suspense>

      <div>
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl shadow-lg p-4 sm:p-6 text-white mb-4">
          <PageTitle
            pageTitle={t("hotels.pageTitle")}
            className="text-2xl sm:text-3xl font-bold text-gray-900"
            description={t("hotels.pageDescription")}
          />
        </div>

        {/* Bulk Actions */}
        <BulkActions
          selectedCount={selectedHotels.length}
          onBulkUpdate={handleBulkStatusUpdate}
          onClearSelection={clearSelection}
        />

        {/* Stats Cards */}
        {hasHotels && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
            <StatCard
              icon={Building2}
              title={t("hotels.total")}
              value={stats.total}
              color="blue"
              subtitle={`${stats.businessTypes} business types`}
              loading={loading}
            />
            <StatCard
              icon={Activity}
              title={t("hotels.active")}
              value={stats.active}
              color="green"
              subtitle={
                stats.total
                  ? `${Math.round((stats.active / stats.total) * 100)}% active`
                  : ""
              }
              loading={loading}
            />
            <StatCard
              icon={AlertTriangle}
              title={t("hotels.inactive")}
              value={stats.inactive}
              color="red"
              subtitle={
                stats.inactive > 0 ? "Requires attention" : "All active"
              }
              loading={loading}
            />
            <StatCard
              icon={TrendingUp}
              title={t("hotels.avgAdmins")}
              value={stats.avgAdminsPerHotel}
              color="purple"
              subtitle="Per hotel"
              loading={loading}
            />
          </div>
        )}

        {/* Search and Filters */}
        {hasHotels && (
          <>
            <SearchWithResults
              searchTerm={searchTerm}
              onSearchChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t("hotels.searchPlaceholder")}
              totalCount={hotelCount}
              filteredCount={filteredHotels.length}
              onClearSearch={handleClearSearch}
              totalLabel={t("hotels.totalLabel")}
              onAdd={handleAddClick}
              addButtonText="Add Hotel"
              addButtonLoading={loading}
              customFilters={
                <AdvancedFilters
                  filters={filters}
                  filterOptions={filterOptions}
                  onFilterChange={handleFilterChange}
                  showAdvanced={showAdvancedFilters}
                  onToggleAdvanced={() =>
                    setShowAdvancedFilters(!showAdvancedFilters)
                  }
                />
              }
            />

            {/* Filter summary */}
            {hasFiltersApplied && (
              <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
                <span>
                  Showing {filteredHotels.length} of {hotels.length} hotel
                  {hotels.length !== 1 ? "s" : ""}
                  {searchTerm && ` for "${searchTerm}"`}
                </span>
                <button
                  onClick={clearAllFilters}
                  className="text-red-600 hover:text-red-800 underline"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {hasHotels ? (
            <>
              {hasSearchResults && filteredHotels.length > 0 ? (
                <Suspense fallback={<LoadingSpinner text="Loading table..." />}>
                  <DynamicTable
                    columns={ViewHotelColumns}
                    data={filteredHotels}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    loading={submitting}
                    emptyMessage={t("hotels.noSearchResults")}
                    showPagination={true}
                    initialRowsPerPage={10}
                    sortable={true}
                    className="border-0"
                    selectable={true}
                    selectedItems={selectedHotels}
                    onItemSelect={handleHotelSelection}
                    onSelectAll={handleSelectAllHotels}
                    actions={tableActions}
                  />
                </Suspense>
              ) : (
                <NoSearchResults
                  btnText={t("hotels.addButton")}
                  searchTerm={searchTerm}
                  onClearSearch={handleClearSearch}
                  onAddNew={handleAddClick}
                />
              )}
            </>
          ) : (
            <EmptyState
              icon={Building2}
              title={t("hotels.emptyTitle")}
              description={t("hotels.emptyDescription")}
              actionLabel={t("hotels.emptyAction")}
              onAction={handleAddClick}
              loading={submitting}
            />
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

ViewHotel.displayName = "ViewHotel";
export default ViewHotel;
