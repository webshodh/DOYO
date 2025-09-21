// src/Pages/Admin/AddMenu.jsx
import React, { useState, useCallback, useMemo, memo, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Plus,
  ChefHat,
  LoaderCircle,
  AlertTriangle,
  TrendingUp,
  Grid,
  DollarSign,
  Eye,
  Wifi,
  WifiOff,
  Clock,
  Filter,
} from "lucide-react";

// ✅ NEW: Import context hooks for better integration
import { useAuth } from "../../context/AuthContext";
import { useHotelContext } from "../../context/HotelContext";

import { ViewMenuColumns } from "Constants/Columns";
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

// Lazy load heavy components
const MenuFormModal = React.lazy(() =>
  import("../../components/FormModals/MenuFormModal")
);
const DynamicTable = React.lazy(() => import("../../organisms/DynamicTable"));

// Main AddMenu component
const AddMenu = memo(({ onlyView = false }) => {
  const navigate = useNavigate();
  const { hotelName } = useParams();

  // ✅ NEW: Use context hooks for better integration
  const { currentUser, isAdmin, canManageHotel } = useAuth();
  const { selectedHotel, selectHotelById } = useHotelContext();

  // ✅ ENHANCED: Use the active hotel name with fallback
  const activeHotelName = hotelName || selectedHotel?.name || selectedHotel?.id;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [editingMenuId, setEditingMenuId] = useState(null);

  // ✅ ENHANCED: Use the updated useMenu hook with all new features
  const {
    menus,
    categories,
    mainCategories,
    filteredAndSortedMenus,
    menuCountsByCategory,
    searchTerm,
    selectedCategory,
    activeCategory,
    loading,
    submitting,
    error,
    connectionStatus,
    lastFetch,
    retryCount,
    sortOrder,
    filterStatus,
    // Enhanced actions
    addMenu,
    updateMenu,
    deleteMenu,
    toggleMenuAvailability,
    handleCategoryFilter,
    handleSearchChange,
    handleSortChange,
    handleStatusFilter,
    refreshMenus,
    clearAllFilters,
    // Enhanced computed values
    menuCount,
    filteredCount,
    hasMenus,
    hasSearchResults,
    availableMenuCount,
    unavailableMenuCount,
    hasFiltersApplied,
    isRetrying,
    canRetry,
    dataAge,
    // Additional utilities
    getMenuById,
    bulkUpdateAvailability,
    exportMenus,
    getFeaturedMenus,
  } = useMenu(activeHotelName);

  // ✅ NEW: Auto-update hotel selection if needed
  React.useEffect(() => {
    if (hotelName && selectedHotel?.name !== hotelName) {
      selectHotelById(hotelName);
    }
  }, [hotelName, selectedHotel, selectHotelById]);

  // ✅ NEW: Permission check
  const hasPermission = useMemo(() => {
    return !onlyView && isAdmin() && canManageHotel(activeHotelName);
  }, [onlyView, isAdmin, canManageHotel, activeHotelName]);

  // ✅ ENHANCED: Memoized calculations for menu statistics with more insights
  const stats = useMemo(() => {
    const available = filteredAndSortedMenus.filter(
      (menu) => menu.availability === "Available"
    ).length;

    const discounted = filteredAndSortedMenus.filter(
      (menu) => (menu.discount || 0) > 0
    ).length;

    const categories = new Set(
      filteredAndSortedMenus.map((menu) => menu.menuCategory)
    ).size;

    const featured = filteredAndSortedMenus.filter(
      (menu) => menu.isPopular || menu.chefSpecial || menu.isRecommended
    ).length;

    const avgPrice =
      filteredAndSortedMenus.length > 0
        ? Math.round(
            filteredAndSortedMenus.reduce(
              (sum, menu) =>
                sum + (parseFloat(menu.finalPrice || menu.menuPrice) || 0),
              0
            ) / filteredAndSortedMenus.length
          )
        : 0;

    return {
      total: menuCount,
      available,
      unavailable: menuCount - available,
      discounted,
      categories,
      featured,
      avgPrice,
      availabilityPercentage:
        menuCount > 0 ? Math.round((available / menuCount) * 100) : 0,
    };
  }, [filteredAndSortedMenus, menuCount]);

  // ✅ ENHANCED: Prepare data for the table with better memoization
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
      // ✅ NEW: Additional fields for enhanced functionality
      "Created Date": item.createdAt?.toDate
        ? item.createdAt.toDate().toLocaleDateString()
        : new Date(item.createdAt).toLocaleDateString(),
      Status: item.isPopular
        ? "⭐ Popular"
        : item.chefSpecial
        ? "👨‍🍳 Chef Special"
        : "Regular",
      // Ensure we include the ID fields that the handlers will look for
      uuid: item.uuid,
      id: item.id,
      _id: item._id,
      // Keep original item for advanced operations
      _original: item,
    }));
  }, [filteredAndSortedMenus]);

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
      alert("You don't have permission to add menu items for this hotel.");
      return;
    }
    setEditingMenu(null);
    setEditingMenuId(null);
    setShowModal(true);
  }, [hasPermission]);

  const handleEditClick = useCallback(
    (rowData) => {
      console.log("=== EDIT DEBUG ===");
      console.log("Received rowData:", rowData);

      if (!hasPermission) {
        alert("You don't have permission to edit menu items for this hotel.");
        return;
      }

      // ✅ ENHANCED: Try to get original item first
      let selectedMenu = rowData._original;

      if (!selectedMenu) {
        // Extract the menu ID from the row data
        const menuId = rowData.uuid || rowData.id || rowData._id;
        console.log("Extracted menuId:", menuId);

        if (!menuId) {
          console.error("No valid ID found in row data:", rowData);
          alert("Error: Menu ID not found. Please refresh and try again.");
          return;
        }

        // Find the original menu data from filteredAndSortedMenus
        selectedMenu = filteredAndSortedMenus.find((menu) => {
          const matches =
            menu.uuid === menuId ||
            menu.id === menuId ||
            menu._id === menuId ||
            String(menu.uuid) === String(menuId) ||
            String(menu.id) === String(menuId) ||
            String(menu._id) === String(menuId);
          return matches;
        });
      }

      if (selectedMenu) {
        console.log("Found original menu data:", selectedMenu);
        setEditingMenu(selectedMenu);
        setEditingMenuId(
          selectedMenu.uuid || selectedMenu.id || selectedMenu._id
        );
        setShowModal(true);
      } else {
        console.error("Original menu not found");
        alert("Menu not found. Please refresh the page and try again.");
      }
    },
    [filteredAndSortedMenus, hasPermission]
  );

  const handleDeleteClick = useCallback(
    async (rowData) => {
      console.log("=== DELETE DEBUG ===");
      console.log("Received rowData for deletion:", rowData);

      if (!hasPermission) {
        alert("You don't have permission to delete menu items for this hotel.");
        return;
      }

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
    [deleteMenu, hasPermission]
  );

  // ✅ NEW: Toggle menu availability
  const handleToggleAvailability = useCallback(
    async (rowData) => {
      if (!hasPermission) {
        alert("You don't have permission to modify menu items for this hotel.");
        return;
      }

      const menuId = rowData.uuid || rowData.id || rowData._id;
      const currentAvailability = rowData.Availability || "Available";

      if (!menuId) {
        alert("Error: Menu ID not found. Please refresh and try again.");
        return;
      }

      try {
        await toggleMenuAvailability(menuId, currentAvailability);
      } catch (error) {
        console.error("Error toggling menu availability:", error);
      }
    },
    [toggleMenuAvailability, hasPermission]
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

  // ✅ NEW: Export functionality
  const handleExport = useCallback(async () => {
    try {
      const data = exportMenus();
      const csv = data.map((row) => Object.values(row).join(",")).join("\n");
      const headers = Object.keys(data[0] || {}).join(",");
      const csvContent = headers + "\n" + csv;

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `menu_${activeHotelName}_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting menu:", error);
    }
  }, [exportMenus, activeHotelName]);

  // ✅ ENHANCED: Error state with connection info
  if (error && connectionStatus === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <ErrorMessage
              error={error}
              onRetry={handleRefresh}
              title="Error Loading Menu Items"
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
            Please select a hotel to manage menu items.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !filteredAndSortedMenus.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading menu items..." />
      </div>
    );
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
          hotelName={activeHotelName}
          submitting={submitting}
          existingMenus={menus}
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
                pageTitle={onlyView ? "View Menu" : "Menu Management"}
                className="text-2xl sm:text-3xl font-bold text-gray-900"
                description={
                  onlyView
                    ? `Browse menu items for ${activeHotelName}`
                    : `Manage menu items and categories for ${activeHotelName}`
                }
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
              {hasMenus && (
                <button
                  onClick={handleExport}
                  className="text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Export CSV
                </button>
              )}

              {!onlyView && (
                <PrimaryButton
                  onAdd={handleAddClick}
                  btnText="Add Menu Item"
                  loading={submitting}
                  disabled={!hasPermission}
                />
              )}
            </div>
          </div>
        </div>

        {/* ✅ ENHANCED: Stats Cards with more insights */}
        {hasMenus && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={ChefHat}
              title="Total Items"
              value={stats.total}
              color="blue"
              subtitle={`Avg price: ₹${stats.avgPrice}`}
            />
            <StatCard
              icon={TrendingUp}
              title="Available"
              value={stats.available}
              color="green"
              subtitle={`${stats.availabilityPercentage}% availability`}
            />
            <StatCard
              icon={DollarSign}
              title="With Discount"
              value={stats.discounted}
              color="orange"
              subtitle={
                stats.discounted > 0 ? "Special offers" : "No discounts"
              }
            />
            <StatCard
              icon={Grid}
              title="Categories"
              value={stats.categories}
              color="purple"
              subtitle={
                stats.featured > 0
                  ? `${stats.featured} featured`
                  : "Regular items"
              }
            />
          </div>
        )}

        {/* ✅ NEW: Filter Controls */}
        {hasMenus && !onlyView && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  <Filter size={14} className="mr-1" />
                  Filter by:
                </span>
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
                  onClick={() => handleStatusFilter("available")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterStatus === "available"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Available ({stats.available})
                </button>
                <button
                  onClick={() => handleStatusFilter("unavailable")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterStatus === "unavailable"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Unavailable ({stats.unavailable})
                </button>
              </div>

              {hasFiltersApplied && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        {hasMenus && (
          <SearchWithResults
            searchTerm={searchTerm}
            onSearchChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search menu items by name, category, or price..."
            totalCount={menuCount}
            filteredCount={filteredCount}
            onClearSearch={handleClearSearch}
            totalLabel="total menu items"
            showResultsCount={true}
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
                    onToggleStatus={
                      !onlyView ? handleToggleAvailability : undefined
                    }
                    loading={submitting}
                    emptyMessage="No menu items match your search criteria"
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
                    // ✅ NEW: Custom actions
                    customActions={
                      !onlyView
                        ? [
                            {
                              label: "Toggle Availability",
                              icon: "🔄",
                              onClick: handleToggleAvailability,
                              condition: () => hasPermission,
                            },
                          ]
                        : []
                    }
                  />
                </Suspense>
              ) : (
                <NoSearchResults
                  btnText="Add Menu Item"
                  searchTerm={searchTerm}
                  onClearSearch={handleClearSearch}
                  onAddNew={!onlyView ? handleAddClick : undefined}
                  hasFilters={hasFiltersApplied}
                  onClearFilters={clearAllFilters}
                />
              )}
            </>
          ) : (
            <EmptyState
              icon={onlyView ? Eye : ChefHat}
              title={onlyView ? "No Menu Items to View" : "No Menu Items Yet"}
              description={
                onlyView
                  ? `There are no menu items available to display for ${activeHotelName}. Check back later or contact the restaurant.`
                  : `Create your first menu item to start building ${activeHotelName}'s offerings. Add delicious dishes and beverages for your customers.`
              }
              actionLabel={onlyView ? undefined : "Add Your First Menu Item"}
              onAction={!onlyView ? handleAddClick : undefined}
              loading={submitting}
              disabled={!hasPermission}
              // ✅ NEW: Additional suggestions
              suggestions={
                !onlyView
                  ? [
                      "Start with your signature dishes",
                      "Include high-quality images for better appeal",
                      "Set competitive prices and attractive discounts",
                      "Organize items into clear categories",
                    ]
                  : undefined
              }
            />
          )}
        </div>

        {/* ✅ NEW: Footer with insights */}
        <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
          {connectionStatus === "connected" && (
            <div className="flex items-center justify-center gap-4">
              <span>Total items: {menuCount}</span>
              {filteredCount !== menuCount && (
                <span>Filtered: {filteredCount}</span>
              )}
              {stats.unavailable > 0 && (
                <span className="text-red-600">
                  {stats.unavailable} items unavailable
                </span>
              )}
              {stats.discounted > 0 && (
                <span className="text-green-600">
                  {stats.discounted} items on offer
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

AddMenu.displayName = "AddMenu";

export default AddMenu;
