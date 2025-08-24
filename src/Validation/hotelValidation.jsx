import { toast } from "react-toastify";

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateContact = (contact) => {
  return /^\d{10}$/.test(contact);
};

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
