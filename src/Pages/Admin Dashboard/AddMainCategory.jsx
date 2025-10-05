import React, { useState, useCallback, useMemo, memo, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Plus, Tags, TrendingUp, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import PageTitle from "../../atoms/PageTitle";
import useColumns from "../../Constants/Columns";
import { useMainCategory } from "../../hooks/useMainCategory";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import NoSearchResults from "components/NoSearchResults";
import StatCard from "components/Cards/StatCard";
import PrimaryButton from "atoms/Buttons/PrimaryButton";
import SearchWithResults from "components/SearchWithResults";
import ErrorMessage from "atoms/Messages/ErrorMessage";

// Lazy load heavy components
const CategoryFormModal = React.lazy(() =>
  import("../../components/FormModals/CategoryFormModals")
);
const DynamicTable = React.lazy(() => import("../../components/DynamicTable"));

// Main AddMainCategory component
const AddMainCategory = memo(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hotelName } = useParams();
  const { ViewCategoryColumns } = useColumns();

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
    refreshCategories,
    categoryCount,
    hasCategories,
    hasSearchResults,
  } = useMainCategory(hotelName);

  // Memoized calculations for special categories
  const stats = useMemo(
    () => ({
      total: categoryCount,
      active: categories.filter((cat) => cat.status === "active").length,
      special: categories.filter((cat) => cat.isSpecial === true).length,
      recent: categories.filter((cat) => {
        const createdDate = new Date(cat.createdAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return createdDate > weekAgo;
      }).length,
    }),
    [categories, categoryCount]
  );

  // Format data for table
  const categoriesData = useMemo(
    () =>
      filteredCategories.map((category, index) => ({
        srNo: index + 1,
        ...category,
      })),
    [filteredCategories]
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
        console.error(t("errors.prepareCategoryEdit"), error);
      }
    },
    [prepareForEdit, t]
  );

  const handleDeleteClick = useCallback(
    async (category) => {
      const confirmed = window.confirm(
        t("confirmations.deleteCategory", {
          categoryName: category.categoryName,
        })
      );
      if (confirmed) {
        try {
          await deleteCategory(category);
        } catch (error) {
          console.error(t("errors.deleteCategory"), error);
        }
      }
    },
    [deleteCategory, t]
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
        console.error(t("errors.submitForm"), error);
        return false;
      }
    },
    [handleFormSubmit, t]
  );

  const handleClearSearch = useCallback(
    () => handleSearchChange(""),
    [handleSearchChange]
  );
  const handleRefresh = useCallback(
    () => refreshCategories(),
    [refreshCategories]
  );

  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={handleRefresh}
        title={t("errors.loadingCategories")}
      />
    );
  }

  if (loading && !categories.length) {
    return <LoadingSpinner size="lg" text={t("loading.categories")} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingSpinner />}>
        <CategoryFormModal
          show={showModal}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          editCategory={editingCategory}
          title={
            editingCategory
              ? t("titles.editSpecialCategory")
              : t("titles.addSpecialCategory")
          }
          submitting={submitting}
          type="specialcategory"
        />
      </Suspense>
      <div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-1">
          <PageTitle
            pageTitle={t("pages.specialCategoriesManagement")}
            className="text-2xl sm:text-3xl font-bold text-gray-900"
            description={t("descriptions.specialCategoriesManagement")}
          />
          <PrimaryButton
            onAdd={handleAddClick}
            btnText={t("buttons.addSpecialCategory")}
            loading={loading}
          />
        </div>
        {hasCategories && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Tags}
              title={t("stats.totalCategories")}
              value={stats.total}
              color="blue"
            />
            <StatCard
              icon={TrendingUp}
              title={t("stats.activeCategories")}
              value={stats.active}
              color="green"
            />
            <StatCard
              icon={Star}
              title={t("stats.specialCategories")}
              value={stats.special}
              color="orange"
            />
            <StatCard
              icon={Plus}
              title={t("stats.recentCategories")}
              value={stats.recent}
              color="purple"
            />
          </div>
        )}
        {hasCategories && (
          <SearchWithResults
            searchTerm={searchTerm}
            onSearchChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t("placeholders.searchSpecialCategories")}
            totalCount={categoryCount}
            filteredCount={filteredCategories.length}
            onClearSearch={handleClearSearch}
            totalLabel={t("labels.totalSpecialCategories")}
          />
        )}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {hasCategories ? (
            hasSearchResults ? (
              <Suspense fallback={<LoadingSpinner text={t("loading.table")} />}>
                <DynamicTable
                  columns={ViewCategoryColumns}
                  data={categoriesData}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  loading={submitting}
                  emptyMessage={t("messages.noSearchResultsSpecial")}
                  showPagination
                  initialRowsPerPage={10}
                  sortable
                  className="border-0"
                />
              </Suspense>
            ) : (
              <NoSearchResults
                btnText={t("buttons.addSpecialCategory")}
                searchTerm={searchTerm}
                onClearSearch={handleClearSearch}
                onAddNew={handleAddClick}
              />
            )
          ) : (
            <EmptyState
              icon={Star}
              title={t("emptyStates.noSpecialCategories.title")}
              description={t("emptyStates.noSpecialCategories.description")}
              actionLabel={t("emptyStates.noSpecialCategories.actionLabel")}
              onAction={handleAddClick}
              loading={submitting}
            />
          )}
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
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

AddMainCategory.displayName = "AddMainCategory";
export default AddMainCategory;
