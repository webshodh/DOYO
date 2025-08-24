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

  // Handle editing existing menu
  const handleEdit = (menuId) => {
    const selectedMenu = filteredAndSortedMenus.find(
      (menu) => menu.uuid === menuId
    );
    if (selectedMenu) {
      setEditedMenuData(selectedMenu);
      setEditedMenuId(menuId);
      setEditMode(true);
      setShow(true);
    }
  };

  // Handle deleting menu
  const handleDelete = async (menuId) => {
    await deleteMenu(menuId);
  };

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    let success = false;

    if (editMode && editedMenuId) {
      success = await updateMenu(formData, editedMenuId);
    } else {
      success = await addMenu(formData);
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
  const tableData = filteredAndSortedMenus.map((item, index) => ({
    "Sr.No": index + 1,
    Img: item.imageUrl || item.file,
    "Menu Category": item.menuCategory || "Other",
    "Menu Name": item.menuName,
    Price: item.menuPrice,
    Discount: item.discount || "-",
    "Final Price": item.finalPrice,
    Availability: item.availability,
    uuid: item.uuid, // Add uuid for edit/delete operations
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading menus...</div>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex flex-wrap w-full" style={{ marginTop: "100px" }}>
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

        {/* Main Content */}
        <div className="w-full px-4 mt-4">
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

          {/* Search and Add Button */}
          <div className="mt-4">
            <SearchWithButton
              searchTerm={searchTerm}
              onSearchChange={(e) => handleSearchChange(e.target.value)}
              buttonText="Add Menu"
              onButtonClick={handleAdd}
            />
          </div>

          {/* Menu Table */}
          <div className="mt-4">
            <PageTitle pageTitle="View Menu" />
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
