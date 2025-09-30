import React, { useState, useCallback, useMemo, memo, Suspense } from "react";
import {
  Plus,
  Building2,
  Activity,
  TrendingUp,
  AlertTriangle,
  Home,
  Search,
  Users,
  Filter,
  Download,
  Settings,
  MoreHorizontal,
} from "lucide-react";
import { ToastContainer } from "react-toastify";
import PageTitle from "../../atoms/PageTitle";
import useColumns from "../../Constants/Columns";
import { useHotel } from "../../hooks/useHotel";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import NoSearchResults from "molecules/NoSearchResults";
import PrimaryButton from "atoms/Buttons/PrimaryButton";
import StatCard from "components/Cards/StatCard";
import { useTranslation } from "react-i18next";
import { useTheme } from "context/ThemeContext";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import { useNavigate } from "react-router-dom";

const DynamicTable = React.lazy(() => import("../../organisms/DynamicTable"));

const ViewHotel = memo(() => {
  const { ViewHotelColumns } = useColumns();
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const {
    hotels,
    filteredHotels,
    searchTerm,
    filters,
    filterOptions,
    analytics,
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
    exportHotels,
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

  const handleExport = useCallback(() => {
    const data = exportHotels("csv");
    // Here you would typically trigger a file download
    console.log("Exported data:", data);
  }, [exportHotels]);

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

  // Error Handling
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage
          error={error}
          title="Error Loading Hotels"
          onRetry={clearError}
        />
      </div>
    );
  }

  if (loading && !hotels.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading hotels..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Enhanced Header */}

        <div className="flex flex-row lg:flex-row lg:items-center justify-between gap-4 mb-1">
          <PageTitle
            pageTitle="Hotel Management"
            className="text-2xl sm:text-3xl font-bold text-gray-900"
            description="Manage all your hotels and their operations from one place"
          />
          <PrimaryButton
            onAdd={handleAddClick}
            btnText="Add New Hotel"
            loading={submitting}
            icon={Plus}
            className="bg-green-600 hover:bg-green-700"
          />
        </div>
        {hasHotels && (
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
            <span>Total: {hotelStats.total}</span>
            <span className="text-green-600">Active: {hotelStats.active}</span>
            <span className="text-red-600">
              Inactive: {hotelStats.inactive}
            </span>
            {hasFiltersApplied && (
              <span className="text-blue-600">
                Showing: {filteredHotels.length}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          {selectedHotels.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedHotels.length} selected
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleBulkStatusUpdate("active")}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate("inactive")}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                >
                  Deactivate
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Stats Cards */}
        {hasHotels && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Building2}
              title="Total Hotels"
              value={hotelStats.total}
              color="blue"
              loading={loading}
              subtitle={`${hotelStats.businessTypes} business types`}
            />
            <StatCard
              icon={Activity}
              title="Active Hotels"
              value={hotelStats.active}
              color="green"
              subtitle={
                hotelStats.total
                  ? `${Math.round(
                      (hotelStats.active / hotelStats.total) * 100
                    )}% active`
                  : ""
              }
              loading={loading}
            />
            <StatCard
              icon={AlertTriangle}
              title="Inactive Hotels"
              value={hotelStats.inactive}
              color="red"
              loading={loading}
              subtitle={
                hotelStats.inactive > 0 ? "Requires attention" : "All active"
              }
            />
            <StatCard
              icon={TrendingUp}
              title="Avg. Admins/Hotel"
              value={hotelStats.avgAdminsPerHotel}
              color="purple"
              subtitle="Per hotel"
              loading={loading}
            />
          </div>
        )}

        {/* Enhanced Filters */}
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
                  placeholder="Search by business name, type, location, email, or contact..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={filters.businessType}
                onChange={(e) =>
                  handleFilterChange("businessType", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                {filterOptions.businessTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() +
                      type.slice(1).replace("_", " ")}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
                  showAdvancedFilters
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Filter size={16} />
                More
              </button>

              <button
                onClick={handleAddClick}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                Add Hotel
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={filters.city}
                  onChange={(e) => handleFilterChange("city", e.target.value)}
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
                  onChange={(e) => handleFilterChange("state", e.target.value)}
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
                  onChange={(e) =>
                    handleFilterChange("subscriptionPlan", e.target.value)
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Plans</option>
                  {filterOptions.subscriptionPlans.map((plan) => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Filter summary */}
          {hasFiltersApplied && (
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
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
        </div>

        {/* Table/Search Results/Empty States */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {hasHotels ? (
            filteredHotels.length > 0 ? (
              <Suspense fallback={<LoadingSpinner text="Loading table..." />}>
                <DynamicTable
                  columns={ViewHotelColumns}
                  data={filteredHotels}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  loading={submitting}
                  emptyMessage="No hotels match your current filters"
                  showPagination={true}
                  initialRowsPerPage={10}
                  sortable={true}
                  className="border-0"
                  selectable={true}
                  selectedItems={selectedHotels}
                  onItemSelect={handleHotelSelection}
                  onSelectAll={handleSelectAllHotels}
                  actions={[
                    {
                      label: "Manage",
                      onClick: handleManageHotel,
                      icon: Users,
                      variant: "primary",
                    },
                    {
                      label: "Settings",
                      onClick: (hotel) =>
                        navigate(`/super-admin/${hotel.hotelId}/settings`),
                      icon: Settings,
                      variant: "secondary",
                    },
                  ]}
                />
              </Suspense>
            ) : (
              <NoSearchResults
                btnText="Add New Hotel"
                searchTerm={searchTerm}
                onClearSearch={handleClearSearch}
                onAddNew={handleAddClick}
              />
            )
          ) : (
            <EmptyState
              icon={Home}
              title="No Hotels Yet"
              description="Start by adding your first hotel to manage all your operations in one place. You can add admins, categories, menus, and more for each hotel."
              actionLabel="Add Your First Hotel"
              onAction={handleAddClick}
              loading={submitting}
            />
          )}
        </div>
      </div>

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
