import { toast } from "react-toastify";

// Validation patterns
const VALIDATION_PATTERNS = {
  name: /^[a-zA-Z\s]{2,30}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  mobile: /^[6-9]\d{9}$/,
  adhar: /^\d{12}$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  experience: /^\d{1,2}$/,
};

// Validation messages
const VALIDATION_MESSAGES = {
  firstName: {
    required: "First name is required",
    invalid: "First name should contain only letters and spaces (2-30 characters)",
  },
  lastName: {
    required: "Last name is required", 
    invalid: "Last name should contain only letters and spaces (2-30 characters)",
  },
  email: {
    required: "Email is required",
    invalid: "Please enter a valid email address",
    duplicate: "This email is already registered",
  },
  mobileNo: {
    required: "Mobile number is required",
    invalid: "Mobile number should be 10 digits starting with 6-9",
    duplicate: "This mobile number is already registered",
  },
  adharNo: {
    required: "Aadhar number is required",
    invalid: "Aadhar number should be exactly 12 digits",
    duplicate: "This Aadhar number is already registered",
  },
  panNo: {
    required: "PAN number is required",
    invalid: "PAN should be in format ABCDE1234F",
    duplicate: "This PAN number is already registered",
  },
  experience: {
    required: "Experience is required",
    invalid: "Experience should be a number between 0-99 years",
  },
  address: {
    required: "Address is required",
    minLength: "Address should be at least 10 characters long",
    maxLength: "Address should not exceed 200 characters",
  },
  photo: {
    invalidType: "Please select a valid image file (JPG, PNG, GIF)",
    tooLarge: "Image size should be less than 5MB",
  },
};

// Individual field validators
export const validateFirstName = (firstName) => {
  if (!firstName || !firstName.trim()) {
    return { isValid: false, error: VALIDATION_MESSAGES.firstName.required };
  }
  
  const trimmed = firstName.trim();
  if (!VALIDATION_PATTERNS.name.test(trimmed)) {
    return { isValid: false, error: VALIDATION_MESSAGES.firstName.invalid };
  }
  
  return { isValid: true, error: null };
};

export const validateLastName = (lastName) => {
  if (!lastName || !lastName.trim()) {
    return { isValid: false, error: VALIDATION_MESSAGES.lastName.required };
  }
  
  const trimmed = lastName.trim();
  if (!VALIDATION_PATTERNS.name.test(trimmed)) {
    return { isValid: false, error: VALIDATION_MESSAGES.lastName.invalid };
  }
  
  return { isValid: true, error: null };
};

export const validateEmail = (email, existingCaptains = [], excludeId = null) => {
  if (!email || !email.trim()) {
    return { isValid: false, error: VALIDATION_MESSAGES.email.required };
  }
  
  const trimmed = email.trim().toLowerCase();
  if (!VALIDATION_PATTERNS.email.test(trimmed)) {
    return { isValid: false, error: VALIDATION_MESSAGES.email.invalid };
  }
  
  // Check for duplicates
  const isDuplicate = existingCaptains.some(
    (captain) => 
      captain.email?.toLowerCase() === trimmed && 
      captain.captainId !== excludeId
  );
  
  if (isDuplicate) {
    return { isValid: false, error: VALIDATION_MESSAGES.email.duplicate };
  }
  
  return { isValid: true, error: null };
};

export const validateMobileNo = (mobileNo, existingCaptains = [], excludeId = null) => {
  if (!mobileNo || !mobileNo.trim()) {
    return { isValid: false, error: VALIDATION_MESSAGES.mobileNo.required };
  }
  
  const trimmed = mobileNo.trim().replace(/\s+/g, '');
  if (!VALIDATION_PATTERNS.mobile.test(trimmed)) {
    return { isValid: false, error: VALIDATION_MESSAGES.mobileNo.invalid };
  }
  
  // Check for duplicates
  const isDuplicate = existingCaptains.some(
    (captain) => 
      captain.mobileNo === trimmed && 
      captain.captainId !== excludeId
  );
  
  if (isDuplicate) {
    return { isValid: false, error: VALIDATION_MESSAGES.mobileNo.duplicate };
  }
  
  return { isValid: true, error: null };
};

export const validateAdharNo = (adharNo, existingCaptains = [], excludeId = null) => {
  if (!adharNo || !adharNo.trim()) {
    return { isValid: false, error: VALIDATION_MESSAGES.adharNo.required };
  }
  
  const trimmed = adharNo.trim().replace(/\s+/g, '');
  if (!VALIDATION_PATTERNS.adhar.test(trimmed)) {
    return { isValid: false, error: VALIDATION_MESSAGES.adharNo.invalid };
  }
  
  // Check for duplicates
  const isDuplicate = existingCaptains.some(
    (captain) => 
      captain.adharNo === trimmed && 
      captain.captainId !== excludeId
  );
  
  if (isDuplicate) {
    return { isValid: false, error: VALIDATION_MESSAGES.adharNo.duplicate };
  }
  
  return { isValid: true, error: null };
};

