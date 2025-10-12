// AddMenu.js (ENHANCED WITH SKELETON AND TRANSLATIONS)
import React, { useState, useCallback, useMemo, memo, Suspense } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Plus,
  ChefHat,
  LoaderCircle,
  AlertCircle,
  TrendingUp,
  Grid,
  DollarSign,
  Eye,
} from "lucide-react";
import useColumns from "Constants/Columns";
import CategoryTabs from "components/CategoryTab";
import { useMenu } from "../../hooks/useMenu";
import PageTitle from "../../atoms/PageTitle";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import NoSearchResults from "components/NoSearchResults";
import StatCard from "components/Cards/StatCard";
import PrimaryButton from "atoms/Buttons/PrimaryButton";
import SearchWithResults from "components/SearchWithResults";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import ErrorBoundary from "atoms/ErrorBoundary";
import MenuManagementSkeleton from "atoms/Skeleton/MenuManagementSkeleton";
import { useTranslation } from "react-i18next";
import MenuFormModal from "../../components/FormModals/MenuFormModal";

const DynamicTable = React.lazy(() => import("../../components/DynamicTable"));

const AddMenu = memo(() => {
  const { hotelName } = useParams();
  const { t } = useTranslation();
  const { ViewMenuColumns } = useColumns();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);

  // Custom hook
  const {
    categories,
    mainCategories,
    filteredAndSortedMenus,
    menuCountsByCategory,
    searchTerm,
    loading,
    submitting,
    error,
    addMenu,
    updateMenu,
    deleteMenu,
    handleCategoryFilter,
    handleSearchChange,
    refreshMenus,
    menuCount,
    hasMenus,
    hasSearchResults,
  } = useMenu(hotelName);

  // Create category lookup map for resolving IDs to names
  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((category) => {
      const categoryName = category.categoryName || category.name;
      const categoryId = category.id;

      if (categoryId && categoryName) {
        map[categoryId] = categoryName;
      }
      if (categoryName) {
        map[categoryName] = categoryName;
      }
    });
    return map;
  }, [categories]);

  // Create main category lookup map
  const mainCategoryMap = useMemo(() => {
    const map = {};
    mainCategories.forEach((mainCategory) => {
      const mainCategoryName =
        mainCategory.mainCategoryName || mainCategory.name;
      const mainCategoryId = mainCategory.id;

      if (mainCategoryId && mainCategoryName) {
        map[mainCategoryId] = mainCategoryName;
      }
      if (mainCategoryName) {
        map[mainCategoryName] = mainCategoryName;
      }
    });
    return map;
  }, [mainCategories]);

  // Enhanced menus with resolved category names
  const enhancedMenus = useMemo(() => {
    return filteredAndSortedMenus.map((menu) => {
      const resolvedCategoryName =
        categoryMap[menu.menuCategory] || menu.menuCategory || "Other";
      const resolvedMainCategoryName =
        mainCategoryMap[menu.mainCategory] || menu.mainCategory || "";

      return {
        ...menu,
        menuCategoryName: resolvedCategoryName,
        mainCategoryName: resolvedMainCategoryName,
        menuCategory: resolvedCategoryName,
        mainCategory: resolvedMainCategoryName,
      };
    });
  }, [filteredAndSortedMenus, categoryMap, mainCategoryMap]);

  // Stats - Use enhanced menus
  const stats = useMemo(
    () => ({
      total: menuCount,
      available: enhancedMenus.filter(
        (menu) => menu.availability === "Available"
      ).length,
      discounted: enhancedMenus.filter((menu) => menu.discount > 0).length,
      categories: new Set(enhancedMenus.map((menu) => menu.menuCategoryName))
        .size,
    }),
    [enhancedMenus, menuCount]
  );

  // Table data - Use enhanced menus with resolved category names
  const tableData = useMemo(
    () =>
      enhancedMenus.map((item, index) => ({
        "Sr.No": index + 1,
        Img: item.imageUrl || item.file,
        "Menu Category": item.menuCategoryName || item.menuCategory || "Other",
        "Menu Name": item.menuName,
        Price: item.menuPrice,
        Discount: item.discount || "-",
        "Final Price": item.finalPrice,
        Availability: item.availability,
        uuid: item.uuid,
        id: item.id,
        _id: item._id,
      })),
    [enhancedMenus]
  );

  // Transform categories for CategoryTabs with counts
  const transformedCategories = useMemo(() => {
    return categories.map((cat) => {
      const categoryName = cat.categoryName || cat.name;
      const categoryId = cat.id;
      const count =
        menuCountsByCategory[categoryId] ||
        menuCountsByCategory[categoryName] ||
        0;

      return {
        ...cat,
        name: categoryName,
        count: count,
      };
    });
  }, [categories, menuCountsByCategory]);

  // Handlers
  const openAddModal = useCallback(() => {
    setEditingMenu(null);
    setShowModal(true);
  }, []);

  const openEditModal = useCallback(
    (rowData) => {
      const menuId = rowData.uuid || rowData.id || rowData._id;
      const selectedMenu = enhancedMenus.find((menu) =>
        [menu.uuid, menu.id, menu._id].includes(menuId)
      );
      if (!selectedMenu) {
        alert(t("menu.menuNotFound"));
        return;
      }
      setEditingMenu(selectedMenu);
      setShowModal(true);
    },
    [enhancedMenus, t]
  );

  const handleDelete = useCallback(
    async (rowData) => {
      const menuId = rowData.uuid || rowData.id || rowData._id;
      const confirmed = window.confirm(
        t("menu.deleteConfirmation", { menuName: rowData["Menu Name"] })
      );
      if (confirmed) {
        const success = await deleteMenu(menuId);
        if (!success) alert(t("menu.deleteError"));
      }
    },
    [deleteMenu, t]
  );

  const closeModal = useCallback(() => {
    setEditingMenu(null);
    setShowModal(false);
  }, []);

  const handleModalSubmit = useCallback(
    async (data) => {
      if (editingMenu) {
        return await updateMenu(data, editingMenu.uuid || editingMenu.id);
      }
      return await addMenu(data);
    },
    [addMenu, updateMenu, editingMenu]
  );

  const clearSearch = useCallback(
    () => handleSearchChange(""),
    [handleSearchChange]
  );

  const handleRefresh = useCallback(() => {
    try {
      if (typeof refreshMenus === "function") {
        refreshMenus();
      } else {
        console.warn("Refresh function not available");
        window.location.reload();
      }
    } catch (error) {
      console.error(t("menu.refreshError"), error);
      window.location.reload();
    }
  }, [refreshMenus, t]);

  // Determine loading state
  const isLoadingData = loading && !enhancedMenus.length;

  return (
    <div className="min-h-screen">
      {/* Modal */}
      <Suspense fallback={<LoadingSpinner />}>
        {showModal && (
          <MenuFormModal
            show={showModal}
            onClose={closeModal}
            onSubmit={handleModalSubmit}
            categories={categories}
            mainCategories={mainCategories}
            editMode={Boolean(editingMenu)}
            initialData={editingMenu}
            hotelName={hotelName}
            title={editingMenu ? t("menu.editTitle") : t("menu.addTitle")}
            submitting={submitting}
          />
        )}
      </Suspense>

      {/* Error handling */}
      {error && !loading && (
        <ErrorBoundary error={error} onRetry={handleRefresh} />
      )}

      {/* Loading state */}
      {isLoadingData ? (
        <MenuManagementSkeleton />
      ) : (
        <>
          {/* Header & Stats */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl shadow-lg p-4 sm:p-6 text-white mb-4">
            <PageTitle
              pageTitle={t("menu.managePageTitle")}
              className="text-2xl font-bold text-white"
              description={t("menu.manageDescription")}
            />
          </div>

          {hasMenus && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={ChefHat}
                title={t("menu.totalItems")}
                value={stats.total}
                color="blue"
              />
              <StatCard
                icon={TrendingUp}
                title={t("menu.totalAvailable")}
                value={stats.available}
                color="green"
              />
              <StatCard
                icon={DollarSign}
                title={t("menu.withDiscount")}
                value={stats.discounted}
                color="orange"
              />
              <StatCard
                icon={Grid}
                title={t("menu.totalCategories")}
                value={stats.categories}
                color="purple"
              />
            </div>
          )}

          {/* Search & Filters */}
          {hasMenus && (
            <>
              <SearchWithResults
                searchTerm={searchTerm}
                onSearchChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t("menu.searchPlaceholder")}
                totalCount={menuCount}
                filteredCount={enhancedMenus.length}
                onClearSearch={clearSearch}
                totalLabel={t("menu.totalLabel")}
                onAdd={openAddModal}
                addButtonText={t("menu.addButton")}
                addButtonLoading={submitting}
              />
              <div className="bg-white rounded-lg shadow mb-6 p-4 overflow-x-auto">
                <CategoryTabs
                  categories={transformedCategories}
                  menuCountsByCategory={menuCountsByCategory}
                  handleCategoryFilter={handleCategoryFilter}
                />
              </div>
            </>
          )}

          {/* Table or Empty State */}
          <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
            {hasMenus ? (
              hasSearchResults ? (
                <Suspense
                  fallback={<LoadingSpinner text={t("menu.loadingTable")} />}
                >
                  <DynamicTable
                    columns={ViewMenuColumns}
                    data={tableData}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    loading={submitting}
                    showPagination
                    initialRowsPerPage={10}
                    sortable
                    className="border-0"
                    emptyMessage={t("menu.noSearchResults")}
                  />
                </Suspense>
              ) : (
                <NoSearchResults
                  btnText={t("menu.addButton")}
                  searchTerm={searchTerm}
                  onClearSearch={clearSearch}
                  onAddNew={openAddModal}
                />
              )
            ) : (
              <EmptyState
                icon={ChefHat}
                title={t("menu.noItems")}
                description={t("menu.noItemsDescription")}
                actionLabel={t("menu.emptyAction")}
                onAction={openAddModal}
                loading={submitting}
              />
            )}
          </div>
        </>
      )}

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

AddMenu.displayName = "AddMenu";

export default AddMenu;
