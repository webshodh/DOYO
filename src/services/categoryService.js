import { db } from "../data/firebase/firebaseConfig";
import { uid } from "uid";
import { set, ref, onValue, remove, update, get } from "firebase/database";
import { toast } from "react-toastify";

/**
 * Check if admin has permission for the hotel
 */
export const checkAdminPermission = async (adminID, hotelName) => {
  try {
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
    console.error("Error checking permissions:", error);
    return false;
  }
};

/**
 * Check if category name already exists
 */
export const checkDuplicateCategory = (categories, categoryName, excludeCategoryId = null) => {
  const normalizedCategoryName = categoryName.trim().toLowerCase();
  return categories.some(
    (category) =>
      category.categoryName.toLowerCase() === normalizedCategoryName &&
      (excludeCategoryId ? category.categoryId !== excludeCategoryId : true)
  );
};

/**
 * Subscribe to categories data
 */
export const subscribeToCategories = (hotelName, callback) => {
  const unsubscribe = onValue(ref(db, `/hotels/${hotelName}/categories/`), (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(Object.values(data));
    } else {
      callback([]);
    }
  });

  return unsubscribe;
};

/**
 * Add new category
 */
export const addCategory = async (adminID, hotelName, categoryName, categories) => {
  // Validate input
  if (!categoryName.trim()) {
    toast.error("Category name cannot be empty.", {
      position: toast.POSITION.TOP_RIGHT,
    });
    return { success: false, error: "Empty category name" };
  }

  // Check for duplicates
  if (checkDuplicateCategory(categories, categoryName)) {
    toast.error("Category already exists.", {
      position: toast.POSITION.TOP_RIGHT,
    });
    return { success: false, error: "Duplicate category" };
  }

  // Check permissions
  const hasPermission = await checkAdminPermission(adminID, hotelName);
  if (!hasPermission) {
    toast.error(
      "You do not have permission to add categories for this hotel.",
      {
        position: toast.POSITION.TOP_RIGHT,
      }
    );
    return { success: false, error: "No permission" };
  }

  // Add category to database
  try {
    const categoryId = uid();
    await set(ref(db, `/hotels/${hotelName}/categories/${categoryId}`), {
      categoryName: categoryName.trim(),
      categoryId,
    });

    toast.success("Category Added Successfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });

    return { success: true, categoryId };
  } catch (error) {
    console.error("Error adding category:", error);
    toast.error("Error adding category. Please try again.", {
      position: toast.POSITION.TOP_RIGHT,
    });
    return { success: false, error: error.message };
  }
};

/**
 * Update existing category
 */
export const updateCategory = async (adminID, hotelName, categoryId, categoryName, categories) => {
  // Validate input
  if (!categoryName.trim()) {
    toast.error("Category name cannot be empty.", {
      position: toast.POSITION.TOP_RIGHT,
    });
    return { success: false, error: "Empty category name" };
  }

  // Check for duplicates (excluding current category)
  if (checkDuplicateCategory(categories, categoryName, categoryId)) {
    toast.error("Category already exists.", {
      position: toast.POSITION.TOP_RIGHT,
    });
    return { success: false, error: "Duplicate category" };
  }

  // Check permissions
  const hasPermission = await checkAdminPermission(adminID, hotelName);
  if (!hasPermission) {
    toast.error(
      "You do not have permission to update categories for this hotel.",
      {
        position: toast.POSITION.TOP_RIGHT,
      }
    );
    return { success: false, error: "No permission" };
  }

  // Update category in database
  try {
    await update(ref(db, `/hotels/${hotelName}/categories/${categoryId}`), {
      categoryName: categoryName.trim(),
      categoryId,
    });

    toast.success("Category Updated Successfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating category:", error);
    toast.error("Error updating category. Please try again.", {
      position: toast.POSITION.TOP_RIGHT,
    });
    return { success: false, error: error.message };
  }
};

/**
 * Delete category
 */
export const deleteCategory = async (adminID, hotelName, category) => {
  // Check permissions
  const hasPermission = await checkAdminPermission(adminID, hotelName);
  if (!hasPermission) {
    toast.error(
      "You do not have permission to delete categories for this hotel.",
      {
        position: toast.POSITION.TOP_RIGHT,
      }
    );
    return { success: false, error: "No permission" };
  }

  // Delete category from database
  try {
    await remove(ref(db, `/hotels/${hotelName}/categories/${category.categoryId}`));

    toast.error("Category Deleted Successfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    toast.error("Error deleting category. Please try again.", {
      position: toast.POSITION.TOP_RIGHT,
    });
    return { success: false, error: error.message };
  }
};

/**
 * Filter categories by search term and add serial numbers
 */
export const filterAndMapCategories = (categories, searchTerm) => {
  return categories
    .filter((category) =>
      category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((category, index) => ({
      srNo: index + 1,
      ...category,
    }));
};