export const validatePanNo = (panNo, existingCaptains = [], excludeId = null) => {
  if (!panNo || !panNo.trim()) {
    return { isValid: false, error: VALIDATION_MESSAGES.panNo.required };
  }
  
  const trimmed = panNo.trim().replace(/\s+/g, '').toUpperCase();
  if (!VALIDATION_PATTERNS.pan.test(trimmed)) {
    return { isValid: false, error: VALIDATION_MESSAGES.panNo.invalid };
  }
  
  // Check for duplicates
  const isDuplicate = existingCaptains.some(
    (captain) => 
      captain.panNo?.toUpperCase() === trimmed && 
      captain.captainId !== excludeId
  );
  
  if (isDuplicate) {
    return { isValid: false, error: VALIDATION_MESSAGES.panNo.duplicate };
  }
  
  return { isValid: true, error: null };
};

export const validateExperience = (experience) => {
  if (!experience && experience !== 0) {
    return { isValid: false, error: VALIDATION_MESSAGES.experience.required };
  }
  
  const exp = parseInt(experience);
  if (isNaN(exp) || exp < 0 || exp > 99) {
    return { isValid: false, error: VALIDATION_MESSAGES.experience.invalid };
  }
  
  return { isValid: true, error: null };
};

export const validateAddress = (address) => {
  if (!address || !address.trim()) {
    return { isValid: false, error: VALIDATION_MESSAGES.address.required };
  }
  
  const trimmed = address.trim();
  if (trimmed.length < 10) {
    return { isValid: false, error: VALIDATION_MESSAGES.address.minLength };
  }
  
  if (trimmed.length > 200) {
    return { isValid: false, error: VALIDATION_MESSAGES.address.maxLength };
  }
  
  return { isValid: true, error: null };
};

export const validatePhoto = (photoFile) => {
  if (!photoFile) {
    // Photo is optional, so no error if not provided
    return { isValid: true, error: null };
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(photoFile.type)) {
    return { isValid: false, error: VALIDATION_MESSAGES.photo.invalidType };
  }
  
  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (photoFile.size > maxSize) {
    return { isValid: false, error: VALIDATION_MESSAGES.photo.tooLarge };
  }
  
  return { isValid: true, error: null };
};

// Complete form validation
export const validateCaptainForm = (captainData, existingCaptains = [], excludeId = null) => {
  const errors = {};
  
  // Validate all fields
  const firstNameValidation = validateFirstName(captainData.firstName);
  if (!firstNameValidation.isValid) {
    errors.firstName = firstNameValidation.error;
  }
  
  const lastNameValidation = validateLastName(captainData.lastName);
  if (!lastNameValidation.isValid) {
    errors.lastName = lastNameValidation.error;
  }
  
  const emailValidation = validateEmail(captainData.email, existingCaptains, excludeId);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }
  
  const mobileValidation = validateMobileNo(captainData.mobileNo, existingCaptains, excludeId);
  if (!mobileValidation.isValid) {
    errors.mobileNo = mobileValidation.error;
  }
  
  const adharValidation = validateAdharNo(captainData.adharNo, existingCaptains, excludeId);
  if (!adharValidation.isValid) {
    errors.adharNo = adharValidation.error;
  }
  
  const panValidation = validatePanNo(captainData.panNo, existingCaptains, excludeId);
  if (!panValidation.isValid) {
    errors.panNo = panValidation.error;
  }
  
  const experienceValidation = validateExperience(captainData.experience);
  if (!experienceValidation.isValid) {
    errors.experience = experienceValidation.error;
  }
  
  const addressValidation = validateAddress(captainData.address);
  if (!addressValidation.isValid) {
    errors.address = addressValidation.error;
  }
  
  const photoValidation = validatePhoto(captainData.photoFile);
  if (!photoValidation.isValid) {
    errors.photo = photoValidation.error;
  }
  
  const isValid = Object.keys(errors).length === 0;
  const firstError = Object.values(errors)[0] || null;
  
  return {
    isValid,
    errors,
    error: firstError, // For backward compatibility
  };
};

// Sanitize captain data
export const sanitizeCaptainData = (captainData) => {
  return {
    firstName: captainData.firstName?.trim(),
    lastName: captainData.lastName?.trim(),
    email: captainData.email?.trim().toLowerCase(),
    mobileNo: captainData.mobileNo?.trim().replace(/\s+/g, ''),
    adharNo: captainData.adharNo?.trim().replace(/\s+/g, ''),
    panNo: captainData.panNo?.trim().replace(/\s+/g, '').toUpperCase(),
    experience: parseInt(captainData.experience) || 0,
    address: captainData.address?.trim(),
  };
};

// Helper function to check if field has validation error
export const hasFieldError = (fieldName, errors) => {
  return errors && errors[fieldName];
};

// Helper function to get field error message
export const getFieldError = (fieldName, errors) => {
  return errors && errors[fieldName] ? errors[fieldName] : null;
};

// Real-time validation for individual fields
export const validateField = (fieldName, value, existingCaptains = [], excludeId = null) => {
  switch (fieldName) {
    case 'firstName':
      return validateFirstName(value);
    case 'lastName':
      return validateLastName(value);
    case 'email':
      return validateEmail(value, existingCaptains, excludeId);
    case 'mobileNo':
      return validateMobileNo(value, existingCaptains, excludeId);
    case 'adharNo':
      return validateAdharNo(value, existingCaptains, excludeId);
    case 'panNo':
      return validatePanNo(value, existingCaptains, excludeId);
    case 'experience':
      return validateExperience(value);
    case 'address':
      return validateAddress(value);
    case 'photo':
      return validatePhoto(value);
    default:
      return { isValid: true, error: null };
  }
};