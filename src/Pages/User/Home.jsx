import React, { useState, useEffect } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { onValue, ref } from "firebase/database";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, FilterSortSearch } from "../../components";
import "../../styles/Home.css";
import { colors } from "../../theme/theme";
import CategoryTabs from "../../components/CategoryTab";
import { useParams } from "react-router-dom";
import VerticalMenuCard from "components/Cards/VerticalMenuCard";
import { specialCategories } from "../../Constants/addMenuFormConfig";

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
  const [selectedSpecialFilters, setSelectedSpecialFilters] = useState([]);
  const [specialCategoryCounts, setSpecialCategoryCounts] = useState({});
  const { hotelName } = useParams();

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
        const menusData = Object.values(data);
        setMenus(menusData);
        setFilteredMenus(menusData);
        calculateSpecialCategoryCounts(menusData);
      }
    });
  }, [hotelName]);

  // Calculate counts for special categories
  const calculateSpecialCategoryCounts = (menusData) => {
    const counts = {};
    specialCategories.forEach((category) => {
      const categoryMenus = menusData.filter(
        (menu) => menu[category.name] === true
      );
      counts[category.name] = categoryMenus.length;
    });
    setSpecialCategoryCounts(counts);
  };

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
    const categoryName = event.target.getAttribute("data-category");
    if (categoryName === null) {
      setSelectedMainCategory("");
      setActiveMainCategory("");
    }
    setSelectedMainCategory(categoryName);
    setActiveMainCategory(categoryName);
  };

  const handleSpecialFilterToggle = (filterName) => {
    setSelectedSpecialFilters((prev) =>
      prev.includes(filterName)
        ? prev.filter((f) => f !== filterName)
        : [...prev, filterName]
    );
  };

  const clearAllFilters = () => {
    setSelectedSpecialFilters([]);
    setSelectedCategory("");
    setActiveCategory("");
    setSelectedMainCategory("");
    setActiveMainCategory("");
    setSearchTerm("");
  };

  const filterAndSortItems = () => {
    const search = (searchTerm || "").toLowerCase();

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
      filteredItems = filteredItems.filter(
        (menu) =>
          menu.mainCategory &&
          menu.mainCategory.toLowerCase().trim() ===
            selectedMainCategory.toLowerCase().trim()
      );
    }

    // Filter by special categories
    if (selectedSpecialFilters.length > 0) {
      filteredItems = filteredItems.filter((menu) =>
        selectedSpecialFilters.every((filter) => menu[filter] === true)
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

  // Get available special categories (those with items)
  const availableSpecialCategories = specialCategories.filter(
    (category) => specialCategoryCounts[category.name] > 0
  );

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
        </>
      )}
      <div>
        <div
          style={{
            background: `${colors.LightGrey}`,
            padding: "20px",
          }}
          className="pb-6"
        >
          {/* Search and Sort */}
          <div className="top-16 mb-4">
            <FilterSortSearch
              searchTerm={searchTerm}
              handleSearch={handleSearch}
              handleSort={handleSort}
            />
          </div>

          {/* Active Filters Display */}
          {(selectedSpecialFilters.length > 0 ||
            selectedCategory ||
            selectedMainCategory) && (
            <div className="mb-4 p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Active Filters:
                </span>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSpecialFilters.map((filter) => {
                  const category = specialCategories.find(
                    (c) => c.name === filter
                  );
                  return (
                    <span
                      key={filter}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {category?.label}
                      <button
                        onClick={() => handleSpecialFilterToggle(filter)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
                {selectedCategory && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    {selectedCategory}
                    <button
                      onClick={() => handleCategoryFilter("")}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedMainCategory && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    {selectedMainCategory}
                    <button
                      onClick={() => {
                        setSelectedMainCategory("");
                        setActiveMainCategory("");
                      }}
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Special Categories Filter - Horizontal Scroll */}
          {availableSpecialCategories.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Special Categories
              </h3>
              <div className="overflow-x-auto pb-2">
                <div className="flex space-x-3 min-w-max">
                  {availableSpecialCategories.map((category) => {
                    const isSelected = selectedSpecialFilters.includes(
                      category.name
                    );
                    const Icon = category.icon;
                    const count = specialCategoryCounts[category.name];

                    return (
                      <button
                        key={category.name}
                        onClick={() => handleSpecialFilterToggle(category.name)}
                        className={`flex-shrink-0 flex items-center px-4 py-2 rounded-full border-2 transition-all duration-200 transform hover:scale-105 ${
                          isSelected
                            ? `${category.activeColor} text-white border-transparent shadow-md`
                            : `${category.bgColor} ${category.iconColor} ${category.borderColor} hover:shadow-md`
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium whitespace-nowrap">
                          {category.label}
                        </span>
                        <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isSelected
                              ? "bg-white bg-opacity-20 text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div className="top-24 mb-4">
            <CategoryTabs
              categories={categories}
              menuCountsByCategory={menuCountsByCategory}
              handleCategoryFilter={handleCategoryFilter}
            />
          </div>

          {/* Main Category Buttons */}
          {/* <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {mainCategories.map((mainCategory) => {
                const categoryName = mainCategory.categoryName;
                const categoryCount = mainCategoryCounts[categoryName] || 0;

                if (categoryCount > 0) {
                  return (
                    <button
                      key={mainCategory.mainCategoryName}
                      onClick={handleMainCategoryFilter}
                      className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition duration-300 ease-in-out rounded-full ${
                        activeMainCategory === categoryName
                          ? "bg-orange-500 text-white shadow-md"
                          : "bg-white border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                      }`}
                      data-category={categoryName}
                    >
                      {categoryName} ({categoryCount})
                    </button>
                  );
                }

                return null;
              })}
            </div>
          </div> */}

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredAndSortedItems.length} items
              {(selectedSpecialFilters.length > 0 ||
                selectedCategory ||
                selectedMainCategory ||
                searchTerm) &&
                ` (filtered from ${filteredMenus.length} total items)`}
            </p>
          </div>
        </div>

        {/* <div>
          // Menu Items
          <MenuViewToggle
            filteredAndSortedItems={filteredAndSortedItems}
            handleImageLoad={handleImageLoad}
            colors={colors}
          />
        </div> */}

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
              <VerticalMenuCard item={item} handleImageLoad={handleImageLoad} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Home;
