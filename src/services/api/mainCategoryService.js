// firestoreCategoryService.js
import {
  getFirestore,
  doc,
  collection,
  getDoc,
  query,
  where,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { uid } from "uid";

const firestore = getFirestore();

export class CategoryService {
  constructor(hotelName) {
    this.hotelName = hotelName;
    this.baseCollection = collection(
      firestore,
      `hotels/${hotelName}/Maincategories`
    );
  }

  async checkAdminPermission(adminId) {
    try {
      const adminHotelDoc = await getDoc(
        doc(firestore, `admins/${adminId}/hotels/${this.hotelName}`)
      );
      const hotelDoc = await getDoc(doc(firestore, `hotels/${this.hotelName}`));

      const adminHotelUuid = adminHotelDoc.exists()
        ? adminHotelDoc.data().uuid
        : null;
      const generalHotelUuid = hotelDoc.exists() ? hotelDoc.data().uuid : null;

      return adminHotelUuid === generalHotelUuid;
    } catch (error) {
      console.error("Error checking admin permission:", error);
      return false;
    }
  }

  async checkCategoryExists(categoryName, excludeId = null) {
    try {
      const snapshot = await getDocs(this.baseCollection);
      if (snapshot.empty) return false;

      const normalizedName = categoryName.trim().toLowerCase();

      return snapshot.docs.some(
        (doc) =>
          doc.id !== excludeId &&
          doc.data().categoryName.trim().toLowerCase() === normalizedName
      );
    } catch (error) {
      console.error("Error checking category existence:", error);
      return false;
    }
  }

  subscribeToCategories(callback) {
    const unsubscribe = onSnapshot(this.baseCollection, (snapshot) => {
      const categoriesArray = snapshot.docs.map((doc) => ({
        ...doc.data(),
        categoryId: doc.id,
      }));
      callback(categoriesArray);
    });
    return unsubscribe;
  }

  async addCategory(categoryName, adminId) {
    const hasPermission = await this.checkAdminPermission(adminId);
    if (!hasPermission) {
      throw new Error(
        "You do not have permission to add categories for this hotel."
      );
    }

    const categoryExists = await this.checkCategoryExists(categoryName);
    if (categoryExists) {
      throw new Error("Category with this name already exists.");
    }

    const categoryId = uid();
    const categoryRef = doc(this.baseCollection, categoryId);
    await setDoc(categoryRef, {
      categoryName: categoryName.trim(),
      createdAt: Timestamp.fromDate(new Date()),
      categoryId,
      status: "active",
    });

    return { categoryId, categoryName: categoryName.trim() };
  }

  async updateCategory(categoryId, categoryName, adminId) {
    const hasPermission = await this.checkAdminPermission(adminId);
    if (!hasPermission) {
      throw new Error(
        "You do not have permission to update categories for this hotel."
      );
    }

    const categoryExists = await this.checkCategoryExists(
      categoryName,
      categoryId
    );
    if (categoryExists) {
      throw new Error("Category with this name already exists.");
    }

    const categoryRef = doc(this.baseCollection, categoryId);
    await updateDoc(categoryRef, {
      categoryName: categoryName.trim(),
      updatedAt: Timestamp.fromDate(new Date()),
      categoryId,
    });

    return { categoryId, categoryName: categoryName.trim() };
  }

  async deleteCategory(categoryId, adminId) {
    const hasPermission = await this.checkAdminPermission(adminId);
    if (!hasPermission) {
      throw new Error(
        "You do not have permission to delete categories for this hotel."
      );
    }

    const categoryRef = doc(this.baseCollection, categoryId);
    await deleteDoc(categoryRef);
  }

  // Optional: Add getCategoryStats and other utilities if needed
  // Example:
  // async getCategoryStats() {...}
}

// Factory function for convenience
export const createCategoryService = (hotelName) =>
  new CategoryService(hotelName);
