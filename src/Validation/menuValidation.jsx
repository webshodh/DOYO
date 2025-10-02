// validation/menuValidation.js (UPDATED)
import { toast } from "react-toastify";

export const validateMenuForm = (menuData) => {
  const {
    menuName,
    menuPrice,
    menuCookingTime,
    menuCategory,
    categoryType,
    menuContent,
  } = menuData;

  if (!menuName?.trim()) {
    toast.error("Menu Name is required!", {
      position: toast.POSITION.TOP_RIGHT,
    });
    return false;
  }

  if (!menuPrice || menuPrice <= 0) {
    toast.error("Menu Price is required and must be greater than 0!", {
      position: toast.POSITION.TOP_RIGHT,
    });
    return false;
  }

  if (!menuCookingTime || menuCookingTime <= 0) {
    toast.error("Cooking Time is required and must be greater than 0!", {
      position: toast.POSITION.TOP_RIGHT,
    });
    return false;
  }

  if (!menuCategory) {
    toast.error("Menu Category is required!", {
      position: toast.POSITION.TOP_RIGHT,
    });
    return false;
  }

  if (!categoryType) {
    toast.error("Category Type is required!", {
      position: toast.POSITION.TOP_RIGHT,
    });
    return false;
  }

  if (!menuContent?.trim()) {
    toast.error("Menu Content is required!", {
      position: toast.POSITION.TOP_RIGHT,
    });
    return false;
  }

  return true;
};

export const calculateFinalPrice = (price, discount = 0) => {
  if (!price || price <= 0) return 0;

  const numPrice = parseFloat(price);
  const numDiscount = parseFloat(discount) || 0;

  if (numDiscount > 0) {
    return Math.round((numPrice * (100 - numDiscount)) / 100);
  }

  return numPrice;
};

export const validateMenuName = (menuName) => {
  if (!menuName || !menuName.trim()) {
    return {
      isValid: false,
      error: "Menu name cannot be empty",
    };
  }

  if (menuName.trim().length < 2) {
    return {
      isValid: false,
      error: "Menu name must be at least 2 characters long",
    };
  }

  if (menuName.trim().length > 100) {
    return {
      isValid: false,
      error: "Menu name must be less than 100 characters",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

export const validatePrice = (price) => {
  const numPrice = parseFloat(price);

  if (isNaN(numPrice) || numPrice <= 0) {
    return {
      isValid: false,
      error: "Price must be a valid number greater than 0",
    };
  }

  if (numPrice > 10000) {
    return {
      isValid: false,
      error: "Price cannot exceed 10,000",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

export const sanitizeMenuData = (menuData) => {
  return {
    ...menuData,
    menuName: menuData.menuName?.trim() || "",
    menuContent: menuData.menuContent?.trim() || "",
    ingredients: menuData.ingredients?.trim() || "",
    menuPrice: parseFloat(menuData.menuPrice) || 0,
    discount: parseFloat(menuData.discount) || 0,
    menuCookingTime: parseInt(menuData.menuCookingTime) || 0,
    servingSize: parseInt(menuData.servingSize) || 1,
    calories: parseInt(menuData.calories) || 0,
  };
};
