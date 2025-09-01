import React, { useState, useEffect } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { onValue, ref } from "firebase/database";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, FilterSortSearch, HorizontalMenuCard } from "../../components";
import "../../styles/Home.css";
import { colors } from "../../theme/theme";

import CategoryTabs from "../../components/CategoryTab";
import AlertMessage from "Atoms/AlertMessage";
import { useParams } from "react-router-dom";
function Home() {
  const [menus, setMenus] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [mainCategoryCounts, setMainCategoryCounts] = useState({});
  const [menuCounts, setMenuCounts] = useState({});
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [activeMainCategory, setActiveMainCategory] = useState("");
  const [menuCountsByCategory, setMenuCountsByCategory] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  // const [hotelName, setHotelName] = useState("");
  const { hotelName } = useParams();
  // useEffect(() => {
  //   const path = window.location.pathname;
  //   const pathSegments = path.split("/");
  //   const hotelNameFromPath = pathSegments[pathSegments.length - 2];
  //   setHotelName(hotelNameFromPath);
  // }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("admin")) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, []);

  // Fetch Menu
  useEffect(() => {
    onValue(ref(db, `/hotels/${hotelName}/menu/`), (snapshot) => {
      setMenus([]);
      const data = snapshot.val();
      if (data !== null) {
        setMenus(Object.values(data));
        setFilteredMenus(Object.values(data)); // Set the initial filtered menus
      }
    });
  }, [hotelName]);

  // Fetch categories
  useEffect(() => {
    onValue(ref(db, `/hotels/${hotelName}/categories/`), (snapshot) => {
      setCategories([]);
      const data = snapshot.val();
      if (data !== null) {
        const categoriesData = Object.values(data);
        setCategories(categoriesData);
        fetchMenuCounts(categoriesData);
      }
    });
  }, [hotelName]);

  // Fetch Maincategories
  useEffect(() => {
    onValue(ref(db, `/hotels/${hotelName}/Maincategories/`), (snapshot) => {
      setMainCategories([]);
      const data = snapshot.val();
      if (data !== null) {
        const mainCategoriesData = Object.values(data);
        setMainCategories(mainCategoriesData);
        fetchMainCategoryCounts(mainCategoriesData);
      }
    });
  }, [hotelName]);

  const fetchMenuCounts = (categoriesData) => {
    const counts = {};
    categoriesData.forEach((category) => {
      const categoryMenus = menus.filter(
        (menu) => menu.menuCategory === category.categoryName
      );
      counts[category.categoryName] = categoryMenus.length;
    });
    setMenuCounts(counts);
  };

  const fetchMainCategoryCounts = (mainCategoriesData) => {
    const counts = {};
    mainCategoriesData.forEach((mainCategory) => {
      const mainCategoryMenus = menus.filter(
        (menu) => menu.mainCategory === mainCategory.mainCategoryName
      );
      counts[mainCategory.mainCategoryName] = mainCategoryMenus.length;
    });
    setMainCategoryCounts(counts);
  };

  useEffect(() => {
    const countsByMainCategory = {};
    menus.forEach((menu) => {
      const mainCategory = menu.mainCategory;
      countsByMainCategory[mainCategory] =
        (countsByMainCategory[mainCategory] || 0) + 1;
    });
    setMainCategoryCounts(countsByMainCategory);
  }, [menus]);

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

  const handleSort = (order) => {
    setSortOrder(order);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setActiveCategory(category);
    setSelectedMainCategory("");
    setActiveMainCategory("");
  };

  const handleMainCategoryFilter = (event) => {
    // Using data-* attribute to get the category name
    const categoryName = event.target.getAttribute("data-category");
    if (categoryName === null) {
      // Handle "All" button click
      setSelectedMainCategory("");
      setActiveMainCategory("");
    }
    setSelectedMainCategory(categoryName);
    setActiveMainCategory(categoryName);
  };

  const filterAndSortItems = () => {
    // Ensure search term is a string
    const search = (searchTerm || "").toLowerCase();

    // Filter by search term
    let filteredItems = filteredMenus.filter((menu) =>
      menu.menuName.toLowerCase().includes(search)
    );

    // Filter by selected category
    if (
      selectedCategory &&
      typeof selectedCategory === "string" &&
      selectedCategory.trim() !== ""
    ) {
      filteredItems = filteredItems.filter(
        (menu) =>
          menu.menuCategory &&
          menu.menuCategory.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by selected main category
    if (
      selectedMainCategory &&
      typeof selectedMainCategory === "string" &&
      selectedMainCategory.trim() !== ""
    ) {
      // If a main category is selected, filter items by that main category
      filteredItems = filteredItems.filter(
        (menu) =>
          menu.mainCategory &&
          menu.mainCategory.toLowerCase().trim() ===
            selectedMainCategory.toLowerCase().trim()
      );
    }

    // Sort by price
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

  console.log("hotelNamehotelNamehotelName", hotelName);

  return (
    <>
      {!isAdmin && (
        <>
          <Navbar
            hotelName={`${hotelName}`}
            title={`${hotelName}`}
            Fabar={true}
            style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}
            offers={true}
          />

          {/* <AlertMessage
            linkText={
              "Looking to upgrade your hotel with a Digital Menu? Click here to learn more!"
            }
            type="info"
            icon="bi-info-circle"
            linkUrl="www.google.com"
          /> */}
        </>
      )}

      <div
        style={{
          background: `${colors.LightGrey}`,
          padding: "20px",
        }}
      >
        {/* Search and Sort */}
        <div className=" top-16">
          <FilterSortSearch
            searchTerm={searchTerm}
            handleSearch={handleSearch}
            handleSort={handleSort}
          />
        </div>

        {/* Category Tabs */}
        <div className=" top-24">
          <CategoryTabs
            categories={categories}
            menuCountsByCategory={menuCountsByCategory}
            handleCategoryFilter={handleCategoryFilter}
          />
        </div>

        {/* Main Category Buttons */}
        {mainCategories.map((mainCategory) => {
          const categoryName = mainCategory.categoryName;
          const categoryCount = mainCategoryCounts[categoryName] || 0; // Get the count for the category

          // Only render the button if the category has at least one menu item
          if (categoryCount > 0) {
            return (
              <button
                key={mainCategory.mainCategoryName}
                onClick={handleMainCategoryFilter}
                className={`flex-1 px-4 py-2 text-sm font-medium whitespace-nowrap transition duration-300 ease-in-out 
          rounded-full mr-2
          ${
            activeMainCategory === categoryName
              ? "bg-orange-500 text-white border-b-2 border-orange-500"
              : " bg-white border border-orange-500 text-black hover:bg-orange-500"
          }
        `}
                style={{
                  margin: "10px 5px",
                }}
                data-category={categoryName}
              >
                {categoryName} ({categoryCount})
              </button>
            );
          }

          return null; // Don't render the button if the category has no items
        })}
      </div>

      {/* Menu Items */}
      <div
        className="flex flex-wrap justify-center gap-1 px-4 ml-2"
        style={{
          height: "calc(100vh - 240px)",
          overflowY: "auto",
          background: colors.LightGrey,
          // marginBottom: "50px",
        }}
      >
        {filteredAndSortedItems.map((item) => (
          <div
            className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 mb-2"
            key={item.id}
          >
            <HorizontalMenuCard item={item} handleImageLoad={handleImageLoad} />
          </div>
        ))}
      </div>
    </>
  );
}

export default Home;
