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
import CategoryTabs from "molecules/CategoryTab";
import { useMenu } from "../../hooks/useMenu";
import PageTitle from "../../atoms/PageTitle";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import NoSearchResults from "molecules/NoSearchResults";
import StatCard from "components/Cards/StatCard";
import PrimaryButton from "atoms/Buttons/PrimaryButton";
import SearchWithResults from "molecules/SearchWithResults";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import { useTranslation } from "react-i18next";
import MenuFormModal from "../../components/FormModals/MenuFormModal";

const DynamicTable = React.lazy(() => import("../../organisms/DynamicTable"));

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

  // Stats
  const stats = useMemo(
    () => ({
      total: menuCount,
      available: filteredAndSortedMenus.filter(
        (menu) => menu.availability === "Available"
      ).length,
      discounted: filteredAndSortedMenus.filter((menu) => menu.discount > 0)
        .length,
      categories: new Set(
        filteredAndSortedMenus.map((menu) => menu.menuCategory)
      ).size,
    }),
    [filteredAndSortedMenus, menuCount]
  );

  // Table data
  const tableData = useMemo(
    () =>
      filteredAndSortedMenus.map((item, index) => ({
        "Sr.No": index + 1,
        Img: item.imageUrl || item.file,
        "Menu Category": item.menuCategory || "Other",
        "Menu Name": item.menuName,
        Price: item.menuPrice,
        Discount: item.discount || "-",
        "Final Price": item.finalPrice,
        Availability: item.availability,
        uuid: item.uuid,
        id: item.id,
        _id: item._id,
      })),
    [filteredAndSortedMenus]
  );

  // Handlers
  const openAddModal = useCallback(() => {
    setEditingMenu(null);
    setShowModal(true);
  }, []);

  const openEditModal = useCallback(
    (rowData) => {
      const menuId = rowData.uuid || rowData.id || rowData._id;
      const selectedMenu = filteredAndSortedMenus.find((menu) =>
        [menu.uuid, menu.id, menu._id].includes(menuId)
      );
      if (!selectedMenu) {
        alert("Menu not found. Please refresh and try again.");
        return;
      }
      setEditingMenu(selectedMenu);
      setShowModal(true);
    },
    [filteredAndSortedMenus]
  );

  const handleDelete = useCallback(
    async (rowData) => {
      const menuId = rowData.uuid || rowData.id || rowData._id;
      const confirmed = window.confirm(
        `Are you sure you want to delete "${rowData["Menu Name"]}"?`
      );
      if (confirmed) {
        const success = await deleteMenu(menuId);
        if (!success) alert("Failed to delete menu. Please try again.");
      }
    },
    [deleteMenu]
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

  const refresh = useCallback(() => refreshMenus(), [refreshMenus]);

  // Render error or loading
  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={refresh}
        title={t("menu.errorLoading")}
      />
    );
  }
  if (loading && !filteredAndSortedMenus.length) {
    return <LoadingSpinner size="lg" text={t("menu.loading")} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
        <PageTitle
          pageTitle={t("menu.managePageTitle")}
          className="text-2xl font-bold"
          description={t("menu.manageDescription")}
        />
        <PrimaryButton
          onAdd={openAddModal}
          btnText={t("menu.addButton")}
          loading={submitting}
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
            filteredCount={filteredAndSortedMenus.length}
            onClearSearch={clearSearch}
            totalLabel={t("menu.totalLabel")}
          />
          <div className="bg-white rounded-lg shadow mb-6 p-4 overflow-x-auto">
            <CategoryTabs
              categories={categories}
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

      {/* Modal */}
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
        />
      )}

      {/* Toasts */}
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
});

AddMenu.displayName = "AddMenu";

export default AddMenu;
