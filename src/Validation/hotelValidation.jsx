import { toast } from "react-toastify";



export const validateHotelForm = (hotelName, admins) => {
  const errors = [];

  // Hotel validation
  if (!hotelName.trim()) {
    errors.push("Hotel Name is required");
  }

  // Admin validation
  admins.forEach((admin, index) => {
    if (!admin.name.trim()) {
      errors.push(`Admin ${index + 1}: Name is required`);
    }

    if (!admin.email.trim() || !validateEmail(admin.email)) {
      errors.push(`Admin ${index + 1}: Valid email is required`);
    }

    if (
      !admin.isExisting &&
      (!admin.password.trim() || !validatePassword(admin.password))
    ) {
      errors.push(`Admin ${index + 1}: Password must be at least 6 characters`);
    }

    if (!admin.contact.trim() || !validateContact(admin.contact)) {
      errors.push(`Admin ${index + 1}: Valid 10-digit contact is required`);
    }
  });

  // Display all errors
  if (errors.length > 0) {
    errors.forEach((error) => {
      toast.error(error, {
        position: toast.POSITION.TOP_RIGHT,
      });
    });
    return false;
  }

  return true;
};

export const validateAdmin = (admin) => {
  const errors = {};

  if (!admin.name.trim()) {
    errors.name = "Name is required";
  }

  if (!admin.email.trim()) {
    errors.email = "Email is required";
  } else if (!validateEmail(admin.email)) {
    errors.email = "Valid email is required";
  }

  if (!admin.isExisting) {
    if (!admin.password.trim()) {
      errors.password = "Password is required";
    } else if (!validatePassword(admin.password)) {
      errors.password = "Password must be at least 6 characters";
    }
  }

  if (!admin.contact.trim()) {
    errors.contact = "Contact is required";
  } else if (!validateContact(admin.contact)) {
    errors.contact = "Valid 10-digit contact is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};


// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Contact number validation
export const validateContact = (contact) => {
  const contactRegex = /^[6-9]\d{9}$/;
  return contactRegex.test(contact.trim());
};

// Optional contact validation (can be empty or valid)
export const validateContactOptional = (contact) => {
  if (!contact || contact.trim() === '') return true;
  return validateContact(contact);
};

// Password validation
export const validatePassword = (password) => {
  return password && password.trim().length >= 6;
};

// Business name validation
export const validateBusinessName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 100;
};

// Required field validation
export const validateRequired = (value) => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value && value.toString().trim() !== '';
};

// Pincode validation
export const validatePincode = (pincode) => {
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode.trim());
};

// GST number validation
export const validateGST = (gst) => {
  if (!gst || gst.trim() === '') return true; // Optional field
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst.trim().toUpperCase());
};

// FSSAI number validation
export const validateFSSAI = (fssai) => {
  const fssaiRegex = /^\d{14}$/;
  return fssaiRegex.test(fssai.trim());
};

// PAN number validation
export const validatePAN = (pan) => {
  if (!pan || pan.trim() === '') return true; // Optional field
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.trim().toUpperCase());
};

// URL validation
export const validateURL = (url) => {
  if (!url || url.trim() === '') return true; // Optional field
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Instagram handle validation
export const validateInstagram = (handle) => {
  if (!handle || handle.trim() === '') return true; // Optional field
  const instagramRegex = /^@?[A-Za-z0-9._]{1,30}$/;
  return instagramRegex.test(handle.trim());
};

// Year validation
export const validateYear = (year) => {
  if (!year) return true; // Optional field
  const currentYear = new Date().getFullYear();
  const numYear = parseInt(year);
  return numYear >= 1900 && numYear <= currentYear;
};

// Positive number validation
export const validatePositiveNumber = (number) => {
  if (!number && number !== 0) return true; // Optional field
  const num = parseFloat(number);
  return !isNaN(num) && num >= 0;
};

// Latitude validation
export const validateLatitude = (lat) => {
  if (!lat) return true; // Optional field
  const latitude = parseFloat(lat);
  return !isNaN(latitude) && latitude >= -90 && latitude <= 90;
};

// Longitude validation
export const validateLongitude = (lng) => {
  if (!lng) return true; // Optional field
  const longitude = parseFloat(lng);
  return !isNaN(longitude) && longitude >= -180 && longitude <= 180;
};

// Main validation function
export const validateField = (fieldName, value, validationType) => {
  if (!validationType) return true;

  switch (validationType) {
    case 'email':
      return validateEmail(value);
    case 'contact':
      return validateContact(value);
    case 'contactOptional':
      return validateContactOptional(value);
    case 'password':
      return validatePassword(value);
    case 'businessName':
      return validateBusinessName(value);
    case 'required':
      return validateRequired(value);
    case 'pincode':
      return validatePincode(value);
    case 'gst':
      return validateGST(value);
    case 'fssai':
      return validateFSSAI(value);
    case 'pan':
      return validatePAN(value);
    case 'url':
      return validateURL(value);
    case 'instagram':
      return validateInstagram(value);
    case 'year':
      return validateYear(value);
    case 'positiveNumber':
      return validatePositiveNumber(value);
    case 'latitude':
      return validateLatitude(value);
    case 'longitude':
      return validateLongitude(value);
    default:
      return true;
  }
};

// Get validation error message
export const getValidationError = (fieldName, value, validationType, fieldLabel) => {
  if (!validationType) return '';

  const isValid = validateField(fieldName, value, validationType);
  if (isValid) return '';

  switch (validationType) {
    case 'email':
      return 'Please enter a valid email address';
    case 'contact':
      return 'Please enter a valid 10-digit mobile number';
    case 'contactOptional':
      return 'Please enter a valid 10-digit mobile number or leave empty';
    case 'password':
      return 'Password must be at least 6 characters long';
    case 'businessName':
      return 'Business name must be between 2-100 characters';
    case 'required':
      return `${fieldLabel} is required`;
    case 'pincode':
      return 'Please enter a valid 6-digit pincode';
    case 'gst':
      return 'Please enter a valid GST number (15 characters)';
    case 'fssai':
      return 'Please enter a valid 14-digit FSSAI number';
    case 'pan':
      return 'Please enter a valid PAN number (e.g., ABCDE1234F)';
    case 'url':
      return 'Please enter a valid URL';
    case 'instagram':
      return 'Please enter a valid Instagram handle';
    case 'year':
      return 'Please enter a valid year';
    case 'positiveNumber':
      return 'Please enter a positive number';
    case 'latitude':
      return 'Please enter a valid latitude (-90 to 90)';
    case 'longitude':
      return 'Please enter a valid longitude (-180 to 180)';
    default:
      return 'Invalid value';
  }
};

// Validate entire form
export const validateForm = (formData, formConfig) => {
  const errors = {};
  let isValid = true;

  formConfig.sections.forEach(section => {
    section.fields.forEach(field => {
      const value = formData[field.name];
      const fieldIsValid = validateField(field.name, value, field.validation);
      
      if (!fieldIsValid) {
        errors[field.name] = getValidationError(field.name, value, field.validation, field.label);
        isValid = false;
      }
    });
  });

  return { isValid, errors };
};