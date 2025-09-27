export const hotelFormFields = {
  // Basic Hotel Information Section
  basicInfo: [
    {
      name: "businessName",
      label: "Business/Hotel Name",
      type: "text",
      placeholder: "Enter your business or hotel name",
      required: true,
      validation: {
        minLength: 2,
        maxLength: 100,
        pattern: /^[a-zA-Z0-9\s&'-]+$/,
        message:
          "Business name can only contain letters, numbers, spaces, &, ', and -",
      },
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
      validation: {
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\s]+$/,
        message: "Name should contain only letters and spaces",
      },
    },
    {
      name: "businessEmail",
      label: "Business Email",
      type: "email",
      placeholder: "Enter business email address",
      required: true,
      validation: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Please enter a valid email address",
      },
      description:
        "This email will be used for important notifications and communications",
    },
    {
      name: "primaryContact",
      label: "Primary Contact Number",
      type: "tel",
      placeholder: "Enter primary contact number",
      required: true,
      validation: {
        pattern: /^[\+]?[0-9]{10,15}$/,
        message: "Please enter a valid phone number (10-15 digits)",
      },
    },
    {
      name: "alternateContact",
      label: "Alternate Contact Number",
      type: "tel",
      placeholder: "Enter alternate contact number",
      required: false,
      validation: {
        pattern: /^[\+]?[0-9]{10,15}$/,
        message: "Please enter a valid phone number (10-15 digits)",
      },
    },
  ],

  // Location Information Section
  locationInfo: [
    {
      name: "address",
      label: "Complete Address",
      type: "textarea",
      placeholder: "Enter complete business address",
      required: true,
      rows: 3,
      validation: {
        minLength: 10,
        maxLength: 500,
        message: "Address should be between 10-500 characters",
      },
    },
    {
      name: "area",
      label: "Area/Locality",
      type: "text",
      placeholder: "Enter area or locality",
      required: true,
      validation: {
        minLength: 2,
        maxLength: 100,
        message: "Area should be between 2-100 characters",
      },
    },
    {
      name: "city",
      label: "City",
      type: "text",
      placeholder: "Enter city name",
      required: true,
      validation: {
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\s]+$/,
        message: "City name should contain only letters and spaces",
      },
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
      ],
      placeholder: "Select state",
    },
    {
      name: "pincode",
      label: "PIN Code",
      type: "text",
      placeholder: "Enter PIN code",
      required: true,
      validation: {
        pattern: /^[0-9]{6}$/,
        message: "PIN code should be exactly 6 digits",
      },
    },
    {
      name: "coordinates",
      label: "GPS Coordinates (Optional)",
      type: "text",
      placeholder: "e.g., 12.9716, 77.5946",
      required: false,
      validation: {
        pattern: /^-?\d+\.?\d*,-?\d+\.?\d*$/,
        message: "Enter coordinates in format: latitude,longitude",
      },
      description: "Help customers find your location easily",
    },
  ],

  // Business Details Section
  businessDetails: [
    {
      name: "seatingCapacity",
      label: "Seating Capacity",
      type: "number",
      placeholder: "Enter total seating capacity",
      required: false,
      min: 1,
      max: 1000,
      validation: {
        min: 1,
        max: 1000,
        message: "Seating capacity should be between 1-1000",
      },
    },
    {
      name: "cuisine",
      label: "Cuisine Type",
      type: "multiselect",
      placeholder: "Select cuisine types",
      required: false,
      options: [
        { value: "indian", label: "Indian" },
        { value: "chinese", label: "Chinese" },
        { value: "italian", label: "Italian" },
        { value: "mexican", label: "Mexican" },
        { value: "thai", label: "Thai" },
        { value: "continental", label: "Continental" },
        { value: "american", label: "American" },
        { value: "japanese", label: "Japanese" },
        { value: "korean", label: "Korean" },
        { value: "mediterranean", label: "Mediterranean" },
        { value: "fusion", label: "Fusion" },
        { value: "vegetarian", label: "Vegetarian" },
        { value: "vegan", label: "Vegan" },
        { value: "fast_food", label: "Fast Food" },
        { value: "street_food", label: "Street Food" },
        { value: "desserts", label: "Desserts" },
        { value: "beverages", label: "Beverages" },
      ],
    },
    {
      name: "operatingHours",
      label: "Operating Hours",
      type: "object",
      required: false,
      fields: [
        {
          name: "openTime",
          label: "Opening Time",
          type: "time",
          defaultValue: "09:00",
        },
        {
          name: "closeTime",
          label: "Closing Time",
          type: "time",
          defaultValue: "22:00",
        },
        {
          name: "isOpen24Hours",
          label: "Open 24 Hours",
          type: "checkbox",
          defaultValue: false,
        },
        {
          name: "weeklyOff",
          label: "Weekly Off",
          type: "select",
          options: [
            { value: "none", label: "No Weekly Off" },
            { value: "monday", label: "Monday" },
            { value: "tuesday", label: "Tuesday" },
            { value: "wednesday", label: "Wednesday" },
            { value: "thursday", label: "Thursday" },
            { value: "friday", label: "Friday" },
            { value: "saturday", label: "Saturday" },
            { value: "sunday", label: "Sunday" },
          ],
          defaultValue: "none",
        },
      ],
    },
    {
      name: "features",
      label: "Restaurant Features",
      type: "checkbox-group",
      required: false,
      options: [
        { value: "wifi", label: "Free WiFi" },
        { value: "parking", label: "Parking Available" },
        { value: "ac", label: "Air Conditioned" },
        { value: "delivery", label: "Home Delivery" },
        { value: "takeaway", label: "Takeaway" },
        { value: "dine_in", label: "Dine In" },
        { value: "outdoor_seating", label: "Outdoor Seating" },
        { value: "live_music", label: "Live Music" },
        { value: "bar", label: "Full Bar" },
        { value: "private_dining", label: "Private Dining" },
        { value: "wheelchair_accessible", label: "Wheelchair Accessible" },
        { value: "pet_friendly", label: "Pet Friendly" },
        { value: "kids_friendly", label: "Kids Friendly" },
        { value: "smoking_area", label: "Smoking Area" },
        { value: "card_payment", label: "Card Payment" },
        { value: "upi_payment", label: "UPI Payment" },
      ],
    },
  ],

  // Status and Settings Section
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
      validation: {
        min: 0,
        max: 10000,
        message: "Minimum order amount should be between ₹0-₹10,000",
      },
    },
  ],

  // Additional Information Section
  additionalInfo: [
    {
      name: "gstNumber",
      label: "GST Number",
      type: "text",
      placeholder: "Enter GST number (optional)",
      required: false,
      validation: {
        pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        message: "Please enter a valid GST number",
      },
    },
    {
      name: "fssaiNumber",
      label: "FSSAI License Number",
      type: "text",
      placeholder: "Enter FSSAI license number (optional)",
      required: false,
      validation: {
        pattern: /^[0-9]{14}$/,
        message: "FSSAI number should be exactly 14 digits",
      },
    },
    {
      name: "website",
      label: "Website URL",
      type: "url",
      placeholder: "Enter website URL (optional)",
      required: false,
      validation: {
        pattern:
          /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
        message: "Please enter a valid website URL",
      },
    },
    {
      name: "socialMedia",
      label: "Social Media",
      type: "object",
      required: false,
      fields: [
        {
          name: "facebook",
          label: "Facebook Page",
          type: "url",
          placeholder: "Facebook page URL",
        },
        {
          name: "instagram",
          label: "Instagram Handle",
          type: "text",
          placeholder: "@username",
        },
        {
          name: "twitter",
          label: "Twitter Handle",
          type: "text",
          placeholder: "@username",
        },
      ],
    },
    {
      name: "specialInstructions",
      label: "Special Instructions/Notes",
      type: "textarea",
      placeholder: "Any special notes or instructions for setup",
      required: false,
      rows: 4,
      validation: {
        maxLength: 1000,
        message: "Special instructions should be less than 1000 characters",
      },
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

// Form sections configuration
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
    title: "Business Details",
    description: "Restaurant specifics, cuisine, and operating details",
    fields: "businessDetails",
    icon: "Store",
    optional: true,
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

// Initial form values
export const hotelFormInitialValues = {
  // Basic Info
  businessName: "",
  businessType: "",
  ownerName: "",
  businessEmail: "",
  primaryContact: "",
  alternateContact: "",

  // Location
  address: "",
  area: "",
  city: "",
  state: "",
  pincode: "",
  coordinates: "",

  // Business Details
  seatingCapacity: "",
  cuisine: [],
  operatingHours: {
    openTime: "09:00",
    closeTime: "22:00",
    isOpen24Hours: false,
    weeklyOff: "none",
  },
  features: [],

  // Status & Settings
  isActive: "active",
  setupPriority: "medium",
  autoAcceptOrders: false,
  minimumOrderAmount: 0,

  // Additional Info
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

// Business type templates with pre-filled values
export const businessTypeTemplates = {
  restaurant: {
    seatingCapacity: 50,
    features: [
      "wifi",
      "parking",
      "ac",
      "delivery",
      "takeaway",
      "dine_in",
      "card_payment",
      "upi_payment",
    ],
    operatingHours: {
      openTime: "11:00",
      closeTime: "23:00",
      isOpen24Hours: false,
      weeklyOff: "none",
    },
  },
  cafe: {
    seatingCapacity: 25,
    features: [
      "wifi",
      "ac",
      "takeaway",
      "dine_in",
      "card_payment",
      "upi_payment",
    ],
    operatingHours: {
      openTime: "07:00",
      closeTime: "22:00",
      isOpen24Hours: false,
      weeklyOff: "none",
    },
  },
  fast_food: {
    seatingCapacity: 30,
    features: [
      "delivery",
      "takeaway",
      "dine_in",
      "card_payment",
      "upi_payment",
    ],
    operatingHours: {
      openTime: "10:00",
      closeTime: "23:00",
      isOpen24Hours: false,
      weeklyOff: "none",
    },
  },
  cloud_kitchen: {
    seatingCapacity: 0,
    features: ["delivery", "takeaway"],
    operatingHours: {
      openTime: "09:00",
      closeTime: "23:00",
      isOpen24Hours: false,
      weeklyOff: "none",
    },
  },
};

// Validation schema helper
export const getHotelValidationSchema = () => {
  return {
    validate: (values) => {
      const newErrors = {};

      // Basic Info Validation
      if (!values.businessName?.trim()) {
        newErrors.businessName = "Business name is required";
      } else if (
        values.businessName.length < 2 ||
        values.businessName.length > 100
      ) {
        newErrors.businessName =
          "Business name should be between 2-100 characters";
      } else if (!/^[a-zA-Z0-9\s&'-]+$/.test(values.businessName)) {
        newErrors.businessName = "Business name contains invalid characters";
      }

      if (!values.businessType) {
        newErrors.businessType = "Business type is required";
      }

      if (!values.ownerName?.trim()) {
        newErrors.ownerName = "Owner name is required";
      } else if (!/^[a-zA-Z\s]+$/.test(values.ownerName)) {
        newErrors.ownerName =
          "Owner name should contain only letters and spaces";
      }

      if (!values.businessEmail?.trim()) {
        newErrors.businessEmail = "Business email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.businessEmail)) {
        newErrors.businessEmail = "Please enter a valid email address";
      }

      if (!values.primaryContact?.trim()) {
        newErrors.primaryContact = "Primary contact is required";
      } else if (!/^[\+]?[0-9]{10,15}$/.test(values.primaryContact)) {
        newErrors.primaryContact = "Please enter a valid phone number";
      }

      // Location Validation
      if (!values.address?.trim()) {
        newErrors.address = "Address is required";
      } else if (values.address.length < 10 || values.address.length > 500) {
        newErrors.address = "Address should be between 10-500 characters";
      }

      if (!values.area?.trim()) {
        newErrors.area = "Area is required";
      }

      if (!values.city?.trim()) {
        newErrors.city = "City is required";
      } else if (!/^[a-zA-Z\s]+$/.test(values.city)) {
        newErrors.city = "City name should contain only letters and spaces";
      }

      if (!values.state) {
        newErrors.state = "State is required";
      }

      if (!values.pincode?.trim()) {
        newErrors.pincode = "PIN code is required";
      } else if (!/^[0-9]{6}$/.test(values.pincode)) {
        newErrors.pincode = "PIN code should be exactly 6 digits";
      }

      // Optional field validations
      if (
        values.alternateContact &&
        !/^[\+]?[0-9]{10,15}$/.test(values.alternateContact)
      ) {
        newErrors.alternateContact = "Please enter a valid phone number";
      }

      if (
        values.gstNumber &&
        !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
          values.gstNumber
        )
      ) {
        newErrors.gstNumber = "Please enter a valid GST number";
      }

      if (values.fssaiNumber && !/^[0-9]{14}$/.test(values.fssaiNumber)) {
        newErrors.fssaiNumber = "FSSAI number should be exactly 14 digits";
      }

      if (
        values.website &&
        !/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(
          values.website
        )
      ) {
        newErrors.website = "Please enter a valid website URL";
      }

      if (
        values.seatingCapacity &&
        (parseInt(values.seatingCapacity) < 1 ||
          parseInt(values.seatingCapacity) > 1000)
      ) {
        newErrors.seatingCapacity = "Seating capacity should be between 1-1000";
      }

      if (
        values.minimumOrderAmount &&
        (parseFloat(values.minimumOrderAmount) < 0 ||
          parseFloat(values.minimumOrderAmount) > 10000)
      ) {
        newErrors.minimumOrderAmount =
          "Minimum order amount should be between ₹0-₹10,000";
      }

      return newErrors;
    },
  };
};

// Quick setup presets for different business types
export const quickSetupPresets = {
  "Small Restaurant": {
    businessType: "restaurant",
    seatingCapacity: 30,
    features: [
      "wifi",
      "ac",
      "delivery",
      "takeaway",
      "dine_in",
      "card_payment",
      "upi_payment",
    ],
    setupPriority: "high",
  },
  "Cafe/Coffee Shop": {
    businessType: "cafe",
    seatingCapacity: 20,
    features: ["wifi", "takeaway", "dine_in", "card_payment", "upi_payment"],
    setupPriority: "medium",
  },
  "Cloud Kitchen": {
    businessType: "cloud_kitchen",
    seatingCapacity: 0,
    features: ["delivery", "takeaway"],
    setupPriority: "high",
  },
  "Fine Dining": {
    businessType: "fine_dining",
    seatingCapacity: 80,
    features: [
      "wifi",
      "parking",
      "ac",
      "bar",
      "private_dining",
      "card_payment",
    ],
    setupPriority: "medium",
  },
};
