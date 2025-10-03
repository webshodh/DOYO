import { toast } from "react-toastify";

export const validateOfferName = (offerName) => {
  if (!offerName || !offerName.trim()) {
    return {
      isValid: false,
      error: "Offer name cannot be empty",
    };
  }

  if (offerName.trim().length < 3) {
    return {
      isValid: false,
      error: "Offer name must be at least 3 characters long",
    };
  }

  if (offerName.trim().length > 100) {
    return {
      isValid: false,
      error: "Offer name must be less than 100 characters",
    };
  }

  // Check for special characters (allow more flexibility for offers)
  const specialCharsRegex = /^[a-zA-Z0-9\s\-_&%!@#$+().,]+$/;
  if (!specialCharsRegex.test(offerName.trim())) {
    return {
      isValid: false,
      error: "Offer name contains invalid characters",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

export const validateDiscountValue = (discountValue, offerType) => {
  if (
    !discountValue &&
    offerType !== "free_delivery" &&
    offerType !== "buy_one_get_one"
  ) {
    return {
      isValid: false,
      error: "Discount value is required",
    };
  }

  const numValue = parseFloat(discountValue);

  if (
    isNaN(numValue) &&
    offerType !== "free_delivery" &&
    offerType !== "buy_one_get_one"
  ) {
    return {
      isValid: false,
      error: "Discount value must be a valid number",
    };
  }

  if (
    numValue <= 0 &&
    offerType !== "free_delivery" &&
    offerType !== "buy_one_get_one"
  ) {
    return {
      isValid: false,
      error: "Discount value must be greater than 0",
    };
  }

  if (offerType === "percentage" && numValue > 100) {
    return {
      isValid: false,
      error: "Percentage discount cannot exceed 100%",
    };
  }

  if (offerType === "fixed" && numValue > 10000) {
    return {
      isValid: false,
      error: "Fixed discount cannot exceed ₹10,000",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

export const validateDateRange = (validFrom, validUntil) => {
  if (!validFrom) {
    return {
      isValid: false,
      field: "validFrom",
      error: "Start date is required",
    };
  }

  if (!validUntil) {
    return {
      isValid: false,
      field: "validUntil",
      error: "End date is required",
    };
  }

  const fromDate = new Date(validFrom);
  const untilDate = new Date(validUntil);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (fromDate < today) {
    return {
      isValid: false,
      field: "validFrom",
      error: "Start date cannot be in the past",
    };
  }

  if (untilDate <= fromDate) {
    return {
      isValid: false,
      field: "validUntil",
      error: "End date must be after start date",
    };
  }

  // Check if offer duration is reasonable (max 1 year)
  const maxDate = new Date(fromDate);
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  if (untilDate > maxDate) {
    return {
      isValid: false,
      field: "validUntil",
      error: "Offer duration cannot exceed 1 year",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

export const validateUsageLimits = (maxUsageCount, usagePerCustomer) => {
  const errors = {};

  if (maxUsageCount && maxUsageCount.trim()) {
    const maxUsage = parseInt(maxUsageCount);
    if (isNaN(maxUsage) || maxUsage < 1) {
      errors.maxUsageCount = "Max usage must be a positive number";
    } else if (maxUsage > 100000) {
      errors.maxUsageCount = "Max usage cannot exceed 100,000";
    }
  }

  if (usagePerCustomer && usagePerCustomer.trim()) {
    const perCustomer = parseInt(usagePerCustomer);
    if (isNaN(perCustomer) || perCustomer < 1) {
      errors.usagePerCustomer = "Usage per customer must be a positive number";
    } else if (perCustomer > 100) {
      errors.usagePerCustomer = "Usage per customer cannot exceed 100";
    }

    // Check if usage per customer is greater than max usage
    if (maxUsageCount && maxUsageCount.trim()) {
      const maxUsage = parseInt(maxUsageCount);
      if (!isNaN(maxUsage) && !isNaN(perCustomer) && perCustomer > maxUsage) {
        errors.usagePerCustomer =
          "Usage per customer cannot exceed max total usage";
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateMinimumAmount = (minimumOrderAmount) => {
  if (minimumOrderAmount && minimumOrderAmount.trim()) {
    const minAmount = parseFloat(minimumOrderAmount);
    if (isNaN(minAmount) || minAmount < 0) {
      return {
        isValid: false,
        error: "Minimum order amount must be a valid positive number",
      };
    }
    if (minAmount > 50000) {
      return {
        isValid: false,
        error: "Minimum order amount cannot exceed ₹50,000",
      };
    }
  }

  return {
    isValid: true,
    error: null,
  };
};

export const checkDuplicateOffer = (
  offers,
  offerName,
  excludeOfferId = null,
) => {
  const normalizedOfferName = offerName.trim().toLowerCase();

  const isDuplicate = offers.some(
    (offer) =>
      offer.offerName.toLowerCase() === normalizedOfferName &&
      offer.offerId !== excludeOfferId,
  );

  return isDuplicate;
};

export const validateOfferForm = (
  offerData,
  offers = [],
  excludeOfferId = null,
) => {
  const errors = {};

  // Validate offer name
  const nameValidation = validateOfferName(offerData.offerName);
  if (!nameValidation.isValid) {
    errors.offerName = nameValidation.error;
  }

  // Check for duplicate offer names
  if (
    nameValidation.isValid &&
    checkDuplicateOffer(offers, offerData.offerName, excludeOfferId)
  ) {
    errors.offerName = "An offer with this name already exists";
  }

  // Validate discount value
  const discountValidation = validateDiscountValue(
    offerData.discountValue,
    offerData.offerType,
  );
  if (!discountValidation.isValid) {
    errors.discountValue = discountValidation.error;
  }

  // Validate date range
  const dateValidation = validateDateRange(
    offerData.validFrom,
    offerData.validUntil,
  );
  if (!dateValidation.isValid) {
    errors[dateValidation.field] = dateValidation.error;
  }

  // Validate usage limits
  const usageValidation = validateUsageLimits(
    offerData.maxUsageCount,
    offerData.usagePerCustomer,
  );
  if (!usageValidation.isValid) {
    Object.assign(errors, usageValidation.errors);
  }

  // Validate minimum amount
  const minAmountValidation = validateMinimumAmount(
    offerData.minimumOrderAmount,
  );
  if (!minAmountValidation.isValid) {
    errors.minimumOrderAmount = minAmountValidation.error;
  }

  // Validate description length
  if (offerData.offerDescription && offerData.offerDescription.length > 500) {
    errors.offerDescription = "Description cannot exceed 500 characters";
  }

  // Validate terms length
  if (offerData.terms && offerData.terms.length > 1000) {
    errors.terms = "Terms cannot exceed 1000 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateOfferFormWithToast = (
  offerData,
  offers = [],
  excludeOfferId = null,
) => {
  const validation = validateOfferForm(offerData, offers, excludeOfferId);

  if (!validation.isValid) {
    // Show the first error as toast
    const firstError = Object.values(validation.errors)[0];
    toast.error(firstError, {
      position: toast.POSITION.TOP_RIGHT,
    });
    return false;
  }

  return true;
};

export const sanitizeOfferData = (offerData) => {
  return {
    ...offerData,
    offerName: offerData.offerName.trim().replace(/\s+/g, " "),
    offerDescription: offerData.offerDescription.trim(),
    discountValue: offerData.discountValue
      ? parseFloat(offerData.discountValue)
      : null,
    minimumOrderAmount: offerData.minimumOrderAmount
      ? parseFloat(offerData.minimumOrderAmount)
      : null,
    maxUsageCount: offerData.maxUsageCount
      ? parseInt(offerData.maxUsageCount)
      : null,
    usagePerCustomer: offerData.usagePerCustomer
      ? parseInt(offerData.usagePerCustomer)
      : null,
    terms: offerData.terms.trim(),
  };
};

// Utility function to format offer for display
export const formatOfferDisplay = (offer) => {
  let displayText = offer.offerName;

  if (offer.offerType === "percentage" && offer.discountValue) {
    displayText += ` (${offer.discountValue}% off)`;
  } else if (offer.offerType === "fixed" && offer.discountValue) {
    displayText += ` (₹${offer.discountValue} off)`;
  } else if (offer.offerType === "buy_one_get_one") {
    displayText += " (Buy 1 Get 1)";
  } else if (offer.offerType === "free_delivery") {
    displayText += " (Free Delivery)";
  }

  return displayText;
};

// Check if offer is currently valid
export const isOfferValid = (offer) => {
  const now = new Date();
  const fromDate = new Date(offer.validFrom);
  const untilDate = new Date(offer.validUntil);

  return offer.isActive && now >= fromDate && now <= untilDate;
};

// Check if offer is expired
export const isOfferExpired = (offer) => {
  const now = new Date();
  const untilDate = new Date(offer.validUntil);

  return now > untilDate;
};
