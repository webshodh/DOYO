// services/categoryService.js
import { db } from "../data/firebase/firebaseConfig";
import { uid } from "uid";
import { set, ref, onValue, remove, update, get } from "firebase/database";

export class CategoryService {
  constructor(hotelName) {
    this.hotelName = hotelName;
    this.basePath = `/hotels/${hotelName}/Maincategories`;
  }

  // Check if admin has permission for this hotel
  async checkAdminPermission(adminId) {
    try {
      const adminUuidSnapshot = await get(
        ref(db, `admins/${adminId}/hotels/${this.hotelName}/uuid`)
      );
      const generalUuidSnapshot = await get(
        ref(db, `hotels/${this.hotelName}/uuid`)
      );
      
      const adminHotelUuid = adminUuidSnapshot.val();
      const generalHotelUuid = generalUuidSnapshot.val();
      
      return adminHotelUuid === generalHotelUuid;
    } catch (error) {
      console.error("Error checking admin permission:", error);
      return false;
    }
  }

  // Check if category name already exists
  async checkCategoryExists(categoryName, excludeId = null) {
    try {
      const snapshot = await get(ref(db, this.basePath));
      const categories = snapshot.val();
      
      if (!categories) return false;
      
      const normalizedName = categoryName.trim().toLowerCase();
      
      return Object.values(categories).some(category => 
        category.categoryId !== excludeId &&
        category.categoryName.trim().toLowerCase() === normalizedName
      );
    } catch (error) {
      console.error("Error checking category existence:", error);
      return false;
    }
  }

  // Subscribe to categories changes
  subscribeToCategories(callback) {
    const unsubscribe = onValue(ref(db, this.basePath), (snapshot) => {
      const data = snapshot.val();
      const categoriesArray = data ? Object.values(data) : [];
      callback(categoriesArray);
    });
    
    return unsubscribe;
  }

  // Add new category
  async addCategory(categoryName, adminId) {
    const hasPermission = await this.checkAdminPermission(adminId);
    if (!hasPermission) {
      throw new Error("You do not have permission to add categories for this hotel.");
    }

    const categoryExists = await this.checkCategoryExists(categoryName);
    if (categoryExists) {
      throw new Error("Category with this name already exists.");
    }

    const categoryId = uid();
    await set(ref(db, `${this.basePath}/${categoryId}`), {
      categoryName: categoryName.trim(),
      categoryId,
    });

    return { categoryId, categoryName: categoryName.trim() };
  }

  // Update category
  async updateCategory(categoryId, categoryName, adminId) {
    const hasPermission = await this.checkAdminPermission(adminId);
    if (!hasPermission) {
      throw new Error("You do not have permission to update categories for this hotel.");
    }

    const categoryExists = await this.checkCategoryExists(categoryName, categoryId);
    if (categoryExists) {
      throw new Error("Category with this name already exists.");
    }

    await update(ref(db, `${this.basePath}/${categoryId}`), {
      categoryName: categoryName.trim(),
      categoryId,
    });

    return { categoryId, categoryName: categoryName.trim() };
  }

  // Delete category
  async deleteCategory(categoryId, adminId) {
    const hasPermission = await this.checkAdminPermission(adminId);
    if (!hasPermission) {
      throw new Error("You do not have permission to delete categories for this hotel.");
    }

    await remove(ref(db, `${this.basePath}/${categoryId}`));
  }
}

// Factory function to create service instance
export const createCategoryService = (hotelName) => {
  return new CategoryService(hotelName);
};