import { toast } from "react-toastify";

export const validateCategoryName = (categoryName) => {
  if (!categoryName || !categoryName.trim()) {
    return {
      isValid: false,
      error: "Category name cannot be empty",
    };
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

  // Check for special characters (optional - adjust based on requirements)
  const specialCharsRegex = /^[a-zA-Z0-9\s\-_&]+$/;
  if (!specialCharsRegex.test(categoryName.trim())) {
    return {
      isValid: false,
      error: "Category name contains invalid characters",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

export const checkDuplicateCategory = (
  categories,
  categoryName,
  excludeCategoryId = null
) => {
  const normalizedCategoryName = categoryName.trim().toLowerCase();

  const isDuplicate = categories.some(
    (category) =>
      category.categoryName.toLowerCase() === normalizedCategoryName &&
      category.categoryId !== excludeCategoryId
  );

  return isDuplicate;
};

export const validateCategoryForm = (
  categoryName,
  categories,
  excludeCategoryId = null
) => {
  // Basic validation
  const basicValidation = validateCategoryName(categoryName);
  if (!basicValidation.isValid) {
    toast.error(basicValidation.error, {
      position: toast.POSITION.TOP_RIGHT,
    });
    return false;
  }

  // Duplicate check
  if (checkDuplicateCategory(categories, categoryName, excludeCategoryId)) {
    toast.error("Category already exists", {
      position: toast.POSITION.TOP_RIGHT,
    });
    return false;
  }

  return true;
};

export const sanitizeCategoryName = (categoryName) => {
  return categoryName.trim().replace(/\s+/g, " ");
};
