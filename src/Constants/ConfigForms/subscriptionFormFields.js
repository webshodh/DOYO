// Subscription Plan Form Fields Config - config/subscriptionFormFields.js

export const subscriptionFormFields = {
  // Basic Plan Information
  basicInfo: [
    {
      name: "planName",
      label: "Plan Name",
      type: "text",
      placeholder: "e.g., Basic, Premium, Enterprise",
      required: true,
      validation: {
        minLength: 2,
        maxLength: 50,
        message: "Plan name should be between 2-50 characters",
      },
    },
    {
      name: "description",
      label: "Plan Description",
      type: "textarea",
      placeholder: "Describe what this plan offers",
      required: true,
      rows: 3,
      validation: {
        minLength: 10,
        maxLength: 500,
        message: "Description should be between 10-500 characters",
      },
    },
    {
      name: "price",
      label: "Price (₹)",
      type: "number",
      placeholder: "Enter plan price",
      required: true,
      min: 0,
      step: "0.01",
      validation: {
        min: 0,
        message: "Price must be a positive number",
      },
    },
    {
      name: "duration",
      label: "Duration (Months)",
      type: "number",
      placeholder: "Enter duration in months",
      required: true,
      min: 1,
      max: 36,
      defaultValue: 1,
      validation: {
        min: 1,
        max: 36,
        message: "Duration must be between 1-36 months",
      },
    },
    {
      name: "status",
      label: "Plan Status",
      type: "select",
      required: true,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "draft", label: "Draft" },
      ],
      defaultValue: "active",
    },
  ],

  // Core Features (Boolean Flags)
  coreFeatures: [
    {
      name: "isCustomerOrderEnable",
      label: "Customer Ordering System",
      type: "checkbox",
      description: "Allow customers to place orders online",
      defaultValue: false,
    },
    {
      name: "isCaptainDashboard",
      label: "Captain Dashboard",
      type: "checkbox",
      description: "Access to captain/waiter dashboard",
      defaultValue: false,
    },
    {
      name: "isKitchenDashboard",
      label: "Kitchen Dashboard",
      type: "checkbox",
      description: "Kitchen order management system",
      defaultValue: false,
    },
    {
      name: "isAnalyticsDashboard",
      label: "Analytics & Reports",
      type: "checkbox",
      description: "Advanced analytics and reporting features",
      defaultValue: false,
    },
    {
      name: "isInventoryManagement",
      label: "Inventory Management",
      type: "checkbox",
      description: "Track and manage inventory levels",
      defaultValue: false,
    },
    {
      name: "isTableManagement",
      label: "Table Management",
      type: "checkbox",
      description: "Manage table reservations and seating",
      defaultValue: false,
    },
    {
      name: "isStaffManagement",
      label: "Staff Management",
      type: "checkbox",
      description: "Manage staff schedules and performance",
      defaultValue: false,
    },
  ],

  // Advanced Features
  advancedFeatures: [
    {
      name: "isReportsExport",
      label: "Export Reports",
      type: "checkbox",
      description: "Export reports to PDF, Excel, CSV",
      defaultValue: false,
    },
    {
      name: "isMultiLanguage",
      label: "Multi-Language Support",
      type: "checkbox",
      description: "Support for multiple languages",
      defaultValue: false,
    },
    {
      name: "isWhatsAppIntegration",
      label: "WhatsApp Integration",
      type: "checkbox",
      description: "Send orders and notifications via WhatsApp",
      defaultValue: false,
    },
    {
      name: "isSmsNotifications",
      label: "SMS Notifications",
      type: "checkbox",
      description: "Send SMS notifications to customers",
      defaultValue: false,
    },
    {
      name: "isEmailReports",
      label: "Email Reports",
      type: "checkbox",
      description: "Automated email reports and notifications",
      defaultValue: false,
    },
    {
      name: "isCustomBranding",
      label: "Custom Branding",
      type: "checkbox",
      description: "Customize the app with hotel branding",
      defaultValue: false,
    },
    {
      name: "is24x7Support",
      label: "24x7 Support",
      type: "checkbox",
      description: "Round the clock customer support",
      defaultValue: false,
    },
    {
      name: "isAPIAccess",
      label: "API Access",
      type: "checkbox",
      description: "Access to REST API for integrations",
      defaultValue: false,
    },
  ],

  // Usage Limits
  usageLimits: [
    {
      name: "maxAdmins",
      label: "Maximum Admins",
      type: "number",
      placeholder: "Number of admin accounts allowed",
      required: true,
      min: 1,
      max: 100,
      defaultValue: 1,
      validation: {
        min: 1,
        max: 100,
        message: "Must be between 1-100 admins",
      },
    },
    {
      name: "maxCategories",
      label: "Maximum Categories",
      type: "number",
      placeholder: "Number of menu categories allowed",
      required: true,
      min: 1,
      max: 1000,
      defaultValue: 5,
      validation: {
        min: 1,
        max: 1000,
        message: "Must be between 1-1000 categories",
      },
    },
    {
      name: "maxMenuItems",
      label: "Maximum Menu Items",
      type: "number",
      placeholder: "Number of menu items allowed",
      required: true,
      min: 1,
      max: 10000,
      defaultValue: 50,
      validation: {
        min: 1,
        max: 10000,
        message: "Must be between 1-10000 menu items",
      },
    },
    {
      name: "maxCaptains",
      label: "Maximum Captains",
      type: "number",
      placeholder: "Number of captain accounts allowed",
      required: true,
      min: 1,
      max: 100,
      defaultValue: 2,
      validation: {
        min: 1,
        max: 100,
        message: "Must be between 1-100 captains",
      },
    },
    {
      name: "maxTables",
      label: "Maximum Tables",
      type: "number",
      placeholder: "Number of tables that can be managed",
      required: true,
      min: 1,
      max: 500,
      defaultValue: 10,
      validation: {
        min: 1,
        max: 500,
        message: "Must be between 1-500 tables",
      },
    },
    {
      name: "maxStorage",
      label: "Storage Limit (MB)",
      type: "number",
      placeholder: "Storage limit in MB",
      required: true,
      min: 100,
      max: 10240,
      defaultValue: 1024,
      validation: {
        min: 100,
        max: 10240,
        message: "Must be between 100MB-10GB",
      },
    },
  ],
};

