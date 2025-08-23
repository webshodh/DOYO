import React, { useState, useEffect } from "react";
import { db, storage } from "../../data/firebase/firebaseConfig";
import { uid } from "uid";
import { set, ref, onValue, update, get, remove } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { FaCheckCircle, FaExclamationCircle, FaSearch } from "react-icons/fa";
import { DynamicTable } from "components";
import { ViewMenuColumns } from "data/Columns";
import Modal from "components/Modal";
import CategoryTabs from "components/CategoryTab";
import { PageTitle } from "Atoms";
import SearchWithButton from "components/SearchWithAddButton";

function AddMenu() {
  const [menuName, setMenuName] = useState("");
  const [menuCookingTime, setMenuCookingTime] = useState("");
  const [menuPrice, setMenuPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [finalPrice, setFinalPrice] = useState("");
  const [menuCategory, setMenuCategory] = useState("");
  const [menuContent, setMenuContent] = useState("");
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [availability, setAvailability] = useState("Available");
  const [mainCategory, setMainCategory] = useState("");
  const [file, setFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedMenuId, setEditedMenuId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [menus, setMenus] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [menuCountsByCategory, setMenuCountsByCategory] = useState({});
  const [hotels, setHotels] = useState([]);
  const [show, setShow] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");

  const { hotelName } = useParams();
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  console.log("hotelName", hotelName);
  // Fetch Menu data from the database
  useEffect(() => {
    const menuRef = ref(db, `/hotels/${hotelName}/menu`);
    onValue(menuRef, (snapshot) => {
      setMenus([]);
      const data = snapshot.val();
      if (data) {
        setMenus(Object.values(data));
      }
    });
    console.log("menu", hotelName);
  }, [hotelName]);

  // Fetch Category data from the database
  useEffect(() => {
    const categoryRef = ref(db, `/hotels/${hotelName}/categories/`);
    const unsubscribe = onValue(categoryRef, (snapshot) => {
      const data = snapshot.val();
      setCategories(data ? Object.values(data) : []);
    });
    return () => unsubscribe();
  }, [hotelName]);

  // Fetch MainCategory data from the database
  useEffect(() => {
    const categoryRef = ref(db, `/hotels/${hotelName}/Maincategories/`);
    const unsubscribe = onValue(categoryRef, (snapshot) => {
      const data = snapshot.val();
      setMainCategories(data ? Object.values(data) : []);
    });
    return () => unsubscribe();
  }, [hotelName]);

  useEffect(() => {
    const countsByCategory = {};
    menus.forEach((menu) => {
      const category = menu.menuCategory;
      countsByCategory[category] = (countsByCategory[category] || 0) + 1;
    });
    setMenuCountsByCategory(countsByCategory);
  }, [menus]);

  // Calculate final price when price or discount changes
  useEffect(() => {
    if (menuPrice && discount) {
      const calculatedFinalPrice = Math.round(
        (menuPrice * (100 - discount)) / 100
      );
      setFinalPrice(calculatedFinalPrice.toString());
    } else if (menuPrice) {
      setFinalPrice(menuPrice);
    }
  }, [menuPrice, discount]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle the editing of a menu
  const handleEdit = (menuId) => {
    const selectedMenu = menus.find((menu) => menu.uuid === menuId);
    if (selectedMenu) {
      setMenuName(selectedMenu.menuName);
      setMenuCookingTime(selectedMenu.menuCookingTime);
      setMenuPrice(selectedMenu.menuPrice);
      setDiscount(selectedMenu.discount || "");
      setFinalPrice(selectedMenu.finalPrice);
      setMenuCategory(selectedMenu.menuCategory);
      setMenuContent(selectedMenu.menuContent);
      setAvailability(selectedMenu.availability);
      setMainCategory(selectedMenu.mainCategory);
      setFile(null);
      setEditMode(true);
      setEditedMenuId(menuId);
      setShow(true); // Open modal for editing
    }
  };

  // Handle the deletion of a menu
  const handleDelete = (menuId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this menu?"
    );
    if (confirmDelete) {
      remove(ref(db, `/hotels/${hotelName}/menu/${menuId}`));
      toast.success("Menu Deleted Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  // Handle search and sort functionality
  const filterAndSortItems = () => {
    let filteredItems = menus.filter((menu) =>
      menu.menuName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedCategory) {
      filteredItems = filteredItems.filter(
        (menu) =>
          menu.menuCategory.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (sortOrder === "lowToHigh") {
      filteredItems.sort(
        (a, b) => parseFloat(a.menuPrice) - parseFloat(b.menuPrice)
      );
    } else if (sortOrder === "highToLow") {
      filteredItems.sort(
        (a, b) => parseFloat(b.menuPrice) - parseFloat(a.menuPrice)
      );
    }

    return filteredItems;
  };

  const handleAdd = () => {
    // Reset form for new entry
    setMenuName("");
    setMenuCookingTime("");
    setMenuPrice("");
    setDiscount("");
    setFinalPrice("");
    setMenuCategory("");
    setMenuContent("");
    setAvailability("Available");
    setMainCategory("");
    setFile(null);
    setEditMode(false);
    setEditedMenuId(null);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    // Reset form
    setMenuName("");
    setMenuCookingTime("");
    setMenuPrice("");
    setDiscount("");
    setFinalPrice("");
    setMenuCategory("");
    setMenuContent("");
    setAvailability("Available");
    setMainCategory("");
    setFile(null);
    setEditMode(false);
    setEditedMenuId(null);
  };

  const filteredAndSortedItems = filterAndSortItems();

  // Validation function
  const validateForm = () => {
    if (!menuName.trim()) {
      toast.error("Menu Name is required!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
    if (!menuPrice) {
      toast.error("Menu Price is required!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
    if (!menuCookingTime) {
      toast.error("Cooking Time is required!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
    if (!menuCategory) {
      toast.error("Menu Category is required!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
    if (!mainCategory) {
      toast.error("Main Category is required!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
    if (!menuContent.trim()) {
      toast.error("Menu Content is required!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
    return true;
  };

  // Handle form submission for adding/updating menu
  const writeToDatabase = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const uuidSnapshot = await get(
        ref(db, `admins/${currentAdminId}/hotels/${hotelName}/uuid`)
      );
      const adminHotelUuid = uuidSnapshot.val();

      const generalUuidSnapshot = await get(
        ref(db, `hotels/${hotelName}/uuid`)
      );
      const generalHotelUuid = generalUuidSnapshot.val();

      if (adminHotelUuid === generalHotelUuid) {
        let imageUrl = "";
        if (file) {
          const imageRef = storageRef(
            storage,
            `images/${hotelName}/${file.name}`
          );
          await uploadBytes(imageRef, file);
          imageUrl = await getDownloadURL(imageRef);
        }

        const calculatedFinalPrice = discount
          ? Math.round((menuPrice * (100 - discount)) / 100)
          : menuPrice;

        const menuData = {
          menuName: menuName.trim(),
          menuCookingTime,
          menuPrice,
          discount: discount || "0",
          finalPrice: calculatedFinalPrice,
          menuCategory,
          menuContent: menuContent.trim(),
          availability,
          mainCategory,
          uuid: editMode ? editedMenuId : uid(),
          imageUrl: imageUrl || "",
        };

        if (editMode) {
          await update(
            ref(db, `/hotels/${hotelName}/menu/${editedMenuId}`),
            menuData
          );
          toast.success("Menu Updated Successfully!", {
            position: toast.POSITION.TOP_RIGHT,
          });
        } else {
          await set(
            ref(db, `/hotels/${hotelName}/menu/${menuData.uuid}`),
            menuData
          );
          toast.success("Menu Added Successfully!", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }

        handleClose(); // Close modal and reset form
      } else {
        toast.error(
          "You do not have permission to manage menus for this hotel.",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
      }
    } catch (error) {
      console.error("Error managing menu:", error);
      toast.error("Error managing menu. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const handleChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const columns = ViewMenuColumns;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setActiveCategory(category);
  };

  // Prepare data for the table
  const data = filteredAndSortedItems.map((item, index) => ({
    "Sr.No": index + 1,
    "Menu Category": item.menuCategory || "Other",
    "Menu Name": item.menuName,
    Price: item.menuPrice,
    Discount: item.discount || "-",
    "Final Price": item.finalPrice,
    Availability: item.availability,
    uuid: item.uuid, // Add uuid for edit/delete operations
  }));

  return (
    <>
      <div className="d-flex flex-wrap w-full">
        {/* Modal */}
        {show && (
          <Modal
            title={editMode ? "Edit Menu" : "Add Menu"}
            handleClose={handleClose}
            children={
              <div className="bg-white p-6 w-full max-w-2xl mx-auto">
                <form className="space-y-6 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Menu Name */}
                    <div className="relative col-span-2">
                      <label
                        htmlFor="menuName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Menu Name *
                      </label>
                      <input
                        type="text"
                        id="menuName"
                        value={menuName}
                        onChange={handleChange(setMenuName)}
                        className={`mt-1 block w-full px-3 py-2 border ${
                          menuName ? "border-green-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                        placeholder="Enter Menu Name"
                      />
                      {menuName && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-500 top-6">
                          <FaCheckCircle />
                        </div>
                      )}
                    </div>

                    {/* Menu Price */}
                    <div className="relative">
                      <label
                        htmlFor="menuPrice"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Menu Price *
                      </label>
                      <input
                        type="number"
                        id="menuPrice"
                        value={menuPrice}
                        onChange={handleChange(setMenuPrice)}
                        className={`mt-1 block w-full px-3 py-2 border ${
                          menuPrice ? "border-green-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                        placeholder="Enter Price"
                      />
                      {menuPrice && (
                        <FaCheckCircle className="absolute top-8 right-3 text-green-500" />
                      )}
                    </div>

                    {/* Cooking Time */}
                    <div className="relative">
                      <label
                        htmlFor="cookingTime"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Cooking Time (mins) *
                      </label>
                      <input
                        type="number"
                        id="cookingTime"
                        value={menuCookingTime}
                        onChange={handleChange(setMenuCookingTime)}
                        className={`mt-1 block w-full px-3 py-2 border ${
                          menuCookingTime
                            ? "border-green-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                        placeholder="Enter cooking time"
                      />
                      {menuCookingTime && (
                        <FaCheckCircle className="absolute top-8 right-3 text-green-500" />
                      )}
                    </div>

                    {/* Discount */}
                    <div className="relative">
                      <label
                        htmlFor="discount"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        id="discount"
                        value={discount}
                        onChange={handleChange(setDiscount)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                        placeholder="Enter discount percentage"
                        min="0"
                        max="100"
                      />
                    </div>

                    {/* Final Price */}
                    <div className="relative">
                      <label
                        htmlFor="finalPrice"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Final Price
                      </label>
                      <input
                        type="number"
                        id="finalPrice"
                        value={finalPrice}
                        readOnly
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                        placeholder="Auto-calculated"
                      />
                    </div>

                    {/* Menu Category */}
                    <div className="relative">
                      <label
                        htmlFor="menuCategory"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Menu Category *
                      </label>
                      <select
                        id="menuCategory"
                        value={menuCategory}
                        onChange={handleChange(setMenuCategory)}
                        className={`mt-1 block w-full px-3 py-2 border ${
                          menuCategory ? "border-green-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                      >
                        <option value="">Select category</option>
                        {categories.map((cat, index) => (
                          <option
                            key={index}
                            value={cat.categoryName || cat.name || cat}
                          >
                            {cat.categoryName || cat.name || cat}
                          </option>
                        ))}
                      </select>
                      {menuCategory && (
                        <FaCheckCircle className="absolute top-8 right-3 text-green-500" />
                      )}
                    </div>

                    {/* Main Category */}
                    <div className="relative">
                      <label
                        htmlFor="mainCategory"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Main Category *
                      </label>
                      <select
                        id="mainCategory"
                        value={mainCategory}
                        onChange={handleChange(setMainCategory)}
                        className={`mt-1 block w-full px-3 py-2 border ${
                          mainCategory ? "border-green-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                      >
                        <option value="">Select main category</option>
                        {mainCategories.map((cat, index) => (
                          <option
                            key={index}
                            value={cat.categoryName || cat.name || cat}
                          >
                            {cat.categoryName || cat.name || cat}
                          </option>
                        ))}
                      </select>
                      {mainCategory && (
                        <FaCheckCircle className="absolute top-8 right-3 text-green-500" />
                      )}
                    </div>

                    {/* Availability */}
                    <div className="relative">
                      <label
                        htmlFor="availability"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Availability
                      </label>
                      <select
                        id="availability"
                        value={availability}
                        onChange={handleChange(setAvailability)}
                        className="mt-1 block w-full px-3 py-2 border border-green-500 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                      >
                        <option value="Available">Available</option>
                        <option value="Not Available">Not Available</option>
                      </select>
                    </div>

                    {/* File Upload */}
                    <div className="relative">
                      <label
                        htmlFor="file"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Upload Image
                      </label>
                      <input
                        type="file"
                        id="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>

                    {/* Menu Content */}
                    <div className="relative col-span-2">
                      <label
                        htmlFor="menuContent"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Menu Content *
                      </label>
                      <textarea
                        id="menuContent"
                        rows="3"
                        value={menuContent}
                        onChange={handleChange(setMenuContent)}
                        className={`mt-1 block w-full px-3 py-2 border ${
                          menuContent ? "border-green-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                        placeholder="Enter menu description"
                      ></textarea>
                      {menuContent && (
                        <FaCheckCircle className="absolute top-8 right-3 text-green-500" />
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="col-span-2 flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={writeToDatabase}
                        className="bg-green-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        {editMode ? "Update Menu" : "Add Menu"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            }
          />
        )}

        {/* Categories and Search Section */}
        <div className="w-full px-4 mt-4">
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex flex-nowrap space-x-2">
              <CategoryTabs
                categories={categories}
                menuCountsByCategory={menuCountsByCategory}
                handleCategoryFilter={handleCategoryFilter}
              />
            </div>
          </div>

          <div>
            <SearchWithButton
              searchTerm={searchTerm}
              onSearchChange={(e) => setSearchTerm(e.target.value)}
              buttonText="Add Menu"
              onButtonClick={handleAdd}
            />
          </div>

          <div className="mt-4">
            <PageTitle pageTitle={"View Menu"} />
            <div className="overflow-x-auto">
              <DynamicTable
                columns={columns}
                data={data}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </>
  );
}

export default AddMenu;
