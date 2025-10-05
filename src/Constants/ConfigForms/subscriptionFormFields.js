// config/subscriptionFormFields.js

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

  // Core Restaurant Features (Boolean Flags)
  coreFeatures: [
    {
      name: "isCustomerOrderEnable",
      label: "Customer Online Ordering",
      type: "checkbox",
      description: "Allow customers to place orders through QR codes/online",
      defaultValue: false,
    },
    {
      name: "isCaptainDashboard",
      label: "Captain/Waiter Dashboard",
      type: "checkbox",
      description: "Access to captain/waiter dashboard and order management",
      defaultValue: false,
    },
    {
      name: "isKitchenDashboard",
      label: "Kitchen Display System",
      type: "checkbox",
      description: "Kitchen order management and preparation tracking",
      defaultValue: false,
    },
    {
      name: "isOrderDashboard",
      label: "Order Management Dashboard",
      type: "checkbox",
      description: "Complete order tracking and management system",
      defaultValue: false,
    },
  ],

  // Analytics & Reports Features
  analyticsFeatures: [
    {
      name: "isAnalyticsDashboard",
      label: "Analytics Dashboard",
      type: "checkbox",
      description: "Sales analytics, reports, and business insights",
      defaultValue: false,
    },
    {
      name: "isReportsExport",
      label: "Export Reports",
      type: "checkbox",
      description: "Export reports to PDF, Excel, CSV formats",
      defaultValue: false,
    },
    {
      name: "isSalesReports",
      label: "Advanced Sales Reports",
      type: "checkbox",
      description: "Detailed sales analysis and trending reports",
      defaultValue: false,
    },
    {
      name: "isCustomerInsights",
      label: "Customer Insights",
      type: "checkbox",
      description: "Customer behavior analysis and preferences tracking",
      defaultValue: false,
    },
  ],

  // Communication & Integration Features
  integrationFeatures: [
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
      description: "Send SMS notifications to customers and staff",
      defaultValue: false,
    },
    {
      name: "isEmailReports",
      label: "Email Reports & Notifications",
      type: "checkbox",
      description: "Automated email reports and customer notifications",
      defaultValue: false,
    },
    {
      name: "isMultiLanguage",
      label: "Multi-Language Support",
      type: "checkbox",
      description: "Support for multiple languages and localization",
      defaultValue: false,
    },
    {
      name: "is24x7Support",
      label: "24x7 Premium Support",
      type: "checkbox",
      description: "Round the clock priority customer support",
      defaultValue: false,
    },
  ],

  // Usage Limits & Quotas
  usageLimits: [
    {
      name: "maxAdmins",
      label: "Maximum Admin Users",
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
      label: "Maximum Menu Categories",
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
      placeholder: "Total menu items allowed",
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
      label: "Maximum Captains/Waiters",
      type: "number",
      placeholder: "Number of captain accounts allowed",
      required: true,
      min: 0,
      max: 100,
      defaultValue: 2,
      validation: {
        min: 0,
        max: 100,
        message: "Must be between 0-100 captains",
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
      name: "maxOrders",
      label: "Monthly Order Limit",
      type: "number",
      placeholder: "Maximum orders per month",
      required: true,
      min: 10,
      max: 100000,
      defaultValue: 1000,
      validation: {
        min: 10,
        max: 100000,
        message: "Must be between 10-100000 orders",
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
    title: "Core Restaurant Features",
    description: "Essential features for restaurant management",
    fields: "coreFeatures",
    icon: "Star",
  },
  {
    title: "Analytics & Reports",
    description: "Business intelligence and reporting features",
    fields: "analyticsFeatures",
    icon: "BarChart",
  },
  {
    title: "Integration & Communication",
    description: "Third-party integrations and communication tools",
    fields: "integrationFeatures",
    icon: "Zap",
  },
  {
    title: "Usage Limits & Quotas",
    description: "Set limits for different resources and usage",
    fields: "usageLimits",
    icon: "Settings",
  },
];

// Updated initial form values
export const subscriptionFormInitialValues = {
  // Basic info
  planName: "",
  description: "",
  price: "",
  duration: 1,
  status: "active",

  // Core features
  isCustomerOrderEnable: false,
  isCaptainDashboard: false,
  isKitchenDashboard: false,
  isOrderDashboard: false,

  // Analytics features
  isAnalyticsDashboard: false,
  isReportsExport: false,
  isSalesReports: false,
  isCustomerInsights: false,

  // Integration features
  isWhatsAppIntegration: false,
  isSmsNotifications: false,
  isEmailReports: false,
  isMultiLanguage: false,
  is24x7Support: false,

  // Usage limits
  maxAdmins: 1,
  maxCategories: 5,
  maxMenuItems: 50,
  maxCaptains: 2,
  maxTables: 10,
  maxOrders: 1000,
  maxStorage: 1024,
};

// Updated predefined plan templates
export const planTemplates = {
  basic: {
    planName: "Basic Plan",
    description: "Essential features for small restaurants",
    price: 999,
    duration: 1,
    status: "active",

    // Core features - Basic plan has minimal features
    isCustomerOrderEnable: false,
    isCaptainDashboard: false,
    isKitchenDashboard: false,
    isOrderDashboard: true, // Basic order management

    // Analytics - Basic reporting only
    isAnalyticsDashboard: false,
    isReportsExport: false,
    isSalesReports: false,
    isCustomerInsights: false,

    // Integration - No integrations
    isWhatsAppIntegration: false,
    isSmsNotifications: false,
    isEmailReports: false,
    isMultiLanguage: false,
    is24x7Support: false,

    // Limits
    maxAdmins: 1,
    maxCategories: 15,
    maxMenuItems: 100,
    maxCaptains: 0,
    maxTables: 5,
    maxOrders: 500,
    maxStorage: 1024,
  },
  premium: {
    planName: "Premium Plan",
    description: "Advanced features for growing restaurants",
    price: 2499,
    duration: 1,
    status: "active",

    // Core features - Most features enabled
    isCustomerOrderEnable: true,
    isCaptainDashboard: true,
    isKitchenDashboard: true,
    isOrderDashboard: true,

    // Analytics - Advanced reporting
    isAnalyticsDashboard: true,
    isReportsExport: true,
    isSalesReports: true,
    isCustomerInsights: false,

    // Integration - Some integrations
    isWhatsAppIntegration: true,
    isSmsNotifications: false,
    isEmailReports: true,
    isMultiLanguage: true,
    is24x7Support: false,

    // Higher limits
    maxAdmins: 3,
    maxCategories: 50,
    maxMenuItems: 500,
    maxCaptains: 10,
    maxTables: 25,
    maxOrders: 2000,
    maxStorage: 3072,
  },
  enterprise: {
    planName: "Enterprise Plan",
    description: "Complete solution for restaurant chains",
    price: 4999,
    duration: 1,
    status: "active",

    // All core features enabled
    isCustomerOrderEnable: true,
    isCaptainDashboard: true,
    isKitchenDashboard: true,
    isOrderDashboard: true,

    // All analytics features
    isAnalyticsDashboard: true,
    isReportsExport: true,
    isSalesReports: true,
    isCustomerInsights: true,

    // All integration features
    isWhatsAppIntegration: true,
    isSmsNotifications: true,
    isEmailReports: true,
    isMultiLanguage: true,
    is24x7Support: true,

    // Maximum limits
    maxAdmins: 10,
    maxCategories: 200,
    maxMenuItems: 2000,
    maxCaptains: 50,
    maxTables: 100,
    maxOrders: 10000,
    maxStorage: 10240,
  },
};

export const getSubscriptionValidationSchema = () => {
  return {
    validate: (values) => {
      const errors = {};

      // Validate required basic info fields
      if (!values.planName || !values.planName.trim()) {
        errors.planName = "Plan name is required";
      } else if (values.planName.length < 2) {
        errors.planName = "Plan name must be at least 2 characters";
      } else if (values.planName.length > 50) {
        errors.planName = "Plan name must be less than 50 characters";
      }

      if (!values.description || !values.description.trim()) {
        errors.description = "Description is required";
      } else if (values.description.length < 10) {
        errors.description = "Description must be at least 10 characters";
      } else if (values.description.length > 500) {
        errors.description = "Description must be less than 500 characters";
      }

      // Validate price
      if (
        values.price === "" ||
        values.price === null ||
        values.price === undefined
      ) {
        errors.price = "Price is required";
      } else {
        const price = parseFloat(values.price);
        if (isNaN(price) || price < 0) {
          errors.price = "Price must be a valid positive number";
        }
      }

      // Validate duration
      if (!values.duration) {
        errors.duration = "Duration is required";
      } else {
        const duration = parseInt(values.duration);
        if (isNaN(duration) || duration < 1 || duration > 36) {
          errors.duration = "Duration must be between 1-36 months";
        }
      }

      // Validate usage limits
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
        { field: "maxCaptains", min: 0, max: 100, label: "Maximum captains" },
        { field: "maxTables", min: 1, max: 500, label: "Maximum tables" },
        {
          field: "maxOrders",
          min: 10,
          max: 100000,
          label: "Monthly order limit",
        },
        { field: "maxStorage", min: 100, max: 10240, label: "Storage limit" },
      ];

      limits.forEach(({ field, min, max, label }) => {
        const value = values[field];
        if (value === "" || value === null || value === undefined) {
          errors[field] = `${label} is required`;
        } else {
          const numValue = parseInt(value);
          if (isNaN(numValue) || numValue < min || numValue > max) {
            errors[field] = `${label} must be between ${min}-${max}`;
          }
        }
      });

      // Validate status
      if (!values.status) {
        errors.status = "Status is required";
      }

      return errors;
    },
  };
};

// Helper function to validate individual fields (optional)
export const validateField = (fieldName, value, allValues = {}) => {
  const schema = getSubscriptionValidationSchema();
  const errors = schema.validate({ ...allValues, [fieldName]: value });
  return errors[fieldName] || null;
};

// Helper function to check if form is valid
export const isFormValid = (values) => {
  const schema = getSubscriptionValidationSchema();
  const errors = schema.validate(values);
  return Object.keys(errors).length === 0;
};

// Helper function to get validation rules for a specific field
export const getFieldValidation = (fieldName) => {
  const field =
    subscriptionFormFields.basicInfo.find((f) => f.name === fieldName) ||
    subscriptionFormFields.coreFeatures.find((f) => f.name === fieldName) ||
    subscriptionFormFields.analyticsFeatures.find(
      (f) => f.name === fieldName
    ) ||
    subscriptionFormFields.integrationFeatures.find(
      (f) => f.name === fieldName
    ) ||
    subscriptionFormFields.usageLimits.find((f) => f.name === fieldName);

  return field ? field.validation : null;
};
