// src/services/categoryService.js
import { db } from "../firebase/firebaseConfig";
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
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import {
  validateCategoryForm,
  sanitizeCategoryName,
} from "../../validation/categoryValidation";

export const categoryServices = {
  // Get current admin ID (unchanged)
  getCurrentAdminId: () => {
    const auth = getAuth();
    return auth.currentUser?.uid;
  },

  // ✅ FIRESTORE: Check if admin has permission for the hotel
  checkAdminPermission: async (hotelName) => {
    try {
      const adminId = categoryServices.getCurrentAdminId();
      if (!adminId) {
        throw new Error("Admin not authenticated");
      }

      // ✅ FIRESTORE: Get admin and hotel documents
      const [adminDoc, hotelDoc] = await Promise.all([
        getDoc(doc(db, `admins/${adminId}`)),
        getDoc(doc(db, `hotels/${hotelName}`)),
      ]);

      const adminData = adminDoc.exists() ? adminDoc.data() : null;
      const hotelData = hotelDoc.exists() ? hotelDoc.data() : null;

      return adminData?.hotels?.[hotelName]?.uuid === hotelData?.uuid;
    } catch (error) {
      console.error("Error checking permission:", error);
      return false;
    }
  },

  // ✅ FIRESTORE: Subscribe to categories changes with real-time updates
  subscribeToCategories: (hotelName, callback) => {
    if (!hotelName) {
      callback([]);
      return () => {};
    }

    const categoriesRef = collection(db, `hotels/${hotelName}/categories`);
    const q = query(categoriesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const categoriesArray = snapshot.docs.map((doc, index) => ({
          id: doc.id,
          ...doc.data(),
          srNo: index + 1,
        }));
        callback(categoriesArray);
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

  // ✅ FIRESTORE: Add new category
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: categoryServices.getCurrentAdminId(),
      };

      // ✅ FIRESTORE: Save to database
      await setDoc(
        doc(db, `hotels/${hotelName}/categories/${categoryId}`),
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

  // ✅ FIRESTORE: Update existing category
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
        updatedAt: serverTimestamp(),
        updatedBy: categoryServices.getCurrentAdminId(),
      };

      // ✅ FIRESTORE: Update in database
      await updateDoc(
        doc(db, `hotels/${hotelName}/categories/${categoryId}`),
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

  // ✅ FIRESTORE: Delete category
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

      // ✅ FIRESTORE: Delete from database
      await deleteDoc(
        doc(db, `hotels/${hotelName}/categories/${category.categoryId}`)
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

  // ✅ FIRESTORE: Check if category is being used by menus (optional utility)
  checkCategoryUsage: async (hotelName, categoryName) => {
    try {
      const menuSnapshot = await getDocs(
        collection(db, `hotels/${hotelName}/menu`)
      );

      if (!menuSnapshot.empty) {
        const menus = menuSnapshot.docs.map((doc) => doc.data());
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

  // Prepare category for editing (with permission check) - unchanged
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

  // Filter categories based on search term (unchanged - client-side filtering)
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

  // ✅ FIRESTORE: Get category statistics (optional utility)
  getCategoryStats: async (hotelName) => {
    try {
      const [categorySnapshot, menuSnapshot] = await Promise.all([
        getDocs(collection(db, `hotels/${hotelName}/categories`)),
        getDocs(collection(db, `hotels/${hotelName}/menu`)),
      ]);

      const totalCategories = categorySnapshot.size;

      let categoryUsage = {};
      if (!menuSnapshot.empty) {
        const menus = menuSnapshot.docs.map((doc) => doc.data());
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

  // ✅ FIRESTORE: Get all categories (helper function)
  getAllCategories: async (hotelName) => {
    try {
      if (!hotelName) return [];

      const categoriesRef = collection(db, `hotels/${hotelName}/categories`);
      const q = query(categoriesRef, orderBy("categoryName", "asc"));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        srNo: index + 1,
      }));
    } catch (error) {
      console.error("Error fetching all categories:", error);
      return [];
    }
  },

  // ✅ FIRESTORE: Get category by ID (helper function)
  getCategoryById: async (hotelName, categoryId) => {
    try {
      if (!hotelName || !categoryId) return null;

      const categoryDoc = await getDoc(
        doc(db, `hotels/${hotelName}/categories/${categoryId}`)
      );

      if (categoryDoc.exists()) {
        return {
          id: categoryDoc.id,
          ...categoryDoc.data(),
        };
      }

      return null;
    } catch (error) {
      console.error("Error fetching category by ID:", error);
      return null;
    }
  },

  // ✅ FIRESTORE: Toggle category status (if you have status field)
  toggleCategoryStatus: async (hotelName, categoryId, currentStatus) => {
    try {
      const hasPermission = await categoryServices.checkAdminPermission(
        hotelName
      );
      if (!hasPermission) {
        toast.error("You do not have permission to modify category status", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return false;
      }

      const newStatus = currentStatus === "active" ? "inactive" : "active";

      await updateDoc(doc(db, `hotels/${hotelName}/categories/${categoryId}`), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        updatedBy: categoryServices.getCurrentAdminId(),
      });

      toast.success(`Category status changed to ${newStatus}`, {
        position: toast.POSITION.TOP_RIGHT,
      });

      return true;
    } catch (error) {
      console.error("Error toggling category status:", error);
      toast.error("Error updating category status", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },
};

// Default export for backward compatibility
export default categoryServices;
