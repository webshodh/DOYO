import React, { useState, useEffect } from "react";
import { db, storage } from "../../data/firebase/firebaseConfig";
import { uid } from "uid";
import { set, ref, onValue, update, get, remove } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useHotelContext } from "../../Context/HotelContext";
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
  const [category, setCategory] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [file, setFile] = useState(null); // State for file upload
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

  const { hotelName } = useHotelContext();
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;

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
      setDiscount(selectedMenu.discount);
      setFinalPrice(selectedMenu.finalPrice);
      setMenuCategory(selectedMenu.menuCategory);
      setMenuContent(selectedMenu.menuContent);
      setAvailability(selectedMenu.availability);
      setMainCategory(selectedMenu.mainCategory);
      setFile(null); // Reset file upload
      setEditMode(true);
      setEditedMenuId(menuId);
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
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
  };

  const filteredAndSortedItems = filterAndSortItems();

  // Handle form submission for adding/updating menu
  const writeToDatabase = async () => {
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
          menuName,
          menuCookingTime,
          menuPrice,
          discount,
          finalPrice: calculatedFinalPrice || menuPrice,
          menuCategory,
          menuContent,
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
          setEditMode(true);
          setEditedMenuId(null);
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
  }));

  console.log("data", data);
  return (
    <>
      <div className="d-flex flex-wrap w-full">
        {/* Modal */}
        {show && (
          <Modal
            title="Add Menu"
            handleClose={handleClose}
            children={
              <div className="bg-white p-6 w-full max-w-md mx-auto">
                <form className="space-y-6 w-full">
                  <div className="gap-6 grid grid-cols-1 sm:grid-cols-2">
                    {/* Menu Name Input */}
                    <div className="relative col-span-2">
                      <label
                        htmlFor="menuName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Menu Name
                      </label>
                      <input
                        type="text"
                        id="menuName"
                        value={menuName}
                        onChange={handleChange(setMenuName)}
                        className={`mt-1 block w-full px-3 py-2 border ${
                          menuName ? "border-green-500" : "border-red-500"
                        } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                        placeholder="Enter Menu Name"
                      />
                      {menuName ? (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-500">
                          <FaCheckCircle />
                        </div>
                      ) : (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-red-500">
                          <FaExclamationCircle />
                        </div>
                      )}
                      {!menuName && (
                        <p className="text-red-500 text-xs mt-1">
                          Menu Name is required.
                        </p>
                      )}
                    </div>

                    {/* Responsive Grid Items */}
                    {/* Repeat similar input structure for other inputs like Menu Category, Menu Price, etc. */}
                    {/* Ensure each input container uses responsive grid columns, and styling adjusts automatically */}

                    {/* Submit Button */}
                    <div className="col-span-2 flex items-center justify-end">
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
          ></Modal>
        )}

        {/* Categories and Search Section */}
        <div className="w-full px-4 mt-4">
          <div className="overflow-x-auto no-scrollbar">
            {/* Horizontal Scroll for Tabs */}
            <div className="flex flex-nowrap space-x-2">
              <CategoryTabs
                categories={categories}
                menuCountsByCategory={menuCountsByCategory}
                handleCategoryFilter={handleCategoryFilter}
              />
            </div>
          </div>

          {/* Search Bar and Add Button */}
          <div className="mt-4 bg-white rounded-lg shadow-md p-4">
            <SearchWithButton
              searchTerm={searchTerm}
              onSearchChange={(e) => setSearchTerm(e.target.value)}
              buttonText="Add Menu"
              onButtonClick={handleAdd}
            />
          </div>

          {/* Table for Menu Items */}
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
