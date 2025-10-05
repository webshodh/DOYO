// src/constants/addHotelFormConfig.js (UPDATED WITH isOrderEnabled)

export const hotelFormSections = [
  {
    title: "Basic Information",
    description: "Essential business details and contact information",
    fields: "basicInfo",
    icon: "Building2",
    required: true,
  },
  {
    title: "Location Details",
    description: "Complete address and location information",
    fields: "locationInfo",
    icon: "MapPin",
    required: true,
  },
  {
    title: "Status & Settings",
    description: "Operational status and basic settings",
    fields: "statusSettings",
    icon: "Settings",
    required: true,
  },
  {
    title: "Additional Information",
    description: "Optional details for better service",
    fields: "additionalInfo",
    icon: "Info",
    optional: true,
  },
];

export const hotelFormFields = {
  basicInfo: [
    {
      name: "businessName",
      label: "Business/Hotel Name",
      type: "text",
      placeholder: "Enter your business or hotel name",
      required: true,
      description:
        "This will be displayed to customers and used as your main identifier",
    },
    {
      name: "businessType",
      label: "Business Type",
      type: "select",
      required: true,
      options: [
        { value: "restaurant", label: "Restaurant" },
        { value: "cafe", label: "Cafe" },
        { value: "fast_food", label: "Fast Food" },
        { value: "fine_dining", label: "Fine Dining" },
        { value: "casual_dining", label: "Casual Dining" },
        { value: "bakery", label: "Bakery" },
        { value: "bar", label: "Bar & Grill" },
        { value: "pizzeria", label: "Pizzeria" },
        { value: "food_truck", label: "Food Truck" },
        { value: "cloud_kitchen", label: "Cloud Kitchen" },
        { value: "catering", label: "Catering Service" },
        { value: "hotel_restaurant", label: "Hotel Restaurant" },
        { value: "other", label: "Other" },
      ],
      placeholder: "Select business type",
    },
    {
      name: "ownerName",
      label: "Owner/Manager Name",
      type: "text",
      placeholder: "Enter owner or manager name",
      required: true,
    },
    {
      name: "businessEmail",
      label: "Business Email",
      type: "email",
      placeholder: "Enter business email address",
      required: true,
      description:
        "This email will be used for important notifications and communications",
    },
    {
      name: "primaryContact",
      label: "Primary Contact Number",
      type: "tel",
      placeholder: "Enter primary contact number",
      required: true,
    },
    {
      name: "alternateContact",
      label: "Alternate Contact Number",
      type: "tel",
      placeholder: "Enter alternate contact number",
      required: false,
    },
  ],

  locationInfo: [
    {
      name: "address",
      label: "Complete Address",
      type: "textarea",
      placeholder: "Enter complete business address",
      required: true,
      rows: 3,
    },
    {
      name: "area",
      label: "Area/Locality",
      type: "text",
      placeholder: "Enter area or locality",
      required: true,
    },
    {
      name: "city",
      label: "City",
      type: "text",
      placeholder: "Enter city name",
      required: true,
    },
    {
      name: "state",
      label: "State",
      type: "select",
      required: true,
      options: [
        { value: "andhra_pradesh", label: "Andhra Pradesh" },
        { value: "arunachal_pradesh", label: "Arunachal Pradesh" },
        { value: "assam", label: "Assam" },
        { value: "bihar", label: "Bihar" },
        { value: "chhattisgarh", label: "Chhattisgarh" },
        { value: "goa", label: "Goa" },
        { value: "gujarat", label: "Gujarat" },
        { value: "haryana", label: "Haryana" },
        { value: "himachal_pradesh", label: "Himachal Pradesh" },
        { value: "jharkhand", label: "Jharkhand" },
        { value: "karnataka", label: "Karnataka" },
        { value: "kerala", label: "Kerala" },
        { value: "madhya_pradesh", label: "Madhya Pradesh" },
        { value: "maharashtra", label: "Maharashtra" },
        { value: "manipur", label: "Manipur" },
        { value: "meghalaya", label: "Meghalaya" },
        { value: "mizoram", label: "Mizoram" },
        { value: "nagaland", label: "Nagaland" },
        { value: "odisha", label: "Odisha" },
        { value: "punjab", label: "Punjab" },
        { value: "rajasthan", label: "Rajasthan" },
        { value: "sikkim", label: "Sikkim" },
        { value: "tamil_nadu", label: "Tamil Nadu" },
        { value: "telangana", label: "Telangana" },
        { value: "tripura", label: "Tripura" },
        { value: "uttar_pradesh", label: "Uttar Pradesh" },
        { value: "uttarakhand", label: "Uttarakhand" },
        { value: "west_bengal", label: "West Bengal" },
        { value: "delhi", label: "Delhi" },
        { value: "chandigarh", label: "Chandigarh" },
        { value: "puducherry", label: "Puducherry" },
        { value: "jammu_kashmir", label: "Jammu & Kashmir" },
        { value: "ladakh", label: "Ladakh" },
        { value: "lakshadweep", label: "Lakshadweep" },
        { value: "andaman_nicobar", label: "Andaman & Nicobar Islands" },
        {
          value: "dadra_nagar_haveli",
          label: "Dadra & Nagar Haveli and Daman & Diu",
        },
      ],
      placeholder: "Select state",
    },
    {
      name: "pincode",
      label: "PIN Code",
      type: "text",
      placeholder: "Enter PIN code",
      required: true,
    },
    {
      name: "coordinates",
      label: "GPS Coordinates (Optional)",
      type: "text",
      placeholder: "e.g., 12.9716,77.5946",
      required: false,
      description: "Help customers find your location easily",
    },
  ],

  statusSettings: [
    {
      name: "isActive",
      label: "Hotel Status",
      type: "select",
      required: true,
      options: [
        { value: "active", label: "Active" },
        { value: "in_active", label: "Inactive" },
        { value: "pending", label: "Pending Approval" },
        { value: "suspended", label: "Suspended" },
      ],
      defaultValue: "active",
      description:
        "Only active hotels will be visible to customers and can take orders",
    },
    // MOVED isOrderEnabled HERE - PROPERLY STRUCTURED
    {
      name: "isOrderEnabled",
      label: "Enable Orders",
      type: "checkbox",
      required: false,
      defaultValue: false,
      description:
        "Allow captain and admin to place orders online through the DOYO.",
      helperText:
        "When enabled, captain can browse your menu and place orders directly",
      className:
        "border-2 border-dashed border-orange-300 bg-orange-50 p-4 rounded-lg mt-4",
      labelClassName: "text-orange-800 font-semibold flex items-center",
      descriptionClassName: "text-orange-600 text-sm mt-2",
    },
   
  ],

  additionalInfo: [
    {
      name: "gstNumber",
      label: "GST Number",
      type: "text",
      placeholder: "Enter GST number (optional)",
      required: false,
      description: "15-digit GST registration number",
    },
    {
      name: "fssaiNumber",
      label: "FSSAI License Number",
      type: "text",
      placeholder: "Enter FSSAI license number (optional)",
      required: false,
      description: "14-digit FSSAI food license number",
    },
    {
      name: "website",
      label: "Website URL",
      type: "url",
      placeholder: "https://yourwebsite.com",
      required: false,
      description: "Your business website (if any)",
    },
    {
      name: "socialMedia.facebook",
      label: "Facebook Page",
      type: "url",
      placeholder: "https://facebook.com/yourpage",
      required: false,
    },
    {
      name: "socialMedia.instagram",
      label: "Instagram Handle",
      type: "text",
      placeholder: "@yourbusiness",
      required: false,
    },
    {
      name: "socialMedia.twitter",
      label: "Twitter Handle",
      type: "text",
      placeholder: "@yourbusiness",
      required: false,
    },
    
  ],
};

