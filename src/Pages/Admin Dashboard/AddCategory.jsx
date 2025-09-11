import React, { useState, useCallback, useMemo, memo, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import {
  Plus,
  Tags,
  Search,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Grid,
  List,
  Filter,
  Download,
  Trash2,
  Edit3,
} from "lucide-react";
import PageTitle from "../../Atoms/PageTitle";
import { ViewCategoryColumns } from "../../Constants/Columns";
import SearchWithButton from "components/SearchWithAddButton";
import { useCategory } from "../../customHooks/useCategory";
import LoadingSpinner from "../../Atoms/LoadingSpinner";
// Lazy load heavy components
const CategoryFormModal = React.lazy(() =>
  import("../../components/FormModals/CategoryFormModals")
);
const DynamicTable = React.lazy(() => import("../../components/DynamicTable"));

// Stats card component
const StatsCard = memo(({ icon: Icon, label, value, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border ${colorClasses[color]}`}
    >
      <Icon className="w-5 h-5" />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
});

StatsCard.displayName = "StatsCard";

// Empty state component
const EmptyState = memo(
  ({
    icon: Icon = Tags,
    title,
    description,
    actionLabel,
    onAction,
    loading = false,
    className = "",
  }) => (
    <div className={`text-center py-12 px-6 ${className}`}>
      <div className="mb-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
        <p className="text-gray-500 max-w-md mx-auto">{description}</p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {actionLabel}
        </button>
      )}
    </div>
  )
);

EmptyState.displayName = "EmptyState";

// No search results component
const NoSearchResults = memo(({ searchTerm, onClearSearch, onAddNew }) => (
  <EmptyState
    icon={Search}
    title="No Categories Found"
    description={`No categories match your search for "${searchTerm}". Try adjusting your search terms or add a new category.`}
    className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
  >
    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
      <button
        onClick={onClearSearch}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Clear Search
      </button>

      <button
        onClick={onAddNew}
        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Category
      </button>
    </div>
  </EmptyState>
));

NoSearchResults.displayName = "NoSearchResults";

// Action buttons component
const ActionButtons = memo(
  ({ onAdd, onExport, onRefresh, loading = false, exportEnabled = false }) => (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={onAdd}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Add Category</span>
      </button>
    </div>
  )
);

ActionButtons.displayName = "ActionButtons";

// Main AddCategory component
const AddCategory = memo(() => {
  const navigate = useNavigate();
  const { hotelName } = useParams();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // table, grid

  // Use custom hook for category management
  const {
    categories,
    filteredCategories,
    searchTerm,
    loading,
    submitting,
    error,
    handleFormSubmit,
    handleSearchChange,
    deleteCategory,
    prepareForEdit,
    refreshCategories,
    categoryCount,
    hasCategories,
    hasSearchResults,
  } = useCategory(hotelName);

  // Memoized calculations
  const stats = useMemo(
    () => ({
      total: categoryCount,
      active: categories.filter((cat) => cat.status === "active").length,
      withItems: categories.filter((cat) => cat.itemCount > 0).length,
      recent: categories.filter((cat) => {
        const createdDate = new Date(cat.createdAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return createdDate > weekAgo;
      }).length,
    }),
    [categories, categoryCount]
  );

  // Event handlers
  const handleAddClick = useCallback(() => {
    setEditingCategory(null);
    setShowModal(true);
  }, []);

  const handleEditClick = useCallback(
    async (category) => {
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
    [prepareForEdit]
  );

  const handleDeleteClick = useCallback(
    async (category) => {
      // Show confirmation dialog
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
    [deleteCategory]
  );

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setEditingCategory(null);
  }, []);

  const handleModalSubmit = useCallback(
    async (categoryName, categoryId = null) => {
      try {
        const success = await handleFormSubmit(categoryName, categoryId);
        return success;
      } catch (error) {
        console.error("Error submitting form:", error);
        return false;
      }
    },
    [handleFormSubmit]
  );

  const handleClearSearch = useCallback(() => {
    handleSearchChange("");
  }, [handleSearchChange]);

  const handleExport = useCallback(() => {
    // Export logic here
    console.log("Exporting categories...");
  }, []);

  const handleRefresh = useCallback(() => {
    refreshCategories();
  }, [refreshCategories]);

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Categories
          </h3>
          <p className="text-red-600 mb-4">
            {error.message || "Something went wrong"}
          </p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !categories.length) {
    return <LoadingSpinner size="lg" text="Loading categories..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Form Modal */}
      <Suspense fallback={<div>Loading modal...</div>}>
        <CategoryFormModal
          show={showModal}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          editCategory={editingCategory}
          title={editingCategory ? "Edit Category" : "Add Category"}
          submitting={submitting}
        />
      </Suspense>

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <PageTitle
              pageTitle="Category Management"
              className="text-2xl sm:text-3xl font-bold text-gray-900"
            />
            <p className="text-gray-600 mt-1">Manage your menu categories</p>
          </div>

          <ActionButtons
            onAdd={handleAddClick}
            onExport={handleExport}
            onRefresh={handleRefresh}
            loading={loading}
            exportEnabled={hasCategories}
          />
        </div>

        {/* Stats Cards */}
        {hasCategories && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              icon={Tags}
              label="Total Categories"
              value={stats.total}
              color="blue"
            />
            <StatsCard
              icon={TrendingUp}
              label="Active Categories"
              value={stats.active}
              color="green"
            />
            <StatsCard
              icon={Grid}
              label="With Items"
              value={stats.withItems}
              color="orange"
            />
            <StatsCard
              icon={Plus}
              label="Recent (7 days)"
              value={stats.recent}
              color="purple"
            />
          </div>
        )}

        {/* Search and Filters */}
        {hasCategories && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 min-w-0">
                <SearchWithButton
                  searchTerm={searchTerm}
                  onSearchChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search categories by name..."
                  onlyView={true}
                  className="w-full"
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                {searchTerm ? (
                  <>
                    <span>
                      Showing {filteredCategories.length} of {categoryCount}
                    </span>
                    <button
                      onClick={handleClearSearch}
                      className="text-orange-500 hover:text-orange-600 underline"
                    >
                      Clear
                    </button>
                  </>
                ) : (
                  <span>{categoryCount} total categories</span>
                )}
              </div>
            </div>
          </div>
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
                    loading={submitting}
                    emptyMessage="No categories match your search criteria"
                    showPagination={true}
                    initialRowsPerPage={10}
                    sortable={true}
                    className="border-0"
                  />
                </Suspense>
              ) : (
                <NoSearchResults
                  searchTerm={searchTerm}
                  onClearSearch={handleClearSearch}
                  onAddNew={handleAddClick}
                />
              )}
            </>
          ) : (
            <EmptyState
              icon={Tags}
              title="No Categories Yet"
              description="Create your first category to start organizing your menu items. Categories help customers navigate your menu easily."
              actionLabel="Add Your First Category"
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

AddCategory.displayName = "AddCategory";

export default AddCategory;
