// services/CategoryService.js
import { db } from "../data/firebase/firebaseConfig";
import { uid } from "uid";
import { set, ref, onValue, remove, update, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";

class CategoryService {
  constructor() {
    this.auth = getAuth();
  }

  // Get current admin ID
  getAdminID() {
    return this.auth.currentUser?.uid;
  }

  // Subscribe to categories changes
  subscribeToCategories(hotelName, callback) {
    const unsubscribe = onValue(
      ref(db, `/hotels/${hotelName}/categories/`),
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          callback(Object.values(data));
        } else {
          callback([]);
        }
      }
    );
    return unsubscribe;
  }

  // Check if admin has permission for the hotel
  async checkPermission(hotelName) {
    try {
      const adminID = this.getAdminID();
      if (!adminID) {
        throw new Error("Admin not authenticated");
      }

      const [adminHotelUuid, generalHotelUuid] = await Promise.all([
        get(ref(db, `admins/${adminID}/hotels/${hotelName}/uuid`)).then(
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
  }

  // Check if category name already exists
  isDuplicateCategory(categories, categoryName, excludeCategoryId = null) {
    const normalizedCategoryName = categoryName.trim().toLowerCase();
    return categories.some(
      (category) =>
        category.categoryName.toLowerCase() === normalizedCategoryName &&
        category.categoryId !== excludeCategoryId
    );
  }

  // Add new category
  async addCategory(hotelName, categoryName, categories) {
    if (!categoryName.trim()) {
      toast.error("Category name cannot be empty.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }

    if (this.isDuplicateCategory(categories, categoryName)) {
      toast.error("Category already exists.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }

    try {
      const hasPermission = await this.checkPermission(hotelName);
      if (!hasPermission) {
        toast.error(
          "You do not have permission to add categories for this hotel.",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        return false;
      }

      const categoryId = uid();
      await set(ref(db, `/hotels/${hotelName}/categories/${categoryId}`), {
        categoryName: categoryName.trim(),
        categoryId,
      });

      toast.success("Category Added Successfully!", {
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
  }

  // Update existing category
  async updateCategory(hotelName, categoryId, categoryName, categories) {
    if (!categoryName.trim()) {
      toast.error("Category name cannot be empty.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }

    if (this.isDuplicateCategory(categories, categoryName, categoryId)) {
      toast.error("Category already exists.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }

    try {
      const hasPermission = await this.checkPermission(hotelName);
      if (!hasPermission) {
        toast.error(
          "You do not have permission to update categories for this hotel.",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        return false;
      }

      if (!window.confirm("Confirm update")) {
        return false;
      }

      await update(ref(db, `/hotels/${hotelName}/categories/${categoryId}`), {
        categoryName: categoryName.trim(),
        categoryId,
      });

      toast.success("Category Updated Successfully!", {
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
  }

  // Delete category
  async deleteCategory(hotelName, category) {
    try {
      const hasPermission = await this.checkPermission(hotelName);
      if (!hasPermission) {
        toast.error(
          "You do not have permission to delete categories for this hotel.",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        return false;
      }

      if (!window.confirm("Confirm delete")) {
        return false;
      }

      await remove(
        ref(db, `/hotels/${hotelName}/categories/${category.categoryId}`)
      );

      toast.error("Category Deleted Successfully!", {
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
  }

  // Prepare category for editing
  async prepareEdit(hotelName, category) {
    try {
      const hasPermission = await this.checkPermission(hotelName);
      if (!hasPermission) {
        toast.error(
          "You do not have permission to update categories for this hotel.",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        return null;
      }
      return category;
    } catch (error) {
      console.error("Error preparing category update:", error);
      return null;
    }
  }

  // Filter categories based on search term
  filterCategories(categories, searchTerm) {
    return categories
      .filter((category) =>
        category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((category, index) => ({
        srNo: index + 1,
        ...category,
      }));
  }
}

// Create and export a singleton instance
const categoryService = new CategoryService();
export default categoryService;