// Form sections configuration
export const subscriptionFormSections = [
  {
    title: "Basic Information",
    description: "Plan name, pricing, and basic details",
    fields: "basicInfo",
    icon: "Info",
  },
  {
    title: "Core Features",
    description: "Essential features for restaurant management",
    fields: "coreFeatures",
    icon: "Star",
  },
  {
    title: "Advanced Features",
    description: "Premium features and integrations",
    fields: "advancedFeatures",
    icon: "Zap",
  },
  {
    title: "Usage Limits",
    description: "Set limits for different resources",
    fields: "usageLimits",
    icon: "BarChart",
  },
];

// Initial form values
export const subscriptionFormInitialValues = {
  planName: "",
  description: "",
  price: "",
  duration: 1,
  status: "active",

  // Core features
  isCustomerOrderEnable: false,
  isCaptainDashboard: false,
  isKitchenDashboard: false,
  isAnalyticsDashboard: false,
  isInventoryManagement: false,
  isTableManagement: false,
  isStaffManagement: false,

  // Advanced features
  isReportsExport: false,
  isMultiLanguage: false,
  isWhatsAppIntegration: false,
  isSmsNotifications: false,
  isEmailReports: false,
  isCustomBranding: false,
  is24x7Support: false,
  isAPIAccess: false,

  // Usage limits
  maxAdmins: 1,
  maxCategories: 5,
  maxMenuItems: 50,
  maxCaptains: 2,
  maxTables: 10,
  maxStorage: 1024,
};

