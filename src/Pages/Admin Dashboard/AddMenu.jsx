import React, { useState, useCallback, useMemo, memo, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { ViewMenuColumns } from "Constants/Columns";
import CategoryTabs from "molecules/CategoryTab";
import { useMenu } from "../../customHooks/menu";
import PageTitle from "../../atoms/PageTitle";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import NoSearchResults from "molecules/NoSearchResults";
import StatCard from "components/Cards/StatCard";
import PrimaryButton from "atoms/Buttons/PrimaryButton";
import SearchWithResults from "molecules/SearchWithResults";
import ErrorMessage from "atoms/Messages/ErrorMessage";

// Lazy load heavy components
const MenuFormModal = React.lazy(() =>
  import("../../components/FormModals/MenuFormModal")
);
const DynamicTable = React.lazy(() => import("../../organisms/DynamicTable"));

// Main AddMenu component
const AddMenu = memo(({ onlyView = false }) => {
  const navigate = useNavigate();
  const { hotelName } = useParams();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [editingMenuId, setEditingMenuId] = useState(null);

  // Use custom hook for menu management
  const {
    categories,
    mainCategories,
    filteredAndSortedMenus,
    menuCountsByCategory,
    searchTerm,
    activeCategory,
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

  // Memoized calculations for menu statistics
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

  // Prepare data for the table with memoization
  const tableData = useMemo(() => {
    return filteredAndSortedMenus.map((item, index) => ({
      "Sr.No": index + 1,
      Img: item.imageUrl || item.file,
      "Menu Category": item.menuCategory || "Other",
      "Menu Name": item.menuName,
      Price: item.menuPrice,
      Discount: item.discount || "-",
      "Final Price": item.finalPrice,
      Availability: item.availability,
      // Ensure we include the ID fields that the handlers will look for
      uuid: item.uuid,
      id: item.id,
      _id: item._id,
    }));
  }, [filteredAndSortedMenus]);

  // Event handlers
  const handleAddClick = useCallback(() => {
    setEditingMenu(null);
    setEditingMenuId(null);
    setShowModal(true);
  }, []);

  const handleEditClick = useCallback(
    (rowData) => {
      console.log("=== EDIT DEBUG ===");
      console.log("Received rowData:", rowData);

      // Extract the menu ID from the row data
      const menuId = rowData.uuid || rowData.id || rowData._id;
      console.log("Extracted menuId:", menuId);

      if (!menuId) {
        console.error("No valid ID found in row data:", rowData);
        alert("Error: Menu ID not found. Please refresh and try again.");
        return;
      }

      // Find the original menu data from filteredAndSortedMenus
      const selectedMenu = filteredAndSortedMenus.find((menu) => {
        const matches =
          menu.uuid === menuId ||
          menu.id === menuId ||
          menu._id === menuId ||
          String(menu.uuid) === String(menuId) ||
          String(menu.id) === String(menuId) ||
          String(menu._id) === String(menuId);
        return matches;
      });

      if (selectedMenu) {
        console.log("Found original menu data:", selectedMenu);
        setEditingMenu(selectedMenu);
        setEditingMenuId(menuId);
        setShowModal(true);
      } else {
        console.error("Original menu not found for ID:", menuId);
        console.error("Available menus:", filteredAndSortedMenus);
        alert("Menu not found. Please refresh the page and try again.");
      }
    },
    [filteredAndSortedMenus]
  );

  const handleDeleteClick = useCallback(
    async (rowData) => {
      console.log("=== DELETE DEBUG ===");
      console.log("Received rowData for deletion:", rowData);

      // Extract the menu ID from the row data
      const menuId = rowData.uuid || rowData.id || rowData._id;
      console.log("Extracted menuId for deletion:", menuId);

      if (!menuId) {
        console.error("No valid ID found in row data:", rowData);
        alert("Error: Menu ID not found. Please refresh and try again.");
        return;
      }

      // Get the menu name for confirmation
      const menuName =
        rowData["Menu Name"] || rowData.menuName || "this menu item";

      // Add confirmation dialog
      const confirmed = window.confirm(
        `Are you sure you want to delete "${menuName}"? This action cannot be undone.`
      );

      if (confirmed) {
        try {
          console.log("Calling deleteMenu with ID:", menuId);
          const success = await deleteMenu(menuId);
          console.log("Delete operation result:", success);

          if (!success) {
            console.error("Failed to delete menu - deleteMenu returned false");
            alert("Failed to delete menu. Please try again.");
          }
        } catch (error) {
          console.error("Error deleting menu:", error);
          alert("An error occurred while deleting the menu. Please try again.");
        }
      }
    },
    [deleteMenu]
  );

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setEditingMenu(null);
    setEditingMenuId(null);
  }, []);

  const handleModalSubmit = useCallback(
    async (formData) => {
      console.log("=== FORM SUBMIT DEBUG ===");
      console.log("Form submitted with data:", formData);
      console.log("Edit mode:", !!editingMenuId, "Menu ID:", editingMenuId);

      try {
        let success = false;

        if (editingMenuId) {
          console.log("Updating menu with ID:", editingMenuId);
          success = await updateMenu(formData, editingMenuId);
          console.log("Update result:", success);
        } else {
          console.log("Adding new menu");
          success = await addMenu(formData);
          console.log("Add result:", success);
        }

        if (success) {
          handleModalClose(); // Close modal on success
        }

        return success;
      } catch (error) {
        console.error("Error in form submission:", error);
        alert("An error occurred while saving the menu. Please try again.");
        return false;
      }
    },
    [addMenu, updateMenu, editingMenuId, handleModalClose]
  );

  const handleClearSearch = useCallback(() => {
    handleSearchChange("");
  }, [handleSearchChange]);

  const handleRefresh = useCallback(() => {
    refreshMenus();
  }, [refreshMenus]);

  // Error state
  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={handleRefresh}
        title="Error Loading Menu Items"
      />
    );
  }

  // Loading state
  if (loading && !filteredAndSortedMenus.length) {
    return <LoadingSpinner size="lg" text="Loading menu items..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Menu Form Modal */}
      <Suspense fallback={<LoadingSpinner />}>
        <MenuFormModal
          show={showModal}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          categories={categories}
          mainCategories={mainCategories}
          editMode={!!editingMenuId}
          initialData={editingMenu}
          hotelName={hotelName}
          submitting={submitting}
        />
      </Suspense>

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-1">
          <PageTitle
            pageTitle={onlyView ? "View Menu" : "Menu Management"}
            className="text-2xl sm:text-3xl font-bold text-gray-900"
            description={
              onlyView
                ? "Browse menu items"
                : "Manage your menu items and categories"
            }
          />

          {!onlyView && (
            <PrimaryButton
              onAdd={handleAddClick}
              btnText="Add Menu Item"
              loading={loading}
            />
          )}
        </div>

        {/* Stats Cards */}
        {hasMenus && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={ChefHat}
              title="Total Items"
              value={stats.total}
              color="blue"
            />
            <StatCard
              icon={TrendingUp}
              title="Available"
              value={stats.available}
              color="green"
            />
            <StatCard
              icon={DollarSign}
              title="With Discount"
              value={stats.discounted}
              color="orange"
            />
            <StatCard
              icon={Grid}
              title="Categories"
              value={stats.categories}
              color="purple"
            />
          </div>
        )}

        {/* Search and Filters */}
        {hasMenus && (
          <SearchWithResults
            searchTerm={searchTerm}
            onSearchChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search menu items by name, category, or price..."
            totalCount={menuCount}
            filteredCount={filteredAndSortedMenus.length}
            onClearSearch={handleClearSearch}
            totalLabel="total menu items"
          />
        )}

        {/* Categories Section */}
        {hasMenus && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
            <div className="overflow-x-auto no-scrollbar">
              <div className="flex flex-nowrap space-x-2">
                <CategoryTabs
                  categories={categories}
                  menuCountsByCategory={menuCountsByCategory}
                  handleCategoryFilter={handleCategoryFilter}
                  activeCategory={activeCategory}
                />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {hasMenus ? (
            <>
              {hasSearchResults ? (
                <Suspense
                  fallback={<LoadingSpinner text="Loading menu table..." />}
                >
                  <DynamicTable
                    columns={ViewMenuColumns}
                    data={tableData}
                    onEdit={!onlyView ? handleEditClick : undefined}
                    onDelete={!onlyView ? handleDeleteClick : undefined}
                    loading={submitting}
                    emptyMessage="No menu items match your search criteria"
                    showPagination={true}
                    initialRowsPerPage={10}
                    sortable={true}
                    className="border-0"
                  />
                </Suspense>
              ) : (
                <NoSearchResults
                  btnText="Add Menu Item"
                  searchTerm={searchTerm}
                  onClearSearch={handleClearSearch}
                  onAddNew={!onlyView ? handleAddClick : undefined}
                />
              )}
            </>
          ) : (
            <EmptyState
              icon={onlyView ? Eye : ChefHat}
              title={onlyView ? "No Menu Items to View" : "No Menu Items Yet"}
              description={
                onlyView
                  ? "There are no menu items available to display. Check back later or contact the restaurant."
                  : "Create your first menu item to start building your restaurant's offerings. Add delicious dishes and beverages for your customers."
              }
              actionLabel={onlyView ? undefined : "Add Your First Menu Item"}
              onAction={!onlyView ? handleAddClick : undefined}
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

AddMenu.displayName = "AddMenu";

export default AddMenu;
