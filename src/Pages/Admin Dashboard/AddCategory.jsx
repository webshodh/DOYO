// AddCategory.js (CORRECTED VERSION)
import React, { useState, useCallback, useMemo, memo, Suspense } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Tags } from "lucide-react";
import PageTitle from "../../atoms/PageTitle";
import useColumns from "../../Constants/Columns";
import { useCategory } from "../../hooks/useCategory";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import NoSearchResults from "components/NoSearchResults";
import StatCard from "components/Cards/StatCard";
import PrimaryButton from "atoms/Buttons/PrimaryButton";
import SearchWithResults from "components/SearchWithResults";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import { useTranslation } from "react-i18next";
import { useTheme } from "context/ThemeContext";

// Lazy load heavy components
const CategoryFormModal = React.lazy(() =>
  import("../../components/FormModals/CategoryFormModals")
);
const DynamicTable = React.lazy(() => import("../../components/DynamicTable"));

// Main AddCategory component
const AddCategory = memo(() => {
  const { hotelName } = useParams();
  const { ViewCategoryColumns } = useColumns();
  const { t } = useTranslation();
  const { currentTheme, isDark } = useTheme();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

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
    refreshCategories, // NOW PROPERLY AVAILABLE
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
        const createdDate = new Date(
          cat.createdAt?.toDate ? cat.createdAt.toDate() : cat.createdAt
        );
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

  // FIXED refresh handler
  const handleRefresh = useCallback(() => {
    try {
      if (typeof refreshCategories === "function") {
        refreshCategories();
      } else {
        console.warn("Refresh function not available");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error refreshing categories:", error);
      window.location.reload();
    }
  }, [refreshCategories]);

  // Error state
  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={handleRefresh}
        title={t("categories.errorLoading")}
      />
    );
  }

  // Loading state
  if (loading && !categories.length) {
    return <LoadingSpinner size="lg" text={t("categories.loading")} />;
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
          title={
            editingCategory
              ? t("categories.editTitle")
              : t("categories.addTitle")
          }
          submitting={submitting}
        />
      </Suspense>

      <div>
        {/* Header */}

        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl shadow-lg p-4 sm:p-6 text-white mb-4">
          <PageTitle
            pageTitle={t("categories.pageTitle")}
            className="text-2xl sm:text-3xl font-bold text-gray-900"
            description={t("categories.pageDescription")}
          />
        </div>

        {/* Stats Cards */}
        {hasCategories && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
            <StatCard
              icon={Tags}
              title={t("categories.total")}
              value={stats.total}
              color="blue"
            />
            <StatCard
              icon={Tags}
              title={t("categories.active")}
              value={stats.active}
              color="green"
            />
          </div>
        )}

        {/* Search and Filters */}
        {hasCategories && (
          <SearchWithResults
            searchTerm={searchTerm}
            onSearchChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t("categories.searchPlaceholder")}
            totalCount={categoryCount}
            filteredCount={filteredCategories.length}
            onClearSearch={handleClearSearch}
            totalLabel={t("categories.totalLabel")}
            onAdd={handleAddClick}
            addButtonText="Add"
            addButtonLoading={loading}
            // totalLabel="categories"
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
                    loading={submitting}
                    emptyMessage={t("categories.noSearchResults")}
                    showPagination={true}
                    initialRowsPerPage={10}
                    sortable={true}
                    className="border-0"
                  />
                </Suspense>
              ) : (
                <NoSearchResults
                  btnText={t("categories.addButton")}
                  searchTerm={searchTerm}
                  onClearSearch={handleClearSearch}
                  onAddNew={handleAddClick}
                />
              )}
            </>
          ) : (
            <EmptyState
              icon={Tags}
              title={t("categories.emptyTitle")}
              description={t("categories.emptyDescription")}
              actionLabel={t("categories.emptyAction")}
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
