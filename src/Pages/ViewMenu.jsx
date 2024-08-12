import React, { useState, useEffect } from "react";
import { db } from "../data/firebase/firebaseConfig";
import { ref, onValue, remove } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DynamicTable, FilterSortSearch } from "../components";
import PageTitle from "../Atoms/PageTitle";
import { ViewMenuColumns } from "../data/Columns";
import styled from "styled-components";
import { useHotelContext } from "../Context/HotelContext";
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

  // Fetch Menu data from database
  useEffect(() => {
    onValue(ref(db, `/${hotelName}/menu`), (snapshot) => {
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
    onValue(ref(db, `/${hotelName}/categories/`), (snapshot) => {
      setCategories([]);
      const data = snapshot.val();
      if (data !== null) {
        Object.values(data).forEach((category) => {
          setCategories((oldCategories) => [...oldCategories, category]);
        });
      }
    });
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
      remove(ref(db, `/${hotelName}/menu/${menuId}`));

      toast.success("Menu Deleted Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
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
  
  const columns = ViewMenuColumns
  console.log('data', data)
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
                style={{marginRight:'5px'}}
              >
                <div>
                  All{" "}
                  <span
                    className="badge bg-danger badge-number"
                    style={{ borderRadius: "50%" , padding:'5px'}}
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
          <PageTitle pageTitle={'View Menu'}/>
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