export const hotelFormInitialValues = {
  // Basic Information
  businessName: "",
  businessType: "",
  ownerName: "",
  businessEmail: "",
  primaryContact: "",
  alternateContact: "",

  // Location Details
  address: "",
  area: "",
  city: "",
  state: "",
  pincode: "",
  coordinates: "",

  // Status & Settings
  isActive: "active",
  isOrderEnabled: false, // NEW FIELD - Properly included


  // Additional Information
  gstNumber: "",
  fssaiNumber: "",
  website: "",
  socialMedia: {
    facebook: "",
    instagram: "",
    twitter: "",
  },
  specialInstructions: "",
  preferredContactTime: "anytime",
};

export const getHotelValidationSchema = () => ({
  validate: (values) => {
    const errs = {};

    // Basic Info Validation
    if (!values.businessName?.trim()) {
      errs.businessName = "Business name is required";
    } else if (
      values.businessName.length < 2 ||
      values.businessName.length > 100
    ) {
      errs.businessName = "Business name should be 2–100 characters";
    } else if (!/^[a-zA-Z0-9\s&'-]+$/.test(values.businessName)) {
      errs.businessName = "Invalid characters in business name";
    }

    if (!values.businessType) {
      errs.businessType = "Business type is required";
    }

    if (!values.ownerName?.trim()) {
      errs.ownerName = "Owner name is required";
    } else if (values.ownerName.length < 2 || values.ownerName.length > 50) {
      errs.ownerName = "Owner name should be 2–50 characters";
    } else if (!/^[a-zA-Z\s\.]+$/.test(values.ownerName)) {
      errs.ownerName = "Owner name should contain only letters and spaces";
    }

    if (!values.businessEmail?.trim()) {
      errs.businessEmail = "Business email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.businessEmail)) {
      errs.businessEmail = "Invalid email address format";
    }

    if (!values.primaryContact?.trim()) {
      errs.primaryContact = "Primary contact is required";
    } else if (
      !/^[\+]?[0-9]{10,15}$/.test(values.primaryContact.replace(/\s+/g, ""))
    ) {
      errs.primaryContact = "Invalid phone number (10-15 digits required)";
    }

    // Location Validation
    if (!values.address?.trim()) {
      errs.address = "Address is required";
    } else if (values.address.length < 10 || values.address.length > 500) {
      errs.address = "Address should be 10–500 characters";
    }

    if (!values.area?.trim()) {
      errs.area = "Area/Locality is required";
    } else if (values.area.length < 2 || values.area.length > 50) {
      errs.area = "Area should be 2–50 characters";
    }

    if (!values.city?.trim()) {
      errs.city = "City is required";
    } else if (values.city.length < 2 || values.city.length > 50) {
      errs.city = "City should be 2–50 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(values.city)) {
      errs.city = "City should contain only letters and spaces";
    }

    if (!values.state) {
      errs.state = "State is required";
    }

    if (!values.pincode?.trim()) {
      errs.pincode = "PIN code is required";
    } else if (!/^[0-9]{6}$/.test(values.pincode)) {
      errs.pincode = "PIN code must be exactly 6 digits";
    }

    // Status & Settings Validation
    if (!values.isActive) {
      errs.isActive = "Hotel status is required";
    }

    // isOrderEnabled validation (optional but must be boolean)
    if (
      values.isOrderEnabled !== undefined &&
      typeof values.isOrderEnabled !== "boolean"
    ) {
      errs.isOrderEnabled = "Order enabled status must be true or false";
    }

    if (values.minimumOrderAmount !== undefined) {
      const minAmount = Number(values.minimumOrderAmount);
      if (isNaN(minAmount) || minAmount < 0 || minAmount > 10000) {
        errs.minimumOrderAmount =
          "Minimum order amount should be between 0 and 10,000";
      }
    }

    // Optional Field Validations
    if (
      values.alternateContact &&
      !/^[\+]?[0-9]{10,15}$/.test(values.alternateContact.replace(/\s+/g, ""))
    ) {
      errs.alternateContact = "Invalid alternate phone number";
    }

    if (
      values.gstNumber &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][Z][0-9A-Z]$/.test(
        values.gstNumber
      )
    ) {
      errs.gstNumber = "Invalid GST number format";
    }

    if (values.fssaiNumber && !/^[0-9]{14}$/.test(values.fssaiNumber)) {
      errs.fssaiNumber = "FSSAI number must be exactly 14 digits";
    }

    if (
      values.website &&
      !/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b/.test(
        values.website
      )
    ) {
      errs.website = "Invalid website URL format";
    }

    if (
      values.coordinates &&
      !/^-?([1-8]?[0-9]\.{1}\d{1,6}|90\.{1}0{1,6}),\s?-?(180\.{1}0{1,6}|((1[0-7][0-9])|([1-9]?[0-9]))\.{1}\d{1,6})$/.test(
        values.coordinates
      )
    ) {
      errs.coordinates =
        "Invalid GPS coordinates format (e.g., 12.9716,77.5946)";
    }

    if (
      values.socialMedia?.facebook &&
      !/^https?:\/\/(www\.)?facebook\.com\//.test(values.socialMedia.facebook)
    ) {
      errs["socialMedia.facebook"] = "Invalid Facebook URL";
    }

    if (
      values.socialMedia?.instagram &&
      !/^@?[a-zA-Z0-9._]+$/.test(values.socialMedia.instagram)
    ) {
      errs["socialMedia.instagram"] = "Invalid Instagram handle";
    }

    if (
      values.socialMedia?.twitter &&
      !/^@?[a-zA-Z0-9._]+$/.test(values.socialMedia.twitter)
    ) {
      errs["socialMedia.twitter"] = "Invalid Twitter handle";
    }

    return errs;
  },
});
