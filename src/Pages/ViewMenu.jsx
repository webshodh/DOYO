import React, { useState, useEffect } from "react";
import { db } from "../data/firebase/firebaseConfig";
import { ref, onValue, remove, get, update } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DynamicTable, FilterSortSearch } from "../components";
import PageTitle from "../Atoms/PageTitle";
import { ViewMenuColumns } from "../data/Columns";
import styled from "styled-components";
import { useHotelContext } from "../Context/HotelContext";
import { getAuth } from "firebase/auth";
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

  // const handleDelete = async (menuId) => {
  //   console.log("menuId:", menuId); // Debugging: Check what menuId is
    
  //   const confirmDelete = window.confirm(
  //     "Are you sure you want to delete this menu?"
  //   );
  //   if (confirmDelete) {
  //     try {
  //       // Ensure menuId is a valid string
  //       if (typeof menuId !== "string") {
  //         throw new Error("Invalid menuId. Expected a string but received: " + typeof menuId);
  //       }
  
  //       // Fetch the UUID of the hotel from the admin's collection
  //       const adminHotelUuidSnapshot = await get(
  //         ref(db, `admins/${adminID}/hotels/${hotelName}/uuid`)
  //       );
  
  //       if (!adminHotelUuidSnapshot.exists()) {
  //         throw new Error("Admin hotel UUID not found.");
  //       }
  //       const adminHotelUuid = adminHotelUuidSnapshot.val();
  
  //       // Fetch the UUID associated with the menu from the general hotels collection
  //       const generalHotelUuidSnapshot = await get(
  //         ref(db, `hotels/${hotelName}/menu/${menuId}/uuid`)
  //       );
  
  //       if (!generalHotelUuidSnapshot.exists()) {
  //         throw new Error("Menu UUID not found.");
  //       }
  //       const generalHotelUuid = generalHotelUuidSnapshot.val();
  
  //       // Compare the UUIDs to ensure only the admin can delete
  //       if (adminHotelUuid && adminHotelUuid === generalHotelUuid) {
  //         // Delete the menu
  //         await remove(ref(db, `hotels/${hotelName}/menu/${menuId}`));
  
  //         toast.success("Menu Deleted Successfully!", {
  //           position: toast.POSITION.TOP_RIGHT,
  //         });
  //       } else {
  //         toast.error("You do not have permission to delete this menu.", {
  //           position: toast.POSITION.TOP_RIGHT,
  //         });
  //       }
  //     } catch (error) {
  //       console.error("Error during delete process:", error.message);
  //       toast.error("Error deleting menu. Please try again.", {
  //         position: toast.POSITION.TOP_RIGHT,
  //       });
  //     }
  //   }
  // };
  
  

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
      <PageTitle />
      <div className="container mt-2">
        <div className="row">
          <div className="col-12">
            <div className="d-flex flex-wrap justify-content-start">
              <div
                className="d-flex flex-nowrap overflow-auto"
                style={{ whiteSpace: "nowrap" }}
              >
                <div
                  className="p-2 mb-2 bg-light border  cursor-pointer d-inline-block categoryTab"
                  onClick={() => handleCategoryFilter("")}
                  style={{ marginRight: "5px" }}
                >
                  <div>
                    All{" "}
                    <span
                      className="badge bg-danger badge-number"
                      style={{ borderRadius: "50%", padding: "5px" }}
                    >
                      {" "}
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
                      className="category p-2 mb-2 bg-light border cursor-pointer d-inline-block categoryTab"
                      key={item.id}
                      onClick={() => handleCategoryFilter(item.categoryName)}
                    >
                      <div className="category-name">
                        {item.categoryName}{" "}
                        <span
                          className="badge bg-danger badge-number"
                          style={{ borderRadius: "50%" }}
                        >
                          {menuCountsByCategory[item.categoryName]}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-2">
        <FilterSortSearch searchTerm={searchTerm} handleSearch={handleSearch} />
        <BackgroundCard>
          <PageTitle pageTitle={"View Menu"} />
          <DynamicTable
            columns={columns}
            data={data}
            onEdit={handleShow}
            onDelete={handleDelete}
          />
        </BackgroundCard>
      </div>
      <ToastContainer />
    </>
  );
}

export default ViewMenu;
