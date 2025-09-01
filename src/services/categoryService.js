import { db } from "../data/firebase/firebaseConfig";
import { uid } from "uid";
import { set, ref, onValue, remove, update, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import {
  validateCategoryForm,
  sanitizeCategoryName,
} from "../Validation/categoryValidation";

export const categoryServices = {
  // Get current admin ID
  getCurrentAdminId: () => {
    const auth = getAuth();
    return auth.currentUser?.uid;
  },

  // Check if admin has permission for the hotel
  checkAdminPermission: async (hotelName) => {
    try {
      const adminId = categoryServices.getCurrentAdminId();
      if (!adminId) {
        throw new Error("Admin not authenticated");
      }

      const [adminHotelUuid, generalHotelUuid] = await Promise.all([
        get(ref(db, `admins/${adminId}/hotels/${hotelName}/uuid`)).then(
          (snapshot) => snapshot.val()
        ),
        get(ref(db, `hotels/${hotelName}/uuid`)).then((snapshot) =>
          snapshot.val()
        ),
      ]);

      return adminHotelUuid === generalHotelUuid;
    } catch (error) {
      console.error("Error checking permission:", error);
      return false;
    }
  },

  // Subscribe to categories changes with real-time updates
  subscribeToCategories: (hotelName, callback) => {
    if (!hotelName) {
      callback([]);
      return () => {};
    }

    const unsubscribe = onValue(
      ref(db, `/hotels/${hotelName}/categories/`),
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const categoriesArray = Object.values(data).map(
            (category, index) => ({
              ...category,
              srNo: index + 1,
            })
          );
          callback(categoriesArray);
        } else {
          callback([]);
        }
      },
      (error) => {
        console.error("Error fetching categories:", error);
        toast.error("Error loading categories", {
          position: toast.POSITION.TOP_RIGHT,
        });
        callback([]);
      }
    );

    return unsubscribe;
  },

  // Add new category
  addCategory: async (hotelName, categoryName, existingCategories = []) => {
    try {
      // Validate category name and check for duplicates
      if (!validateCategoryForm(categoryName, existingCategories)) {
        return false;
      }

      // Check permissions
      const hasPermission = await categoryServices.checkAdminPermission(
        hotelName
      );
      if (!hasPermission) {
        toast.error(
          "You do not have permission to add categories for this hotel",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        return false;
      }

      // Sanitize and prepare category data
      const sanitizedName = sanitizeCategoryName(categoryName);
      const categoryId = uid();
      const categoryData = {
        categoryName: sanitizedName,
        categoryId,
        createdAt: new Date().toISOString(),
        createdBy: categoryServices.getCurrentAdminId(),
      };

      // Save to database
      await set(
        ref(db, `/hotels/${hotelName}/categories/${categoryId}`),
        categoryData
      );

      toast.success("Category added successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });

      return true;
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Error adding category. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Update existing category
  updateCategory: async (
    hotelName,
    categoryId,
    categoryName,
    existingCategories = []
  ) => {
    try {
      // Validate category name and check for duplicates (excluding current category)
      if (!validateCategoryForm(categoryName, existingCategories, categoryId)) {
        return false;
      }

      // Check permissions
      const hasPermission = await categoryServices.checkAdminPermission(
        hotelName
      );
      if (!hasPermission) {
        toast.error(
          "You do not have permission to update categories for this hotel",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        return false;
      }

      // Confirm update
      const confirmUpdate = window.confirm(
        "Are you sure you want to update this category?"
      );
      if (!confirmUpdate) {
        return false;
      }

      // Sanitize and prepare updated data
      const sanitizedName = sanitizeCategoryName(categoryName);
      const updateData = {
        categoryName: sanitizedName,
        categoryId,
        updatedAt: new Date().toISOString(),
        updatedBy: categoryServices.getCurrentAdminId(),
      };

      // Update in database
      await update(
        ref(db, `/hotels/${hotelName}/categories/${categoryId}`),
        updateData
      );

      toast.success("Category updated successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });

      return true;
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Error updating category. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Delete category
  deleteCategory: async (hotelName, category) => {
    try {
      // Check permissions
      const hasPermission = await categoryServices.checkAdminPermission(
        hotelName
      );
      if (!hasPermission) {
        toast.error(
          "You do not have permission to delete categories for this hotel",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        return false;
      }

      // Confirm deletion
      const confirmDelete = window.confirm(
        `Are you sure you want to delete the category "${category.categoryName}"? This action cannot be undone.`
      );
      if (!confirmDelete) {
        return false;
      }

      // Check if category is being used by any menus (optional check)
      const isInUse = await categoryServices.checkCategoryUsage(
        hotelName,
        category.categoryName
      );
      if (isInUse) {
        const forceDelete = window.confirm(
          "This category is being used by some menu items. Deleting it may affect those items. Do you still want to continue?"
        );
        if (!forceDelete) {
          return false;
        }
      }

      // Delete from database
      await remove(
        ref(db, `/hotels/${hotelName}/categories/${category.categoryId}`)
      );

      toast.success("Category deleted successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });

      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Error deleting category. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Check if category is being used by menus (optional utility)
  checkCategoryUsage: async (hotelName, categoryName) => {
    try {
      const menuSnapshot = await get(ref(db, `/hotels/${hotelName}/menu`));
      if (menuSnapshot.exists()) {
        const menus = Object.values(menuSnapshot.val());
        return menus.some(
          (menu) =>
            menu.menuCategory === categoryName ||
            menu.mainCategory === categoryName
        );
      }
      return false;
    } catch (error) {
      console.error("Error checking category usage:", error);
      return false;
    }
  },

  // Prepare category for editing (with permission check)
  prepareForEdit: async (hotelName, category) => {
    try {
      const hasPermission = await categoryServices.checkAdminPermission(
        hotelName
      );
      if (!hasPermission) {
        toast.error(
          "You do not have permission to edit categories for this hotel",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        return null;
      }
      return category;
    } catch (error) {
      console.error("Error preparing category for edit:", error);
      toast.error("Error preparing category for editing", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return null;
    }
  },

  // Filter categories based on search term
  filterCategories: (categories, searchTerm) => {
    if (!searchTerm.trim()) {
      return categories.map((category, index) => ({
        ...category,
        srNo: index + 1,
      }));
    }

    return categories
      .filter((category) =>
        category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((category, index) => ({
        ...category,
        srNo: index + 1,
      }));
  },

  // Get category statistics (optional utility)
  getCategoryStats: async (hotelName) => {
    try {
      const [categorySnapshot, menuSnapshot] = await Promise.all([
        get(ref(db, `/hotels/${hotelName}/categories`)),
        get(ref(db, `/hotels/${hotelName}/menu`)),
      ]);

      const totalCategories = categorySnapshot.exists()
        ? Object.keys(categorySnapshot.val()).length
        : 0;

      let categoryUsage = {};
      if (menuSnapshot.exists()) {
        const menus = Object.values(menuSnapshot.val());
        menus.forEach((menu) => {
          if (menu.menuCategory) {
            categoryUsage[menu.menuCategory] =
              (categoryUsage[menu.menuCategory] || 0) + 1;
          }
        });
      }

      return {
        totalCategories,
        categoryUsage,
        unusedCategories: totalCategories - Object.keys(categoryUsage).length,
      };
    } catch (error) {
      console.error("Error getting category stats:", error);
      return null;
    }
  },
};
