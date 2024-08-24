import React, { useState, useEffect } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { ref, onValue, remove, get, update } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DynamicTable, FilterSortSearch } from "../../components";
import PageTitle from "../../Atoms/PageTitle";
import { ViewMenuColumns } from "../../data/Columns";
import styled from "styled-components";
import { useHotelContext } from "../../Context/HotelContext";
import { getAuth } from "firebase/auth";
import { FaSearch } from "react-icons/fa";
// Background Card
const BackgroundCard = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;
function ViewMenu() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [menus, setMenus] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [menuCountsByCategory, setMenuCountsByCategory] = useState({});
  const [hotels, setHotels] = useState([]);

  const { hotelName } = useHotelContext();
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const adminID = currentAdminId;

  // Fetch Menu data from database
  useEffect(() => {
    onValue(ref(db, `/hotels/${hotelName}/menu`), (snapshot) => {
      setMenus([]);
      const data = snapshot.val();
      if (data !== null) {
        Object.values(data).forEach((menu) => {
          setMenus((oldMenus) => [...oldMenus, menu]);
        });
      }
    });
  }, [hotelName]);

  // Fetch Category data from database
  useEffect(() => {
    const categoryRef = ref(db, `/hotels/${hotelName}/categories/`);

    const unsubscribe = onValue(categoryRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const categoryArray = Object.values(data);
        setCategories(categoryArray);
      } else {
        setCategories([]); // Clear categories if none exist
      }
    });

    // Cleanup listener on component unmount
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

  const handleShow = (menuId) => {
    const selectedMenu = menus.find((menu) => menu.uuid === menuId);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = (menuId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this menu?"
    );
    if (confirmDelete) {
      // Delete the menu
      remove(ref(db, `/hotels/${hotelName}/menu/${menuId}`));

      toast.success("Menu Deleted Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const handleUpdate = async (menuId, updatedMenuData) => {
    const confirmUpdate = window.confirm(
      "Are you sure you want to update this menu?"
    );
    if (confirmUpdate) {
      try {
        // Fetch the UUID of the hotel from the admin's collection
        const uuidSnapshot = await get(
          ref(db, `admins/${adminID}/hotels/${hotelName}/uuid`)
        );
        const adminHotelUuid = uuidSnapshot.val();

        // Fetch the UUID of the hotel from the general hotels collection
        const generalUuidSnapshot = await get(
          ref(db, `hotels/${hotelName}/uuid`)
        );
        const generalHotelUuid = generalUuidSnapshot.val();

        // Compare the UUIDs to ensure only the admin can update
        if (adminHotelUuid === generalHotelUuid) {
          // Update the menu
          await update(
            ref(db, `/hotels/${hotelName}/menu/${menuId}`),
            updatedMenuData
          );

          toast.success("Menu Updated Successfully!", {
            position: toast.POSITION.TOP_RIGHT,
          });
        } else {
          toast.error("You do not have permission to update this menu.", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
      } catch (error) {
        console.error("Error updating menu:", error);
        toast.error("Error updating menu. Please try again.", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    }
  };

  const filterAndSortItems = () => {
    let filteredItems = menus.filter((menu) =>
      menu.menuName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedCategory !== "") {
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

  const filteredAndSortedItems = filterAndSortItems();

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  useEffect(() => {
    onValue(ref(db, "/"), (snapshot) => {
      setHotels([]);
      const data = snapshot.val();
      if (data !== null) {
        Object.values(data).map((item) => {
          setHotels((oldArray) => [...oldArray, item]);
        });
      }
    });
  }, []);

  // Prepare data for the table
  const data = filteredAndSortedItems.map((item, index) => ({
    "Sr.No": index + 1,
    "Menu Category": item.menuCategory || "Other",
    "Menu Name": item.menuName,
    "Cooking Time": `${item.menuCookingTime} min`,
    Price: item.menuPrice,
    Availability: item.availability,
    Actions: (
      <>
        <button
          className="btn btn-primary btn-sm mr-2"
          onClick={() => handleShow(item.uuid)}
        >
          <img src="/update.png" width="20px" height="20px" alt="Update" />
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleDelete(item.uuid)}
        >
          <img src="/delete.png" width="20px" height="20px" alt="Delete" />
        </button>
      </>
    ),
  }));

  const columns = ViewMenuColumns;
  console.log("data", data);
  return (
    <>
      <div>
        <PageTitle />
        <div className="">
          <div className="mt-4">
            <div className="overflow-x-auto">
              <div className="flex flex-wrap space-x-2 overflow-x-auto">
                <div
                  className="p-2 mb-2 bg-gray-200 border border-gray-300 rounded cursor-pointer hover:bg-gray-300"
                  onClick={() => handleCategoryFilter("")}
                >
                  <div className="flex items-center">
                    All{" "}
                    <span className="ml-2 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-full">
                      {Object.values(menuCountsByCategory).reduce(
                        (a, b) => a + b,
                        0
                      )}
                    </span>
                  </div>
                </div>
                {categories
                  .filter((item) => menuCountsByCategory[item.categoryName] > 0) // Only include categories with non-zero counts
                  .map((item) => (
                    <div
                      className="p-2 mb-2 bg-gray-200 border border-gray-300 rounded cursor-pointer hover:bg-gray-300"
                      key={item.id}
                      onClick={() => handleCategoryFilter(item.categoryName)}
                    >
                      <div className="flex items-center">
                        {item.categoryName}{" "}
                        <span className="ml-2 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-full">
                          {menuCountsByCategory[item.categoryName]}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center space-x-4 mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search..."
                className="w-full py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500">
                <FaSearch />
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">View Menu</h2>
              {/* DynamicTable and BackgroundCard are assumed to be custom components */}
              <DynamicTable
                columns={columns}
                data={data}
                onEdit={handleShow}
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

export default ViewMenu;
