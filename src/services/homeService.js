// services/homeService.js
import { db } from "../data/firebase/firebaseConfig";
import { onValue, ref } from "firebase/database";
import { specialCategories } from "../Constants/addMenuFormConfig";

class HomeService {
  async fetchAllData(hotelName) {
    if (!hotelName) {
      throw new Error("Hotel name is required");
    }

    const [menus, categories, mainCategories] = await Promise.all([
      this.fetchMenus(hotelName),
      this.fetchCategories(hotelName),
      this.fetchMainCategories(hotelName),
    ]);

    const counts = this.calculateAllCounts(menus, categories, mainCategories);

    return {
      menus,
      categories,
      mainCategories,
      counts,
    };
  }

  fetchMenus(hotelName) {
    return new Promise((resolve, reject) => {
      try {
        onValue(
          ref(db, `/hotels/${hotelName}/menu/`),
          (snapshot) => {
            const data = snapshot.val();
            const menusArray = data ? Object.values(data) : [];

            // Validate menu structure
            const validMenus = menusArray.filter(
              (menu) => menu && typeof menu === "object" && menu.menuName
            );

            console.log("fetchMenus - raw data:", data);
            console.log("fetchMenus - processed menus:", validMenus);

            resolve(validMenus);
          },
          (error) => {
            reject(error);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  fetchCategories(hotelName) {
    return new Promise((resolve, reject) => {
      try {
        onValue(
          ref(db, `/hotels/${hotelName}/categories/`),
          (snapshot) => {
            const data = snapshot.val();
            const categoriesArray = data ? Object.values(data) : [];

            // Ensure each category has proper structure
            const validCategories = categoriesArray
              .map((category) => {
                if (typeof category === "string") {
                  // If category is just a string, convert to object
                  return {
                    categoryId: category,
                    categoryName: category,
                    createdAt: null,
                    createdBy: null,
                  };
                } else if (category && typeof category === "object") {
                  // Ensure object has required properties
                  return {
                    categoryId:
                      category.categoryId ||
                      category.id ||
                      category.categoryName,
                    categoryName:
                      category.categoryName || category.name || "Unknown",
                    createdAt: category.createdAt || null,
                    createdBy: category.createdBy || null,
                  };
                }
                return null;
              })
              .filter(Boolean); // Remove null entries

            console.log("fetchCategories - raw data:", data);
            console.log(
              "fetchCategories - processed categories:",
              validCategories
            );

            resolve(validCategories);
          },
          (error) => {
            reject(error);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  fetchMainCategories(hotelName) {
    return new Promise((resolve, reject) => {
      try {
        onValue(
          ref(db, `/hotels/${hotelName}/Maincategories/`),
          (snapshot) => {
            const data = snapshot.val();
            const mainCategoriesArray = data ? Object.values(data) : [];

            // Ensure each main category has proper structure
            const validMainCategories = mainCategoriesArray
              .map((mainCategory) => {
                if (typeof mainCategory === "string") {
                  return {
                    mainCategoryId: mainCategory,
                    mainCategoryName: mainCategory,
                    createdAt: null,
                    createdBy: null,
                  };
                } else if (mainCategory && typeof mainCategory === "object") {
                  return {
                    mainCategoryId:
                      mainCategory.mainCategoryId ||
                      mainCategory.id ||
                      mainCategory.mainCategoryName,
                    mainCategoryName:
                      mainCategory.mainCategoryName ||
                      mainCategory.name ||
                      "Unknown",
                    createdAt: mainCategory.createdAt || null,
                    createdBy: mainCategory.createdBy || null,
                  };
                }
                return null;
              })
              .filter(Boolean);

            console.log("fetchMainCategories - raw data:", data);
            console.log(
              "fetchMainCategories - processed main categories:",
              validMainCategories
            );

            resolve(validMainCategories);
          },
          (error) => {
            reject(error);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  calculateAllCounts(menus = [], categories = [], mainCategories = []) {
    return {
      menuCountsByCategory: this.calculateCategoryCounts(menus, categories),
      menuCountsByMainCategory: this.calculateMainCategoryCounts(
        menus,
        mainCategories
      ),
      specialCategoryCounts: this.calculateSpecialCounts(menus),
    };
  }

  calculateCategoryCounts(menus = [], categories = []) {
    const counts = {};
    categories.forEach((category) => {
      if (category && category.categoryName) {
        counts[category.categoryName] = menus.filter(
          (menu) => menu && menu.menuCategory === category.categoryName
        ).length;
      }
    });
    return counts;
  }

  calculateMainCategoryCounts(menus = [], mainCategories = []) {
    const counts = {};
    mainCategories.forEach((mainCategory) => {
      if (mainCategory && mainCategory.mainCategoryName) {
        counts[mainCategory.mainCategoryName] = menus.filter(
          (menu) => menu && menu.mainCategory === mainCategory.mainCategoryName
        ).length;
      }
    });
    return counts;
  }

  calculateSpecialCounts(menus = []) {
    const counts = {};
    specialCategories.forEach((category) => {
      if (category && category.name) {
        counts[category.name] = menus.filter(
          (menu) => menu && menu[category.name] === true
        ).length;
      }
    });
    return counts;
  }
}

export const homeService = new HomeService();
