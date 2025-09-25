// firestoreCategoryService.js
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
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { uid } from "uid";
import {
  validateCategoryForm,
  sanitizeCategoryName,
} from "../../validation/categoryValidation";

const firestore = getFirestore();

export const categoryServices = {
  getCurrentAdminId: () => {
    const auth = getAuth();
    return auth.currentUser?.uid;
  },

  checkAdminPermission: async (hotelName) => {
    try {
      const adminId = categoryServices.getCurrentAdminId();
      if (!adminId) throw new Error("Admin not authenticated");

      const adminHotelDoc = await getDoc(
        doc(firestore, `admins/${adminId}/hotels/${hotelName}`)
      );
      const generalHotelDoc = await getDoc(
        doc(firestore, `hotels/${hotelName}`)
      );

      const adminHotelUuid = adminHotelDoc.exists()
        ? adminHotelDoc.data().uuid
        : null;
      const generalHotelUuid = generalHotelDoc.exists()
        ? generalHotelDoc.data().uuid
        : null;

      return adminHotelUuid === generalHotelUuid;
    } catch (error) {
      console.error("Error checking permission:", error);
      return false;
    }
  },

  subscribeToCategories: (hotelName, callback) => {
    if (!hotelName) {
      callback([]);
      return () => {};
    }

    const categoriesRef = collection(
      firestore,
      `hotels/${hotelName}/categories`
    );
    const unsubscribe = onSnapshot(
      categoriesRef,
      (querySnapshot) => {
        const categoriesArray = [];
        querySnapshot.forEach((docSnap, index) => {
          categoriesArray.push({
            ...docSnap.data(),
            srNo: index + 1,
            categoryId: docSnap.id,
          });
        });
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

  addCategory: async (hotelName, categoryName, existingCategories = []) => {
    try {
      if (!validateCategoryForm(categoryName, existingCategories)) return false;

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

      const sanitizedName = sanitizeCategoryName(categoryName);
      const categoryId = uid();
      const categoryData = {
        categoryName: sanitizedName,
        createdAt: Timestamp.fromDate(new Date()),
        createdBy: categoryServices.getCurrentAdminId(),
      };

      await setDoc(
        doc(firestore, `hotels/${hotelName}/categories/${categoryId}`),
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

  updateCategory: async (
    hotelName,
    categoryId,
    categoryName,
    existingCategories = []
  ) => {
    try {
      if (!validateCategoryForm(categoryName, existingCategories, categoryId))
        return false;

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

      if (!window.confirm("Are you sure you want to update this category?"))
        return false;

      const sanitizedName = sanitizeCategoryName(categoryName);
      const updateData = {
        categoryName: sanitizedName,
        updatedAt: Timestamp.fromDate(new Date()),
        updatedBy: categoryServices.getCurrentAdminId(),
      };

      await updateDoc(
        doc(firestore, `hotels/${hotelName}/categories/${categoryId}`),
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

  deleteCategory: async (hotelName, category) => {
    try {
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

      if (
        !window.confirm(
          `Are you sure you want to delete the category "${category.categoryName}"? This action cannot be undone.`
        )
      )
        return false;

      const isInUse = await categoryServices.checkCategoryUsage(
        hotelName,
        category.categoryName
      );
      if (isInUse) {
        const forceDelete = window.confirm(
          "This category is being used by some menu items. Deleting it may affect those items. Do you still want to continue?"
        );
        if (!forceDelete) return false;
      }

      await deleteDoc(
        doc(firestore, `hotels/${hotelName}/categories/${category.categoryId}`)
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

  checkCategoryUsage: async (hotelName, categoryName) => {
    try {
      const menuRef = collection(firestore, `hotels/${hotelName}/menu`);
      const snapshot = await getDocs(
        query(menuRef, where("menuCategory", "==", categoryName))
      );

      return !snapshot.empty;
    } catch (error) {
      console.error("Error checking category usage:", error);
      return false;
    }
  },

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

  getCategoryStats: async (hotelName) => {
    try {
      const categorySnapshot = await getDocs(
        collection(firestore, `hotels/${hotelName}/categories`)
      );
      const menuSnapshot = await getDocs(
        collection(firestore, `hotels/${hotelName}/menu`)
      );

      const totalCategories = categorySnapshot.size;
      const categoryUsage = {};

      menuSnapshot.forEach((docSnap) => {
        const menu = docSnap.data();
        if (menu.menuCategory) {
          categoryUsage[menu.menuCategory] =
            (categoryUsage[menu.menuCategory] || 0) + 1;
        }
      });

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
