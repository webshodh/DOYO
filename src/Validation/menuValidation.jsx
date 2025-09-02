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
