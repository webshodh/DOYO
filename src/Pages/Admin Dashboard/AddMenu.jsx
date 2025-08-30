import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";
import { DynamicTable } from "components";
import { ViewMenuColumns } from "data/Columns";
import CategoryTabs from "components/CategoryTab";
import { PageTitle } from "Atoms";
import SearchWithButton from "components/SearchWithAddButton";
import MenuFormModal from "../../components/FormModals/MenuFormModal";
import { useMenu } from "../../customHooks/menu";

function AddMenu() {
  const [show, setShow] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedMenuData, setEditedMenuData] = useState(null);
  const [editedMenuId, setEditedMenuId] = useState(null);

  const { hotelName } = useParams();

  const {
    categories,
    mainCategories,
    filteredAndSortedMenus,
    menuCountsByCategory,
    searchTerm,
    activeCategory,
    loading,
    addMenu,
    updateMenu,
    deleteMenu,
    handleCategoryFilter,
    handleSearchChange,
  } = useMenu(hotelName);

  // Handle adding new menu
  const handleAdd = () => {
    setEditMode(false);
    setEditedMenuData(null);
    setEditedMenuId(null);
    setShow(true);
  };

  // Handle editing existing menu - receives the full row object
  const handleEdit = (rowData) => {
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
      setEditedMenuData(selectedMenu);
      setEditedMenuId(menuId);
      setEditMode(true);
      setShow(true);
    } else {
      console.error("Original menu not found for ID:", menuId);
      console.error("Available menus:", filteredAndSortedMenus);
      alert("Menu not found. Please refresh the page and try again.");
    }
  };

  // Handle deleting menu - receives the full row object
  const handleDelete = async (rowData) => {
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
    if (window.confirm(`Are you sure you want to delete "${menuName}"?`)) {
      try {
        console.log("Calling deleteMenu with ID:", menuId);
        const success = await deleteMenu(menuId);
        console.log("Delete operation result:", success);

        if (success) {
          console.log("Menu deleted successfully");
          // The useMenu hook should automatically update the list
        } else {
          console.error("Failed to delete menu - deleteMenu returned false");
          alert("Failed to delete menu. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting menu:", error);
        alert("An error occurred while deleting the menu. Please try again.");
      }
    }
  };

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    console.log("=== FORM SUBMIT DEBUG ===");
    console.log("Form submitted with data:", formData);
    console.log("Edit mode:", editMode, "Menu ID:", editedMenuId);

    let success = false;

    try {
      if (editMode && editedMenuId) {
        console.log("Updating menu with ID:", editedMenuId);
        success = await updateMenu(formData, editedMenuId);
        console.log("Update result:", success);
      } else {
        console.log("Adding new menu");
        success = await addMenu(formData);
        console.log("Add result:", success);
      }

      if (success) {
        handleClose(); // Close modal on success
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      alert("An error occurred while saving the menu. Please try again.");
    }

    return success;
  };

  // Handle modal close
  const handleClose = () => {
    setShow(false);
    setEditMode(false);
    setEditedMenuData(null);
    setEditedMenuId(null);
  };

  // Prepare data for the table
  const tableData = filteredAndSortedMenus.map((item, index) => {
    return {
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
    };
  });

  console.log("Table data prepared:", tableData.length, "items");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading menus...</div>
      </div>
    );
  }

  return (
    <>
      <div style={{ margin: "20px" }}>
        {/* Menu Form Modal */}
        <MenuFormModal
          show={show}
          onClose={handleClose}
          onSubmit={handleFormSubmit}
          categories={categories}
          mainCategories={mainCategories}
          editMode={editMode}
          initialData={editedMenuData}
        />
        <PageTitle pageTitle="View Menu" />
        {/* Main Content */}
        <div className="w-full px-4 mt-2">
          {/* Search and Add Button */}
          <div className="mt-1 mb-3">
            <SearchWithButton
              searchTerm={searchTerm}
              onSearchChange={(e) => handleSearchChange(e.target.value)}
              buttonText="Add Menu"
              onButtonClick={handleAdd}
            />
          </div>

          {/* Categories Section */}
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

          {/* Menu Table */}
          <div className="mt-4">
            <div className="overflow-x-auto">
              {tableData.length > 0 ? (
                <DynamicTable
                  columns={ViewMenuColumns}
                  data={tableData}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">No menus found</p>
                  {searchTerm && (
                    <p className="text-gray-400">
                      Try adjusting your search criteria
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </>
  );
}

export default AddMenu;
