// src/services/menuService.js
import { db, storage } from "../firebase/firebaseConfig";
import { uid } from "uid";
// ✅ FIRESTORE IMPORTS (replacing Realtime Database)
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
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
  // ✅ FIRESTORE: Check if user has permission to manage hotel menus
  checkUserPermission: async (currentAdminId, hotelName) => {
    try {
      // Get admin and hotel documents
      const [adminDoc, hotelDoc] = await Promise.all([
        getDoc(doc(db, `admins/${currentAdminId}`)),
        getDoc(doc(db, `hotels/${hotelName}/info`)),
      ]);

      if (!adminDoc.exists() || !hotelDoc.exists()) {
        return false;
      }

      const adminData = adminDoc.data();
      const hotelData = hotelDoc.data();

      // Check if admin has this hotel assigned
      const adminHotelUuid = adminData.hotels?.[hotelName]?.hotelUuid;
      const generalHotelUuid = hotelData.uuid;

      return adminHotelUuid === generalHotelUuid;
    } catch (error) {
      console.error("Error checking permissions:", error);
      return false;
    }
  },

  // Upload image to Firebase Storage (unchanged - uses Storage)
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

  // ✅ FIRESTORE: Add new menu to database
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

        // Special categories for easier filtering
        isVeg: Boolean(menuData.isVeg),
        isNonVeg: Boolean(menuData.isNonVeg),
        isSpicy: Boolean(menuData.isSpicy),
        isNew: Boolean(menuData.isNew),
        isHealthy: Boolean(menuData.isHealthy),
        isJainFood: Boolean(menuData.isJainFood),

        // Allergens (Array)
        allergens: Array.isArray(menuData.allergens) ? menuData.allergens : [],

        // System fields
        uuid: uid(),
        imageUrl: imageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentAdminId,
        hotelName: hotelName,
      };

      // ✅ FIRESTORE: Save to database
      await setDoc(
        doc(db, `hotels/${hotelName}/menu/${newMenuData.uuid}`),
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

  // ✅ FIRESTORE: Update existing menu
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

      // Get existing menu data to preserve createdAt
      const existingMenuDoc = await getDoc(
        doc(db, `hotels/${hotelName}/menu/${menuId}`)
      );
      const existingData = existingMenuDoc.exists()
        ? existingMenuDoc.data()
        : {};

      // Upload new image if provided
      let imageUrl =
        menuData.existingImageUrl ||
        menuData.imageUrl ||
        existingData.imageUrl ||
        "";
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

        // Special categories for easier filtering
        isVeg: Boolean(menuData.isVeg),
        isNonVeg: Boolean(menuData.isNonVeg),
        isSpicy: Boolean(menuData.isSpicy),
        isNew: Boolean(menuData.isNew),
        isHealthy: Boolean(menuData.isHealthy),
        isJainFood: Boolean(menuData.isJainFood),

        // Allergens (Array)
        allergens: Array.isArray(menuData.allergens) ? menuData.allergens : [],

        // System fields
        uuid: menuId,
        imageUrl: imageUrl,
        createdAt: existingData.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
        updatedBy: currentAdminId,
        hotelName: hotelName,
      };

      // ✅ FIRESTORE: Update in database
      await updateDoc(
        doc(db, `hotels/${hotelName}/menu/${menuId}`),
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

  // ✅ FIRESTORE: Delete menu
  deleteMenu: async (menuId, hotelName) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this menu?"
      );

      if (confirmDelete) {
        await deleteDoc(doc(db, `hotels/${hotelName}/menu/${menuId}`));
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

  // Filter and sort menus (unchanged - client-side filtering)
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

  // Calculate menu counts by category (unchanged - client-side calculation)
  calculateMenuCountsByCategory: (menus) => {
    const countsByCategory = {};
    menus.forEach((menu) => {
      const category = menu.menuCategory;
      countsByCategory[category] = (countsByCategory[category] || 0) + 1;
    });
    return countsByCategory;
  },

  // ✅ FIRESTORE: Get all menus for a hotel
  getAllMenus: async (hotelName) => {
    try {
      const menuSnapshot = await getDocs(
        collection(db, `hotels/${hotelName}/menu`)
      );

      if (!menuSnapshot.empty) {
        return menuSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      return [];
    } catch (error) {
      console.error("Error fetching menus:", error);
      return [];
    }
  },

  // ✅ FIRESTORE: Get menu by ID
  getMenuById: async (hotelName, menuId) => {
    try {
      const menuDoc = await getDoc(
        doc(db, `hotels/${hotelName}/menu/${menuId}`)
      );

      if (menuDoc.exists()) {
        return {
          id: menuDoc.id,
          ...menuDoc.data(),
        };
      }

      return null;
    } catch (error) {
      console.error("Error fetching menu by ID:", error);
      return null;
    }
  },

  // ✅ FIRESTORE: Get menus by category
  getMenusByCategory: async (hotelName, categoryName) => {
    try {
      const menuQuery = query(
        collection(db, `hotels/${hotelName}/menu`),
        where("menuCategory", "==", categoryName)
      );
      const menuSnapshot = await getDocs(menuQuery);

      return menuSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching menus by category:", error);
      return [];
    }
  },

  // ✅ FIRESTORE: Toggle menu availability
  toggleMenuAvailability: async (menuId, hotelName, currentAvailability) => {
    try {
      const newAvailability =
        currentAvailability === "Available" ? "Unavailable" : "Available";

      await updateDoc(doc(db, `hotels/${hotelName}/menu/${menuId}`), {
        availability: newAvailability,
        updatedAt: serverTimestamp(),
      });

      toast.success(`Menu availability changed to ${newAvailability}`, {
        position: toast.POSITION.TOP_RIGHT,
      });

      return true;
    } catch (error) {
      console.error("Error toggling menu availability:", error);
      toast.error("Error updating menu availability", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // ✅ FIRESTORE: Get menu statistics
  getMenuStats: async (hotelName) => {
    try {
      const menuSnapshot = await getDocs(
        collection(db, `hotels/${hotelName}/menu`)
      );

      if (menuSnapshot.empty) {
        return {
          totalMenus: 0,
          availableMenus: 0,
          unavailableMenus: 0,
          categoryCounts: {},
        };
      }

      const menus = menuSnapshot.docs.map((doc) => doc.data());
      const categoryCounts = {};

      menus.forEach((menu) => {
        if (menu.menuCategory) {
          categoryCounts[menu.menuCategory] =
            (categoryCounts[menu.menuCategory] || 0) + 1;
        }
      });

      return {
        totalMenus: menus.length,
        availableMenus: menus.filter((m) => m.availability === "Available")
          .length,
        unavailableMenus: menus.filter((m) => m.availability === "Unavailable")
          .length,
        categoryCounts,
      };
    } catch (error) {
      console.error("Error getting menu stats:", error);
      return null;
    }
  },
};

// Default export for backward compatibility
export default menuServices;
