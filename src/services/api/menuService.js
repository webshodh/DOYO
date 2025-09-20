import { db, storage } from "../firebase/firebaseConfig";
import { uid } from "uid";
import { set, ref, update, get, remove } from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { toast } from "react-toastify";
import {
  validateMenuForm,
  calculateFinalPrice,
} from "../../validation/menuValidation";

export const menuServices = {
  // Check if user has permission to manage hotel menus
  checkUserPermission: async (currentAdminId, hotelName) => {
    try {
      const adminUuidSnapshot = await get(
        ref(db, `admins/${currentAdminId}/hotels/${hotelName}/uuid`)
      );
      const generalUuidSnapshot = await get(
        ref(db, `hotels/${hotelName}/uuid`)
      );

      const adminHotelUuid = adminUuidSnapshot.val();
      const generalHotelUuid = generalUuidSnapshot.val();

      return adminHotelUuid === generalHotelUuid;
    } catch (error) {
      console.error("Error checking permissions:", error);
      return false;
    }
  },

  // Upload image to Firebase Storage
  uploadMenuImage: async (file, hotelName) => {
    if (!file) return "";

    try {
      const imageRef = storageRef(storage, `images/${hotelName}/${file.name}`);
      await uploadBytes(imageRef, file);
      return await getDownloadURL(imageRef);
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  },

  // Add new menu to database
  addMenu: async (menuData, hotelName, currentAdminId) => {
    try {
      // Validate form data
      if (!validateMenuForm(menuData)) {
        return false;
      }

      // Check permissions
      const hasPermission = await menuServices.checkUserPermission(
        currentAdminId,
        hotelName
      );
      if (!hasPermission) {
        toast.error(
          "You do not have permission to manage menus for this hotel.",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        return false;
      }

      // Upload image if provided
      let imageUrl = "";
      if (menuData.file) {
        imageUrl = await menuServices.uploadMenuImage(menuData.file, hotelName);
      }

      // Calculate final price
      const finalPrice = calculateFinalPrice(
        menuData.menuPrice,
        menuData.discount
      );

      // Prepare menu data with ALL fields
      const newMenuData = {
        // Basic Information
        menuName: menuData.menuName?.trim() || "",
        menuContent: menuData.menuContent?.trim() || "",
        ingredients: menuData.ingredients?.trim() || "",
        menuCookingTime: parseInt(menuData.menuCookingTime) || 0,
        servingSize: parseInt(menuData.servingSize) || 1,

        // Pricing & Timing
        menuPrice: parseFloat(menuData.menuPrice) || 0,
        discount: parseFloat(menuData.discount) || 0,
        finalPrice: finalPrice,
        calories: parseInt(menuData.calories) || 0,

        // Categories & Classification
        mainCategory: menuData.mainCategory || "",
        menuCategory: menuData.menuCategory || "",
        categoryType: menuData.categoryType || "",
        mealType: menuData.mealType || "",
        spiceLevel: menuData.spiceLevel || "",
        portionSize: menuData.portionSize || "",

        // Preparation Details
        preparationMethod: menuData.preparationMethod || "",
        difficulty: menuData.difficulty || "",
        availability: menuData.availability || "Available",
        cuisineType: menuData.cuisineType || "",
        tasteProfile: menuData.tasteProfile || "",
        texture: menuData.texture || "",
        cookingStyle: menuData.cookingStyle || "",

        // Nutritional Information
        nutritionalInfo: {
          protein: parseFloat(menuData.nutritionalInfo?.protein) || 0,
          carbs: parseFloat(menuData.nutritionalInfo?.carbs) || 0,
          fat: parseFloat(menuData.nutritionalInfo?.fat) || 0,
          fiber: parseFloat(menuData.nutritionalInfo?.fiber) || 0,
        },

        // Special Features (Boolean flags)
        chefSpecial: Boolean(menuData.chefSpecial),
        isPopular: Boolean(menuData.isPopular),
        isVegan: Boolean(menuData.isVegan),
        isGlutenFree: Boolean(menuData.isGlutenFree),
        isRecommended: Boolean(menuData.isRecommended),
        isSugarFree: Boolean(menuData.isSugarFree),
        isMostOrdered: Boolean(menuData.isMostOrdered),
        isSeasonal: Boolean(menuData.isSeasonal),
        isLimitedEdition: Boolean(menuData.isLimitedEdition),
        isOrganic: Boolean(menuData.isOrganic),
        isHighProtein: Boolean(menuData.isHighProtein),
        isLactoseFree: Boolean(menuData.isLactoseFree),
        isJainFriendly: Boolean(menuData.isJainFriendly),
        isKidsFriendly: Boolean(menuData.isKidsFriendly),
        isBeverageAlcoholic: Boolean(menuData.isBeverageAlcoholic),

        // Allergens (Array)
        allergens: Array.isArray(menuData.allergens) ? menuData.allergens : [],

        // System fields
        uuid: uid(),
        imageUrl: imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to database
      await set(
        ref(db, `/hotels/${hotelName}/menu/${newMenuData.uuid}`),
        newMenuData
      );

      toast.success("Menu Added Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });

      return true;
    } catch (error) {
      console.error("Error adding menu:", error);
      toast.error("Error adding menu. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Update existing menu
  updateMenu: async (menuData, menuId, hotelName, currentAdminId) => {
    try {
      // Validate form data
      if (!validateMenuForm(menuData)) {
        return false;
      }

      // Check permissions
      const hasPermission = await menuServices.checkUserPermission(
        currentAdminId,
        hotelName
      );
      if (!hasPermission) {
        toast.error(
          "You do not have permission to manage menus for this hotel.",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        return false;
      }

      // Upload new image if provided
      let imageUrl = menuData.existingImageUrl || menuData.imageUrl || "";
      if (menuData.file) {
        imageUrl = await menuServices.uploadMenuImage(menuData.file, hotelName);
      }

      // Calculate final price
      const finalPrice = calculateFinalPrice(
        menuData.menuPrice,
        menuData.discount
      );

      // Prepare updated menu data with ALL fields
      const updatedMenuData = {
        // Basic Information
        menuName: menuData.menuName?.trim() || "",
        menuContent: menuData.menuContent?.trim() || "",
        ingredients: menuData.ingredients?.trim() || "",
        menuCookingTime: parseInt(menuData.menuCookingTime) || 0,
        servingSize: parseInt(menuData.servingSize) || 1,

        // Pricing & Timing
        menuPrice: parseFloat(menuData.menuPrice) || 0,
        discount: parseFloat(menuData.discount) || 0,
        finalPrice: finalPrice,
        calories: parseInt(menuData.calories) || 0,

        // Categories & Classification
        mainCategory: menuData.mainCategory || "",
        menuCategory: menuData.menuCategory || "",
        categoryType: menuData.categoryType || "",
        mealType: menuData.mealType || "",
        spiceLevel: menuData.spiceLevel || "",
        portionSize: menuData.portionSize || "",

        // Preparation Details
        preparationMethod: menuData.preparationMethod || "",
        difficulty: menuData.difficulty || "",
        availability: menuData.availability || "Available",
        cuisineType: menuData.cuisineType || "",
        tasteProfile: menuData.tasteProfile || "",
        texture: menuData.texture || "",
        cookingStyle: menuData.cookingStyle || "",

        // Nutritional Information
        nutritionalInfo: {
          protein: parseFloat(menuData.nutritionalInfo?.protein) || 0,
          carbs: parseFloat(menuData.nutritionalInfo?.carbs) || 0,
          fat: parseFloat(menuData.nutritionalInfo?.fat) || 0,
          fiber: parseFloat(menuData.nutritionalInfo?.fiber) || 0,
        },

        // Special Features (Boolean flags)
        chefSpecial: Boolean(menuData.chefSpecial),
        isPopular: Boolean(menuData.isPopular),
        isVegan: Boolean(menuData.isVegan),
        isGlutenFree: Boolean(menuData.isGlutenFree),
        isRecommended: Boolean(menuData.isRecommended),
        isSugarFree: Boolean(menuData.isSugarFree),
        isMostOrdered: Boolean(menuData.isMostOrdered),
        isSeasonal: Boolean(menuData.isSeasonal),
        isLimitedEdition: Boolean(menuData.isLimitedEdition),
        isOrganic: Boolean(menuData.isOrganic),
        isHighProtein: Boolean(menuData.isHighProtein),
        isLactoseFree: Boolean(menuData.isLactoseFree),
        isJainFriendly: Boolean(menuData.isJainFriendly),
        isKidsFriendly: Boolean(menuData.isKidsFriendly),
        isBeverageAlcoholic: Boolean(menuData.isBeverageAlcoholic),

        // Allergens (Array)
        allergens: Array.isArray(menuData.allergens) ? menuData.allergens : [],

        // System fields
        uuid: menuId,
        imageUrl: imageUrl,
        createdAt: menuData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Update in database
      await update(
        ref(db, `/hotels/${hotelName}/menu/${menuId}`),
        updatedMenuData
      );

      toast.success("Menu Updated Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });

      return true;
    } catch (error) {
      console.error("Error updating menu:", error);
      toast.error("Error updating menu. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Delete menu
  deleteMenu: async (menuId, hotelName) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this menu?"
      );

      if (confirmDelete) {
        await remove(ref(db, `/hotels/${hotelName}/menu/${menuId}`));
        toast.success("Menu Deleted Successfully!", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error deleting menu:", error);
      toast.error("Error deleting menu. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Filter and sort menus
  filterAndSortMenus: (menus, searchTerm, selectedCategory, sortOrder) => {
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
  },

  // Calculate menu counts by category
  calculateMenuCountsByCategory: (menus) => {
    const countsByCategory = {};
    menus.forEach((menu) => {
      const category = menu.menuCategory;
      countsByCategory[category] = (countsByCategory[category] || 0) + 1;
    });
    return countsByCategory;
  },
};
