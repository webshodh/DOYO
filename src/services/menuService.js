import { db, storage } from "../data/firebase/firebaseConfig";
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
} from "../Validation/menuValidation";

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

      // Prepare menu data
      const newMenuData = {
        menuName: menuData.menuName.trim(),
        menuCookingTime: menuData.menuCookingTime,
        menuPrice: menuData.menuPrice,
        discount: menuData.discount || "0",
        finalPrice: finalPrice,
        menuCategory: menuData.menuCategory,
        menuContent: menuData.menuContent.trim(),
        availability: menuData.availability,
        mainCategory: menuData.mainCategory,
        categoryType: menuData.categoryType,
        servingSize: menuData.servingSize,
        spiceLevel: menuData.spiceLevel,
        calories: menuData.calories,
        preparationMethod: menuData.preparationMethod,
        chefSpecial: menuData.chefSpecial,
        isVegan: menuData.isVegan,
        isGlutenFree: menuData.isGlutenFree,
        ingredients: menuData.ingredients,
        portionSize: menuData.portionSize,
        mealType: menuData.mealType,
        difficulty: menuData.difficulty,
        isPopular: menuData.isPopular,
        uuid: uid(),
        imageUrl: imageUrl,
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
      let imageUrl = menuData.existingImageUrl || "";
      if (menuData.file) {
        imageUrl = await menuServices.uploadMenuImage(menuData.file, hotelName);
      }

      // Calculate final price
      const finalPrice = calculateFinalPrice(
        menuData.menuPrice,
        menuData.discount
      );

      // Prepare updated menu data
      const updatedMenuData = {
        menuName: menuData.menuName.trim(),
        menuCookingTime: menuData.menuCookingTime,
        menuPrice: menuData.menuPrice,
        discount: menuData.discount || "0",
        finalPrice: finalPrice,
        menuCategory: menuData.menuCategory,
        menuContent: menuData.menuContent.trim(),
        availability: menuData.availability,
        mainCategory: menuData.mainCategory,
        categoryType: menuData.categoryType,
        servingSize: menuData.servingSize,
        spiceLevel: menuData.spiceLevel,
        calories: menuData.calories,
        preparationMethod: menuData.preparationMethod,
        chefSpecial: menuData.chefSpecial,
        isVegan: menuData.isVegan,
        isGlutenFree: menuData.isGlutenFree,
        ingredients: menuData.ingredients,
        portionSize: menuData.portionSize,
        mealType: menuData.mealType,
        difficulty: menuData.difficulty,
        isPopular: menuData.isPopular,
        uuid: menuId,
        imageUrl: imageUrl,

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
