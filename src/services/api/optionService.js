// services/optionsService.js
import { db } from "../firebase/firebaseConfig";
import { uid } from "uid";
import { set, ref, onValue, remove, update, get } from "firebase/database";

export class OptionsService {
  constructor(hotelName) {
    this.hotelName = hotelName;
    this.categoriesPath = `/hotels/${hotelName}/optionCategories`;
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

  // Subscribe to categories + their options
  subscribeToCategories(callback) {
    const unsubscribe = onValue(ref(db, this.categoriesPath), (snapshot) => {
      const data = snapshot.val();
      callback(data || {});
    });
    return unsubscribe;
  }

  // Add new category
  async addCategory(categoryTitle, adminId) {
    const hasPermission = await this.checkAdminPermission(adminId);
    if (!hasPermission) {
      throw new Error(
        "You do not have permission to add categories for this hotel."
      );
    }

    const categoryId = uid();
    const categoryKey = categoryTitle.toLowerCase().replace(/\s+/g, "");

    await set(ref(db, `${this.categoriesPath}/${categoryKey}`), {
      id: categoryId,
      title: categoryTitle.trim(),
      key: categoryKey,
      createdAt: Date.now(),
      options: {}, // initialize options container
    });

    return { id: categoryId, title: categoryTitle.trim(), key: categoryKey };
  }

  // Update category title
  async updateCategory(categoryKey, newTitle, adminId) {
    const hasPermission = await this.checkAdminPermission(adminId);
    if (!hasPermission) {
      throw new Error(
        "You do not have permission to update categories for this hotel."
      );
    }

    await update(ref(db, `${this.categoriesPath}/${categoryKey}`), {
      title: newTitle.trim(),
    });

    return { title: newTitle.trim(), key: categoryKey };
  }

  // Delete category and all its options
  async deleteCategory(categoryKey, adminId) {
    const hasPermission = await this.checkAdminPermission(adminId);
    if (!hasPermission) {
      throw new Error(
        "You do not have permission to delete categories for this hotel."
      );
    }

    await remove(ref(db, `${this.categoriesPath}/${categoryKey}`));
  }

  // Add new option inside a category
  async addOption(categoryKey, value, adminId) {
    const hasPermission = await this.checkAdminPermission(adminId);
    if (!hasPermission) {
      throw new Error(
        "You do not have permission to add options for this hotel."
      );
    }

    const optionId = uid();
    await set(
      ref(db, `${this.categoriesPath}/${categoryKey}/options/${optionId}`),
      {
        id: optionId,
        value: value.trim(),
        createdAt: Date.now(),
      }
    );

    return { id: optionId, value: value.trim() };
  }

  // Update option value
  async updateOption(categoryKey, optionId, newValue, adminId) {
    const hasPermission = await this.checkAdminPermission(adminId);
    if (!hasPermission) {
      throw new Error(
        "You do not have permission to update options for this hotel."
      );
    }

    await update(
      ref(db, `${this.categoriesPath}/${categoryKey}/options/${optionId}`),
      {
        value: newValue.trim(),
      }
    );

    return { id: optionId, value: newValue.trim() };
  }

  // Delete option from a category
  async deleteOption(categoryKey, optionId, adminId) {
    const hasPermission = await this.checkAdminPermission(adminId);
    if (!hasPermission) {
      throw new Error(
        "You do not have permission to delete options for this hotel."
      );
    }

    await remove(
      ref(db, `${this.categoriesPath}/${categoryKey}/options/${optionId}`)
    );
  }
}

// Factory function
export const createOptionsService = (hotelName) => {
  return new OptionsService(hotelName);
};
