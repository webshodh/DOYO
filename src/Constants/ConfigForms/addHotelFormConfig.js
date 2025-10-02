// src/constants/addHotelFormConfig.js

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
        /* … all other states … */
        { value: "puducherry", label: "Puducherry" },
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
    {
      name: "setupPriority",
      label: "Setup Priority",
      type: "select",
      required: false,
      options: [
        { value: "high", label: "High - Setup Immediately" },
        { value: "medium", label: "Medium - Setup This Week" },
        { value: "low", label: "Low - Setup Later" },
      ],
      defaultValue: "medium",
      description: "Priority level for hotel setup and onboarding",
    },
    {
      name: "autoAcceptOrders",
      label: "Auto Accept Orders",
      type: "checkbox",
      defaultValue: false,
      description:
        "Automatically accept incoming orders without manual confirmation",
    },
    {
      name: "minimumOrderAmount",
      label: "Minimum Order Amount (₹)",
      type: "number",
      placeholder: "Enter minimum order amount",
      required: false,
      min: 0,
      max: 10000,
      defaultValue: 0,
    },
  ],

  additionalInfo: [
    {
      name: "gstNumber",
      label: "GST Number",
      type: "text",
      placeholder: "Enter GST number (optional)",
      required: false,
    },
    {
      name: "fssaiNumber",
      label: "FSSAI License Number",
      type: "text",
      placeholder: "Enter FSSAI license number (optional)",
      required: false,
    },
    {
      name: "website",
      label: "Website URL",
      type: "url",
      placeholder: "Enter website URL (optional)",
      required: false,
    },
    {
      name: "socialMedia.facebook",
      label: "Facebook Page",
      type: "url",
      placeholder: "Facebook page URL",
      required: false,
    },
    {
      name: "socialMedia.instagram",
      label: "Instagram Handle",
      type: "text",
      placeholder: "@username",
      required: false,
    },
    {
      name: "socialMedia.twitter",
      label: "Twitter Handle",
      type: "text",
      placeholder: "@username",
      required: false,
    },
    {
      name: "specialInstructions",
      label: "Special Instructions/Notes",
      type: "textarea",
      placeholder: "Any special notes or instructions for setup",
      required: false,
      rows: 4,
    },
    {
      name: "preferredContactTime",
      label: "Preferred Contact Time",
      type: "select",
      required: false,
      options: [
        { value: "morning", label: "Morning (9 AM - 12 PM)" },
        { value: "afternoon", label: "Afternoon (12 PM - 5 PM)" },
        { value: "evening", label: "Evening (5 PM - 9 PM)" },
        { value: "anytime", label: "Anytime" },
      ],
      defaultValue: "anytime",
      description: "Best time to contact for setup and support",
    },
  ],
};

export const hotelFormInitialValues = {
  businessName: "",
  businessType: "",
  ownerName: "",
  businessEmail: "",
  primaryContact: "",
  alternateContact: "",

  address: "",
  area: "",
  city: "",
  state: "",
  pincode: "",
  coordinates: "",

  isActive: "active",
  setupPriority: "medium",
  autoAcceptOrders: false,
  minimumOrderAmount: 0,

  gstNumber: "",
  fssaiNumber: "",
  website: "",
  socialMedia: { facebook: "", instagram: "", twitter: "" },
  specialInstructions: "",
  preferredContactTime: "anytime",
};

export const getHotelValidationSchema = () => ({
  validate: (values) => {
    const errs = {};
    // Basic Info
    if (!values.businessName?.trim()) {
      errs.businessName = "Business name is required";
    } else if (
      values.businessName.length < 2 ||
      values.businessName.length > 100
    ) {
      errs.businessName = "Business name should be 2–100 chars";
    } else if (!/^[a-zA-Z0-9\s&'-]+$/.test(values.businessName)) {
      errs.businessName = "Invalid characters in business name";
    }
    if (!values.businessType) errs.businessType = "Business type is required";
    if (!values.ownerName?.trim()) {
      errs.ownerName = "Owner name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(values.ownerName)) {
      errs.ownerName = "Owner name must be letters only";
    }
    if (!values.businessEmail?.trim()) {
      errs.businessEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.businessEmail)) {
      errs.businessEmail = "Invalid email address";
    }
    if (!values.primaryContact?.trim()) {
      errs.primaryContact = "Primary contact is required";
    } else if (!/^[\+]?[0-9]{10,15}$/.test(values.primaryContact)) {
      errs.primaryContact = "Invalid phone number";
    }

    // Location
    if (!values.address?.trim()) {
      errs.address = "Address is required";
    } else if (values.address.length < 10 || values.address.length > 500) {
      errs.address = "Address should be 10–500 chars";
    }
    if (!values.area?.trim()) errs.area = "Area is required";
    if (!values.city?.trim()) {
      errs.city = "City is required";
    } else if (!/^[a-zA-Z\s]+$/.test(values.city)) {
      errs.city = "City must be letters only";
    }
    if (!values.state) errs.state = "State is required";
    if (!values.pincode?.trim()) {
      errs.pincode = "PIN code is required";
    } else if (!/^[0-9]{6}$/.test(values.pincode)) {
      errs.pincode = "PIN code must be 6 digits";
    }

    // Optional
    if (
      values.alternateContact &&
      !/^[\+]?[0-9]{10,15}$/.test(values.alternateContact)
    ) {
      errs.alternateContact = "Invalid phone number";
    }
    if (
      values.gstNumber &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]1[1-9A-Z]Z[0-9A-Z]$/.test(
        values.gstNumber
      )
    ) {
      errs.gstNumber = "Invalid GST number";
    }
    if (values.fssaiNumber && !/^[0-9]{14}$/.test(values.fssaiNumber)) {
      errs.fssaiNumber = "FSSAI must be 14 digits";
    }
    if (
      values.website &&
      !/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b/.test(
        values.website
      )
    ) {
      errs.website = "Invalid website URL";
    }
    if (values.minimumOrderAmount < 0 || values.minimumOrderAmount > 10000) {
      errs.minimumOrderAmount = "Min amount 0–10,000";
    }
    return errs;
  },
});
