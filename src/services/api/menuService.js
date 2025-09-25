// firestoreMenuService.js
import {
  getFirestore,
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { toast } from "react-toastify";
import { storage } from "../firebase/firebaseConfig";
import { uid } from "uid";
import {
  validateMenuForm,
  calculateFinalPrice,
} from "../../validation/menuValidation";

const firestore = getFirestore();

export const menuServices = {
  checkUserPermission: async (currentAdminId, hotelName) => {
    try {
      const adminHotelDoc = await getDoc(
        doc(firestore, `admins/${currentAdminId}/hotels/${hotelName}`)
      );
      const hotelDoc = await getDoc(doc(firestore, `hotels/${hotelName}`));

      const adminHotelUuid = adminHotelDoc.exists()
        ? adminHotelDoc.data().uuid
        : null;
      const generalHotelUuid = hotelDoc.exists() ? hotelDoc.data().uuid : null;

      return adminHotelUuid === generalHotelUuid;
    } catch (error) {
      console.error("Error checking permissions:", error);
      return false;
    }
  },

  uploadMenuImage: async (file, hotelName) => {
    if (!file) return "";

    try {
      const imageRef = storageRef(storage, `images/${hotelName}/${file.name}`);
      const snapshot = await uploadBytes(imageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  },

  addMenu: async (menuData, hotelName, currentAdminId) => {
    try {
      if (!validateMenuForm(menuData)) return false;

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

      let imageUrl = "";
      if (menuData.file) {
        imageUrl = await menuServices.uploadMenuImage(menuData.file, hotelName);
      }

      const finalPrice = calculateFinalPrice(
        menuData.menuPrice,
        menuData.discount
      );
      const newMenuData = {
        menuName: menuData.menuName?.trim() || "",
        menuContent: menuData.menuContent?.trim() || "",
        ingredients: menuData.ingredients?.trim() || "",
        menuCookingTime: parseInt(menuData.menuCookingTime) || 0,
        servingSize: parseInt(menuData.servingSize) || 1,
        menuPrice: parseFloat(menuData.menuPrice) || 0,
        discount: parseFloat(menuData.discount) || 0,
        finalPrice,
        calories: parseInt(menuData.calories) || 0,
        mainCategory: menuData.mainCategory || "",
        menuCategory: menuData.menuCategory || "",
        categoryType: menuData.categoryType || "",
        mealType: menuData.mealType || "",
        spiceLevel: menuData.spiceLevel || "",
        portionSize: menuData.portionSize || "",
        preparationMethod: menuData.preparationMethod || "",
        difficulty: menuData.difficulty || "",
        availability: menuData.availability || "Available",
        cuisineType: menuData.cuisineType || "",
        tasteProfile: menuData.tasteProfile || "",
        texture: menuData.texture || "",
        cookingStyle: menuData.cookingStyle || "",
        nutritionalInfo: {
          protein: parseFloat(menuData.nutritionalInfo?.protein) || 0,
          carbs: parseFloat(menuData.nutritionalInfo?.carbs) || 0,
          fat: parseFloat(menuData.nutritionalInfo?.fat) || 0,
          fiber: parseFloat(menuData.nutritionalInfo?.fiber) || 0,
        },
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
        allergens: Array.isArray(menuData.allergens) ? menuData.allergens : [],
        uuid: uid(),
        imageUrl,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      };

      await setDoc(
        doc(firestore, `hotels/${hotelName}/menu/${newMenuData.uuid}`),
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

  updateMenu: async (menuData, menuId, hotelName, currentAdminId) => {
    try {
      if (!validateMenuForm(menuData)) return false;

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

      let imageUrl = menuData.existingImageUrl || menuData.imageUrl || "";
      if (menuData.file) {
        imageUrl = await menuServices.uploadMenuImage(menuData.file, hotelName);
      }

      const finalPrice = calculateFinalPrice(
        menuData.menuPrice,
        menuData.discount
      );

      const updatedMenuData = {
        menuName: menuData.menuName?.trim() || "",
        menuContent: menuData.menuContent?.trim() || "",
        ingredients: menuData.ingredients?.trim() || "",
        menuCookingTime: parseInt(menuData.menuCookingTime) || 0,
        servingSize: parseInt(menuData.servingSize) || 1,
        menuPrice: parseFloat(menuData.menuPrice) || 0,
        discount: parseFloat(menuData.discount) || 0,
        finalPrice,
        calories: parseInt(menuData.calories) || 0,
        mainCategory: menuData.mainCategory || "",
        menuCategory: menuData.menuCategory || "",
        categoryType: menuData.categoryType || "",
        mealType: menuData.mealType || "",
        spiceLevel: menuData.spiceLevel || "",
        portionSize: menuData.portionSize || "",
        preparationMethod: menuData.preparationMethod || "",
        difficulty: menuData.difficulty || "",
        availability: menuData.availability || "Available",
        cuisineType: menuData.cuisineType || "",
        tasteProfile: menuData.tasteProfile || "",
        texture: menuData.texture || "",
        cookingStyle: menuData.cookingStyle || "",
        nutritionalInfo: {
          protein: parseFloat(menuData.nutritionalInfo?.protein) || 0,
          carbs: parseFloat(menuData.nutritionalInfo?.carbs) || 0,
          fat: parseFloat(menuData.nutritionalInfo?.fat) || 0,
          fiber: parseFloat(menuData.nutritionalInfo?.fiber) || 0,
        },
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
        allergens: Array.isArray(menuData.allergens) ? menuData.allergens : [],
        uuid: menuId,
        imageUrl,
        createdAt: menuData.createdAt || Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      };

      await updateDoc(
        doc(firestore, `hotels/${hotelName}/menu/${menuId}`),
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

  deleteMenu: async (menuId, hotelName) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this menu?"
      );
      if (!confirmDelete) return false;

      await deleteDoc(doc(firestore, `hotels/${hotelName}/menu/${menuId}`));

      toast.success("Menu Deleted Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return true;
    } catch (error) {
      console.error("Error deleting menu:", error);
      toast.error("Error deleting menu. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

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

  calculateMenuCountsByCategory: (menus) => {
    const countsByCategory = {};
    menus.forEach((menu) => {
      const category = menu.menuCategory;
      countsByCategory[category] = (countsByCategory[category] || 0) + 1;
    });
    return countsByCategory;
  },
};
