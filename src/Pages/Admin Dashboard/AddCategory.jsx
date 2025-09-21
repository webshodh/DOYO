// src/Pages/Admin/AddCategory.jsx
import React, { useState, useCallback, useMemo, memo, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import {
  Tags,
  TrendingUp,
  Archive,
  Clock,
  AlertTriangle,
  Wifi,
  WifiOff,
} from "lucide-react";

// ✅ NEW: Import context hooks for better integration
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";

import PageTitle from "../../atoms/PageTitle";
import { ViewCategoryColumns } from "../../Constants/Columns";
import { useCategory } from "../../hooks/useCategory";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import NoSearchResults from "molecules/NoSearchResults";
import StatCard from "components/Cards/StatCard";
import PrimaryButton from "atoms/Buttons/PrimaryButton";
import SearchWithResults from "molecules/SearchWithResults";
import ErrorMessage from "atoms/Messages/ErrorMessage";

// Lazy load heavy components
const CategoryFormModal = React.lazy(() =>
  import("../../components/FormModals/CategoryFormModals")
);
const DynamicTable = React.lazy(() => import("../../organisms/DynamicTable"));

// Main AddCategory component
const AddCategory = memo(() => {
  const { hotelName } = useParams();
  const navigate = useNavigate();

  // ✅ NEW: Use context hooks for better integration
  const { currentUser, isAdmin, canManageHotel } = useAuth();
  const { selectedHotel, selectHotelById } = useHotelContext();

  // ✅ ENHANCED: Use the active hotel name with fallback
  const activeHotelName = hotelName || selectedHotel?.name || selectedHotel?.id;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // ✅ ENHANCED: Use the updated useCategory hook with all new features
  const {
    categories,
    filteredCategories,
    searchTerm,
    loading,
    submitting,
    error,
    lastFetch,
    retryCount,
    connectionStatus,
    sortOrder,
    handleFormSubmit,
    handleSearchChange,
    handleSortChange,
    deleteCategory,
    toggleCategoryStatus,
    prepareForEdit,
    refreshCategories,
    clearFilters,
    // Enhanced computed values
    categoryCount,
    filteredCount,
    hasCategories,
    hasSearchResults,
    hasFiltersApplied,
    isRetrying,
    canRetry,
    dataAge,
    // Additional utilities
    getCategoryStats,
    bulkDeleteCategories,
    exportCategories,
    getCategoryById,
    getCategoriesWithMenuCounts,
    canDeleteCategory,
  } = useCategory(activeHotelName);

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

    const activeCount = categories.filter(
      (cat) => cat.isActive !== false && cat.status !== "inactive"
    ).length;

    const withItemsCount = categories.filter(
      (cat) => (cat.menuCount || cat.itemCount || 0) > 0
    ).length;

    const recentCount = categories.filter((cat) => {
      const createdDate = cat.createdAt?.toDate
        ? cat.createdAt.toDate()
        : new Date(cat.createdAt);
      return createdDate > weekAgo;
    }).length;

    const thisMonthCount = categories.filter((cat) => {
      const createdDate = cat.createdAt?.toDate
        ? cat.createdAt.toDate()
        : new Date(cat.createdAt);
      return createdDate > monthAgo;
    }).length;

    const emptyCategories = categoryCount - withItemsCount;

    return {
      total: categoryCount,
      active: activeCount,
      withItems: withItemsCount,
      empty: emptyCategories,
      recent: recentCount,
      thisMonth: thisMonthCount,
      usagePercentage:
        categoryCount > 0
          ? Math.round((withItemsCount / categoryCount) * 100)
          : 0,
    };
  }, [categories, categoryCount]);

  // ✅ NEW: Load category stats
  const [categoryStats, setCategoryStats] = React.useState(null);
  React.useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await getCategoryStats();
        setCategoryStats(stats);
      } catch (error) {
        console.warn("Failed to load category stats:", error);
      }
    };

    if (hasCategories) {
      loadStats();
    }
  }, [getCategoryStats, hasCategories]);

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
      alert("You don't have permission to add categories for this hotel.");
      return;
    }
    setEditingCategory(null);
    setShowModal(true);
  }, [hasPermission]);

  const handleEditClick = useCallback(
    async (category) => {
      if (!hasPermission) {
        alert("You don't have permission to edit categories for this hotel.");
        return;
      }

      try {
        const categoryToEdit = await prepareForEdit(category);
        if (categoryToEdit) {
          setEditingCategory(categoryToEdit);
          setShowModal(true);
        }
      } catch (error) {
        console.error("Error preparing category for edit:", error);
      }
    },
    [prepareForEdit, hasPermission]
  );

  const handleDeleteClick = useCallback(
    async (category) => {
      if (!hasPermission) {
        alert("You don't have permission to delete categories for this hotel.");
        return;
      }

      // ✅ ENHANCED: Check if category can be deleted
      const canDelete = await canDeleteCategory(
        category.categoryId || category.id
      );
      if (!canDelete) {
        const confirmed = window.confirm(
          `"${category.categoryName}" is currently being used by menu items. Deleting it will affect those items. Are you sure you want to continue?`
        );
        if (!confirmed) return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to delete "${category.categoryName}"? This action cannot be undone.`
      );

      if (confirmed) {
        try {
          await deleteCategory(category);
        } catch (error) {
          console.error("Error deleting category:", error);
        }
      }
    },
    [deleteCategory, hasPermission, canDeleteCategory]
  );

  // ✅ NEW: Toggle category status
  const handleToggleStatus = useCallback(
    async (categoryId, currentStatus) => {
      if (!hasPermission) {
        alert("You don't have permission to modify categories for this hotel.");
        return;
      }

      try {
        await toggleCategoryStatus?.(categoryId, currentStatus);
      } catch (error) {
        console.error("Error toggling category status:", error);
      }
    },
    [toggleCategoryStatus, hasPermission]
  );

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setEditingCategory(null);
  }, []);

  const handleModalSubmit = useCallback(
    async (categoryName, categoryId = null) => {
      try {
        const success = await handleFormSubmit(categoryName, categoryId);
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
    refreshCategories();
  }, [refreshCategories]);

  // ✅ NEW: Export functionality
  const handleExport = useCallback(async () => {
    try {
      const data = exportCategories();
      const csv = data.map((row) => Object.values(row).join(",")).join("\n");
      const headers = Object.keys(data[0] || {}).join(",");
      const csvContent = headers + "\n" + csv;

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `categories_${activeHotelName}_${
          new Date().toISOString().split("T")[0]
        }.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting categories:", error);
    }
  }, [exportCategories, activeHotelName]);

  // ✅ NEW: Navigate to menu management
  const handleManageMenus = useCallback(
    (categoryName) => {
      navigate(
        `/admin/${activeHotelName}/menu?category=${encodeURIComponent(
          categoryName
        )}`
      );
    },
    [navigate, activeHotelName]
  );

  // ✅ ENHANCED: Error state with connection info
  if (error && connectionStatus === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <ErrorMessage
              error={error}
              onRetry={handleRefresh}
              title="Error Loading Categories"
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
            You don't have permission to manage categories for this hotel.
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
            Please select a hotel to manage categories.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !categories.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading categories..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Form Modal */}
      <Suspense fallback={<LoadingSpinner />}>
        <CategoryFormModal
          show={showModal}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          editCategory={editingCategory}
          title={editingCategory ? "Edit Category" : "Add Category"}
          submitting={submitting}
          hotelName={activeHotelName}
          existingCategories={categories}
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
                pageTitle="Category Management"
                className="text-2xl sm:text-3xl font-bold text-gray-900"
                description={`Organize menu items for ${activeHotelName}`}
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
              {hasCategories && (
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
                btnText="Add Category"
                loading={submitting}
                disabled={!hasPermission}
              />
            </div>
          </div>
        </div>

        {/* ✅ ENHANCED: Stats Cards with more insights */}
        {hasCategories && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Tags}
              title="Total Categories"
              value={stats.total}
              color="blue"
              subtitle={`${stats.thisMonth} added this month`}
            />
            <StatCard
              icon={TrendingUp}
              title="Categories with Items"
              value={stats.withItems}
              color="green"
              subtitle={`${stats.usagePercentage}% utilization`}
            />
            <StatCard
              icon={Archive}
              title="Empty Categories"
              value={stats.empty}
              color={stats.empty > 0 ? "red" : "gray"}
              subtitle={stats.empty > 0 ? "Need menu items" : "All used"}
            />
            <StatCard
              icon={Clock}
              title="Recent (7 days)"
              value={stats.recent}
              color="purple"
              subtitle={
                stats.recent > 0 ? "New additions" : "No new categories"
              }
            />
          </div>
        )}

        {/* ✅ NEW: Sort Controls */}
        {hasCategories && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  Sort by:
                </span>
                <button
                  onClick={() => handleSortChange("name_asc")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    sortOrder === "name_asc"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Name A-Z
                </button>
                <button
                  onClick={() => handleSortChange("name_desc")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    sortOrder === "name_desc"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Name Z-A
                </button>
                <button
                  onClick={() => handleSortChange("newest")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    sortOrder === "newest"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Newest
                </button>
                <button
                  onClick={() => handleSortChange("usage")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    sortOrder === "usage"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Most Used
                </button>
              </div>

              {hasFiltersApplied && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        {hasCategories && (
          <SearchWithResults
            searchTerm={searchTerm}
            onSearchChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search categories by name..."
            totalCount={categoryCount}
            filteredCount={filteredCount}
            onClearSearch={handleClearSearch}
            totalLabel="total categories"
            showResultsCount={true}
          />
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {hasCategories ? (
            <>
              {hasSearchResults ? (
                <Suspense fallback={<LoadingSpinner text="Loading table..." />}>
                  <DynamicTable
                    columns={ViewCategoryColumns}
                    data={filteredCategories}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onToggleStatus={handleToggleStatus}
                    loading={submitting}
                    emptyMessage="No categories match your search criteria"
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
                    // ✅ NEW: Custom action for managing menus in category
                    customActions={[
                      {
                        label: "Manage Items",
                        icon: "📝",
                        onClick: (category) =>
                          handleManageMenus(category.categoryName),
                        condition: (category) => (category.menuCount || 0) > 0,
                      },
                    ]}
                  />
                </Suspense>
              ) : (
                <NoSearchResults
                  btnText="Add Category"
                  searchTerm={searchTerm}
                  onClearSearch={handleClearSearch}
                  onAddNew={handleAddClick}
                  hasFilters={hasFiltersApplied}
                  onClearFilters={clearFilters}
                />
              )}
            </>
          ) : (
            <EmptyState
              icon={Tags}
              title="No Categories Yet"
              description={`Create your first category to start organizing menu items for ${activeHotelName}. Categories help customers navigate your menu easily and help you manage inventory.`}
              actionLabel="Add Your First Category"
              onAction={handleAddClick}
              loading={submitting}
              disabled={!hasPermission}
              // ✅ NEW: Additional suggestions
              suggestions={[
                "Start with basic categories like 'Appetizers', 'Main Course', 'Desserts'",
                "Group similar items together for better organization",
                "Use descriptive names that customers will understand",
              ]}
            />
          )}
        </div>

        {/* ✅ NEW: Footer with insights */}
        <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
          {connectionStatus === "connected" && (
            <div className="flex items-center justify-center gap-4">
              <span>Total categories: {categoryCount}</span>
              {filteredCount !== categoryCount && (
                <span>Filtered: {filteredCount}</span>
              )}
              {stats.empty > 0 && (
                <span className="text-orange-600">
                  {stats.empty} empty categories need items
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

AddCategory.displayName = "AddCategory";

export default AddCategory;
