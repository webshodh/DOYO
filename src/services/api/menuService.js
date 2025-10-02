import {
  getFirestore,
  doc,
  collection,
  query,
  where,
  onSnapshot,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { storage } from "../firebase/firebaseConfig";
import { uid } from "uid";

const firestore = getFirestore();

export const menuServices = {
  // Get current admin ID
  getCurrentAdminId: () => {
    const auth = getAuth();
    return auth.currentUser?.uid;
  },

  // Validate menu form
  validateMenuForm: (menuData) => {
    const {
      menuName,
      menuPrice,
      menuCookingTime,
      menuCategory,
      categoryType,
      menuContent,
    } = menuData;

    if (!menuName?.trim()) {
      toast.error("Menu Name is required!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
    if (!menuPrice || menuPrice <= 0) {
      toast.error("Menu Price is required and must be greater than 0!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
    if (!menuCookingTime || menuCookingTime <= 0) {
      toast.error("Cooking Time is required and must be greater than 0!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
    if (!menuCategory) {
      toast.error("Menu Category is required!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
    if (!categoryType) {
      toast.error("Category Type is required!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
    if (!menuContent?.trim()) {
      toast.error("Menu Content is required!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
    return true;
  },

  // Calculate final price
  calculateFinalPrice: (price, discount = 0) => {
    const numPrice = parseFloat(price) || 0;
    const numDiscount = parseFloat(discount) || 0;
    if (numDiscount > 0) {
      return Math.round((numPrice * (100 - numDiscount)) / 100);
    }
    return numPrice;
  },

  // Upload menu image
  uploadMenuImage: async (file, hotelName) => {
    if (!file) return "";
    try {
      const fileName = `${uid()}-${file.name}`;
      const imageRef = storageRef(storage, `images/${hotelName}/${fileName}`);
      const snapshot = await uploadBytes(imageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  },

  // Delete menu image
  deleteMenuImage: async (imageUrl) => {
    if (!imageUrl) return;
    try {
      const imageRef = storageRef(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  },

  // Subscribe to menus (Real-time)
  subscribeToMenus: (hotelName, callback) => {
    if (!hotelName) {
      callback([]);
      return () => {};
    }
    const menusRef = collection(firestore, `hotels/${hotelName}/menu`);
    const q = query(menusRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const menusArray = [];
        querySnapshot.forEach((docSnap, index) => {
          menusArray.push({
            ...docSnap.data(),
            srNo: index + 1,
            id: docSnap.id,
            menuId: docSnap.id,
          });
        });
        callback(menusArray);
      },
      (error) => {
        console.error("Error fetching menus:", error);
        toast.error("Error loading menus", {
          position: toast.POSITION.TOP_RIGHT,
        });
        callback([]);
      }
    );

    return unsubscribe;
  },

  // Get single menu item by ID
  getMenuItemById: async (hotelName, menuId) => {
    try {
      if (!hotelName || !menuId) return null;
      const menuDoc = await getDoc(
        doc(firestore, `hotels/${hotelName}/menu/${menuId}`)
      );
      if (!menuDoc.exists()) {
        console.error("Menu item not found:", menuId);
        return null;
      }
      return { id: menuDoc.id, menuId: menuDoc.id, ...menuDoc.data() };
    } catch (error) {
      console.error("Error fetching menu item:", error);
      return null;
    }
  },

  // Get all menus
  getMenus: async (hotelName) => {
    try {
      if (!hotelName) return [];
      const menusSnapshot = await getDocs(
        collection(firestore, `hotels/${hotelName}/menu`)
      );
      const menus = [];
      menusSnapshot.forEach((docSnap, index) => {
        menus.push({
          ...docSnap.data(),
          srNo: index + 1,
          id: docSnap.id,
          menuId: docSnap.id,
        });
      });
      return menus;
    } catch (error) {
      console.error("Error fetching menus:", error);
      return [];
    }
  },

  // Add menu
  addMenu: async (menuData, hotelName) => {
    try {
      if (!menuServices.validateMenuForm(menuData)) return false;

      let imageUrl = "";
      if (menuData.file) {
        imageUrl = await menuServices.uploadMenuImage(menuData.file, hotelName);
      }

      const finalPrice = menuServices.calculateFinalPrice(
        menuData.menuPrice,
        menuData.discount
      );
      const menuId = uid();
      const currentAdminId = menuServices.getCurrentAdminId();

      const newMenuData = {
        menuName: menuData.menuName.trim(),
        menuContent: menuData.menuContent.trim(),
        ingredients: menuData.ingredients.trim(),
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
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        createdBy: currentAdminId,
      };

      await setDoc(
        doc(firestore, `hotels/${hotelName}/menu/${menuId}`),
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

  // Update menu
  updateMenu: async (menuData, menuId, hotelName) => {
    try {
      if (!menuServices.validateMenuForm(menuData)) return false;

      let imageUrl = menuData.existingImageUrl || menuData.imageUrl || "";
      if (menuData.file) {
        if (imageUrl) {
          await menuServices.deleteMenuImage(imageUrl);
        }
        imageUrl = await menuServices.uploadMenuImage(menuData.file, hotelName);
      }

      const finalPrice = menuServices.calculateFinalPrice(
        menuData.menuPrice,
        menuData.discount
      );
      const currentAdminId = menuServices.getCurrentAdminId();

      const updatedMenuData = {
        menuName: menuData.menuName.trim(),
        menuContent: menuData.menuContent.trim(),
        ingredients: menuData.ingredients.trim(),
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
        updatedBy: currentAdminId,
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

  // Delete menu
  deleteMenu: async (menuId, hotelName) => {
    try {
      // Delete image if exists
      const menuDoc = await getDoc(
        doc(firestore, `hotels/${hotelName}/menu/${menuId}`)
      );
      if (menuDoc.exists()) {
        const menuData = menuDoc.data();
        if (menuData.imageUrl) {
          await menuServices.deleteMenuImage(menuData.imageUrl);
        }
      }

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

  // Update menu availability
  updateMenuAvailability: async (menuId, availability, hotelName) => {
    try {
      await updateDoc(doc(firestore, `hotels/${hotelName}/menu/${menuId}`), {
        availability,
        updatedAt: Timestamp.fromDate(new Date()),
        updatedBy: menuServices.getCurrentAdminId(),
      });
      toast.success(`Menu ${availability.toLowerCase()} successfully!`, {
        position: toast.POSITION.TOP_RIGHT,
      });
      return true;
    } catch (error) {
      console.error("Error updating menu availability:", error);
      toast.error("Error updating menu availability.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Prepare menu for editing
  prepareForEdit: async (hotelName, menu) => {
    try {
      if (!menu.id && !menu.menuId) {
        console.error("Menu is missing ID field");
        return null;
      }
      return {
        ...menu,
        menuId: menu.menuId || menu.id,
        id: menu.menuId || menu.id,
      };
    } catch (error) {
      console.error("Error preparing menu for edit:", error);
      toast.error("Error preparing menu for editing", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return null;
    }
  },

  // Filter and sort menus
  filterAndSortMenus: (menus, searchTerm, selectedCategory, sortOrder) => {
    let filteredItems = menus.filter(
      (menu) =>
        typeof menu.menuName === "string" &&
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
    } else if (sortOrder === "newest") {
      filteredItems.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (sortOrder === "oldest") {
      filteredItems.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    }

    return filteredItems;
  },

  // Calculate menu counts by category
  calculateMenuCountsByCategory: (menus) => {
    const countsByCategory = {};
    menus.forEach((menu) => {
      const category = menu.menuCategory || "Other";
      countsByCategory[category] = (countsByCategory[category] || 0) + 1;
    });
    return countsByCategory;
  },

  // Get menu statistics
  getMenuStats: async (hotelName) => {
    try {
      const menusSnapshot = await getDocs(
        collection(firestore, `hotels/${hotelName}/menu`)
      );

      const menus = [];
      menusSnapshot.forEach((docSnap) => {
        menus.push(docSnap.data());
      });

      const totalMenus = menus.length;
      const availableMenus = menus.filter(
        (m) => m.availability === "Available"
      ).length;
      const unavailableMenus = menus.filter(
        (m) => m.availability === "Unavailable"
      ).length;
      const discountedMenus = menus.filter((m) => m.discount > 0).length;
      const popularMenus = menus.filter((m) => m.isPopular).length;
      const chefSpecialMenus = menus.filter((m) => m.chefSpecial).length;

      return {
        totalMenus,
        availableMenus,
        unavailableMenus,
        discountedMenus,
        popularMenus,
        chefSpecialMenus,
        categoryBreakdown: menuServices.calculateMenuCountsByCategory(menus),
      };
    } catch (error) {
      console.error("Error getting menu stats:", error);
      return null;
    }
  },
};