// Predefined plan templates
export const planTemplates = {
  free: {
    planName: "Free Plan",
    description: "Basic features for small restaurants",
    price: 0,
    duration: 1,
    status: "active",
    isCustomerOrderEnable: true,
    isCaptainDashboard: false,
    isKitchenDashboard: false,
    isAnalyticsDashboard: false,
    isInventoryManagement: false,
    isTableManagement: false,
    isStaffManagement: false,
    maxAdmins: 1,
    maxCategories: 5,
    maxMenuItems: 25,
    maxCaptains: 1,
    maxTables: 5,
    maxStorage: 500,
  },
  basic: {
    planName: "Basic Plan",
    description: "Essential features for growing restaurants",
    price: 999,
    duration: 1,
    status: "active",
    isCustomerOrderEnable: true,
    isCaptainDashboard: true,
    isKitchenDashboard: true,
    isAnalyticsDashboard: false,
    isInventoryManagement: false,
    isTableManagement: true,
    isStaffManagement: false,
    maxAdmins: 2,
    maxCategories: 15,
    maxMenuItems: 100,
    maxCaptains: 3,
    maxTables: 20,
    maxStorage: 1024,
  },
  premium: {
    planName: "Premium Plan",
    description: "Advanced features for established restaurants",
    price: 2499,
    duration: 1,
    status: "active",
    isCustomerOrderEnable: true,
    isCaptainDashboard: true,
    isKitchenDashboard: true,
    isAnalyticsDashboard: true,
    isInventoryManagement: true,
    isTableManagement: true,
    isStaffManagement: true,
    isReportsExport: true,
    isWhatsAppIntegration: true,
    isSmsNotifications: true,
    isEmailReports: true,
    maxAdmins: 5,
    maxCategories: 50,
    maxMenuItems: 500,
    maxCaptains: 10,
    maxTables: 50,
    maxStorage: 2048,
  },
  enterprise: {
    planName: "Enterprise Plan",
    description: "Complete solution for restaurant chains",
    price: 4999,
    duration: 1,
    status: "active",
    isCustomerOrderEnable: true,
    isCaptainDashboard: true,
    isKitchenDashboard: true,
    isAnalyticsDashboard: true,
    isInventoryManagement: true,
    isTableManagement: true,
    isStaffManagement: true,
    isReportsExport: true,
    isMultiLanguage: true,
    isWhatsAppIntegration: true,
    isSmsNotifications: true,
    isEmailReports: true,
    isCustomBranding: true,
    is24x7Support: true,
    isAPIAccess: true,
    maxAdmins: 20,
    maxCategories: 200,
    maxMenuItems: 2000,
    maxCaptains: 50,
    maxTables: 200,
    maxStorage: 5120,
  },
};

// Validation schema helper
export const getSubscriptionValidationSchema = () => {
  return {
    validate: (values) => {
      const newErrors = {};

      // Required field validation
      if (!values.planName?.trim()) {
        newErrors.planName = "Plan name is required";
      } else if (values.planName.length < 2 || values.planName.length > 50) {
        newErrors.planName = "Plan name should be between 2-50 characters";
      }

      if (!values.description?.trim()) {
        newErrors.description = "Description is required";
      } else if (
        values.description.length < 10 ||
        values.description.length > 500
      ) {
        newErrors.description =
          "Description should be between 10-500 characters";
      }

      if (!values.price && values.price !== 0) {
        newErrors.price = "Price is required";
      } else if (parseFloat(values.price) < 0) {
        newErrors.price = "Price must be a positive number";
      }

      if (!values.duration) {
        newErrors.duration = "Duration is required";
      } else if (
        parseInt(values.duration) < 1 ||
        parseInt(values.duration) > 36
      ) {
        newErrors.duration = "Duration must be between 1-36 months";
      }

      // Usage limits validation
      const limits = [
        { field: "maxAdmins", min: 1, max: 100, label: "Maximum admins" },
        {
          field: "maxCategories",
          min: 1,
          max: 1000,
          label: "Maximum categories",
        },
        {
          field: "maxMenuItems",
          min: 1,
          max: 10000,
          label: "Maximum menu items",
        },
        { field: "maxCaptains", min: 1, max: 100, label: "Maximum captains" },
        { field: "maxTables", min: 1, max: 500, label: "Maximum tables" },
        { field: "maxStorage", min: 100, max: 10240, label: "Storage limit" },
      ];

      limits.forEach(({ field, min, max, label }) => {
        const value = parseInt(values[field]);
        if (!value) {
          newErrors[field] = `${label} is required`;
        } else if (value < min || value > max) {
          newErrors[field] = `${label} must be between ${min}-${max}`;
        }
      });

      return newErrors;
    },
  };
};

// Feature categories for better organization
export const featureCategories = {
  core: {
    title: "Core Features",
    description: "Essential restaurant management features",
    features: [
      "isCustomerOrderEnable",
      "isCaptainDashboard",
      "isKitchenDashboard",
      "isTableManagement",
    ],
  },
  analytics: {
    title: "Analytics & Reporting",
    description: "Data insights and reporting capabilities",
    features: ["isAnalyticsDashboard", "isReportsExport", "isEmailReports"],
  },
  management: {
    title: "Management Tools",
    description: "Staff and inventory management",
    features: ["isStaffManagement", "isInventoryManagement"],
  },
  communication: {
    title: "Communication",
    description: "Customer communication features",
    features: ["isWhatsAppIntegration", "isSmsNotifications"],
  },
  premium: {
    title: "Premium Features",
    description: "Advanced customization and support",
    features: [
      "isMultiLanguage",
      "isCustomBranding",
      "is24x7Support",
      "isAPIAccess",
    ],
  },
};
