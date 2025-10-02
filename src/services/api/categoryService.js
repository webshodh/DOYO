// firestoreCategoryService.js (CORRECTED VERSION)
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

const firestore = getFirestore();

export const categoryServices = {
  getCurrentAdminId: () => {
    const auth = getAuth();
    return auth.currentUser?.uid;
  },

  // Validate category name
  validateCategoryName: (categoryName) => {
    if (!categoryName || !categoryName.trim()) {
      return { isValid: false, error: "Category name cannot be empty" };
    }
    if (categoryName.trim().length < 2) {
      return {
        isValid: false,
        error: "Category name must be at least 2 characters long",
      };
    }
    if (categoryName.trim().length > 50) {
      return {
        isValid: false,
        error: "Category name must be less than 50 characters",
      };
    }
    const specialCharsRegex = /^[a-zA-Z0-9\s\-_&]+$/;
    if (!specialCharsRegex.test(categoryName.trim())) {
      return {
        isValid: false,
        error: "Category name contains invalid characters",
      };
    }
    return { isValid: true, error: null };
  },

  // Check for duplicate categories
  checkDuplicateCategory: (
    categories,
    categoryName,
    excludeCategoryId = null
  ) => {
    const normalizedCategoryName = categoryName.trim().toLowerCase();
    return categories.some(
      (category) =>
        category.categoryName.toLowerCase() === normalizedCategoryName &&
        (category.categoryId || category.id) !== excludeCategoryId
    );
  },

  // Validate category form
  validateCategoryForm: (
    categoryName,
    categories,
    excludeCategoryId = null
  ) => {
    const basicValidation = categoryServices.validateCategoryName(categoryName);
    if (!basicValidation.isValid) {
      toast.error(basicValidation.error, {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }

    if (
      categoryServices.checkDuplicateCategory(
        categories,
        categoryName,
        excludeCategoryId
      )
    ) {
      toast.error("Category already exists", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }

    return true;
  },

  // Sanitize category name
  sanitizeCategoryName: (categoryName) => {
    return categoryName.trim().replace(/\s+/g, " ");
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
            id: docSnap.id,
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
      console.log("Adding category:", { hotelName, categoryName });

      if (
        !categoryServices.validateCategoryForm(categoryName, existingCategories)
      )
        return false;

      const sanitizedName = categoryServices.sanitizeCategoryName(categoryName);
      const categoryId = uid();
      const categoryData = {
        categoryName: sanitizedName,
        createdAt: Timestamp.fromDate(new Date()),
        createdBy: categoryServices.getCurrentAdminId(),
        status: "active",
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
      console.log("Updating category:", {
        hotelName,
        categoryId,
        categoryName,
      });

      if (!categoryId) {
        console.error("Category ID is missing");
        toast.error("Category ID is missing", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return false;
      }

      if (
        !categoryServices.validateCategoryForm(
          categoryName,
          existingCategories,
          categoryId
        )
      )
        return false;

      const sanitizedName = categoryServices.sanitizeCategoryName(categoryName);
      const categoryDocRef = doc(
        firestore,
        `hotels/${hotelName}/categories/${categoryId}`
      );

      const categoryDoc = await getDoc(categoryDocRef);
      if (!categoryDoc.exists()) {
        console.error("Category document does not exist:", categoryId);
        toast.error("Category not found", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return false;
      }

      const updateData = {
        categoryName: sanitizedName,
        updatedAt: Timestamp.fromDate(new Date()),
        updatedBy: categoryServices.getCurrentAdminId(),
      };

      await updateDoc(categoryDocRef, updateData);

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
      console.log("Deleting category:", { hotelName, category });

      if (!category || (!category.categoryId && !category.id)) {
        console.error("Category or category ID is missing");
        toast.error("Category information is missing", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return false;
      }

      // Check if category is in use
      const isInUse = await categoryServices.checkCategoryUsage(
        hotelName,
        category.categoryName
      );

      if (isInUse) {
        const confirmDelete = window.confirm(
          "This category is being used by menu items. Deleting it may affect those items. Do you want to continue?"
        );
        if (!confirmDelete) return false;
      }

      const docId = category.categoryId || category.id;
      const categoryDocRef = doc(
        firestore,
        `hotels/${hotelName}/categories/${docId}`
      );

      const categoryDoc = await getDoc(categoryDocRef);
      if (!categoryDoc.exists()) {
        console.error("Category document does not exist:", docId);
        toast.error("Category not found", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return false;
      }

      await deleteDoc(categoryDocRef);

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
      console.log("Preparing category for edit:", category);

      if (!category.categoryId && !category.id) {
        console.error("Category is missing ID field");
        return null;
      }

      return {
        ...category,
        categoryId: category.categoryId || category.id,
        id: category.categoryId || category.id,
      };
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

  getCategories: async (hotelName) => {
    try {
      if (!hotelName) return [];

      const categoriesSnapshot = await getDocs(
        collection(firestore, `hotels/${hotelName}/categories`)
      );

      const categories = [];
      categoriesSnapshot.forEach((docSnap, index) => {
        categories.push({
          ...docSnap.data(),
          srNo: index + 1,
          categoryId: docSnap.id,
          id: docSnap.id,
        });
      });

      return categories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },
};
