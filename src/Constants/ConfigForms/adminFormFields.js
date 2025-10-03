// Admin Form Fields Config with Authentication
export const adminFormFields = {
  // Personal Information Section
  personalInfo: [
    {
      name: "fullName",
      label: "Full Name",
      type: "text",
      placeholder: "Enter admin's full name",
      required: true,
      validation: {
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\s]+$/,
        message: "Name should contain only letters and spaces",
      },
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "Enter admin's email",
      required: true,
      validation: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Please enter a valid email address",
      },
      description: "This will be used as login username",
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "tel",
      placeholder: "Enter phone number",
      required: false,
      validation: {
        pattern: /^[\+]?[0-9]{10,15}$/,
        message: "Please enter a valid phone number",
      },
    },
    {
      name: "alternatePhone",
      label: "Alternate Phone",
      type: "tel",
      placeholder: "Enter alternate phone number",
      required: false,
      validation: {
        pattern: /^[\+]?[0-9]{10,15}$/,
        message: "Please enter a valid phone number",
      },
    },
  ],

  // Authentication Credentials Section - NEW
  authCredentials: [
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter secure password",
      required: true,
      validation: {
        minLength: 8,
        pattern:
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        message:
          "Password must contain at least 8 characters, including uppercase, lowercase, number, and special character",
      },
      description:
        "Minimum 8 characters with uppercase, lowercase, number, and special character",
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      placeholder: "Confirm the password",
      required: true,
      validation: {
        matchField: "password",
        message: "Passwords do not match",
      },
      description: "Re-enter the same password for confirmation",
    },
  ],

  // Role and Access Section
  roleAccess: [
    {
      name: "role",
      label: "Admin Role",
      type: "select",
      required: true,
      options: [
        { value: "super_admin", label: "Super Admin" },
        { value: "admin", label: "Admin" },
        { value: "manager", label: "Manager" },
        { value: "staff", label: "Staff" },
      ],
      defaultValue: "admin",
    },
    {
      name: "linkedHotelId",
      label: "Assign to Hotel",
      type: "select",
      required: false,
      options: [], // Will be populated dynamically with available hotels
      placeholder: "Select a hotel (optional)",
      description:
        "Leave empty if admin should not be linked to any specific hotel",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "suspended", label: "Suspended" },
      ],
      defaultValue: "active",
    },
    {
      name: "accountExpiresAt",
      label: "Account Expires",
      type: "date",
      required: false,
      description: "Leave empty for permanent account",
    },
  ],

  // Permissions Section
  permissions: [
    {
      name: "canManageMenu",
      label: "Can Manage Menu",
      type: "checkbox",
      description: "Allow admin to add, edit, and delete menu items",
      defaultValue: false,
    },
    {
      name: "canManageOrders",
      label: "Can Manage Orders",
      type: "checkbox",
      description: "Allow admin to view and manage customer orders",
      defaultValue: false,
    },
    {
      name: "canManageCaptains",
      label: "Can Manage Captains",
      type: "checkbox",
      description: "Allow admin to add, edit, and manage captain accounts",
      defaultValue: false,
    },
    {
      name: "canViewReports",
      label: "Can View Reports",
      type: "checkbox",
      description: "Allow admin to access sales and analytics reports",
      defaultValue: false,
    },
    {
      name: "canManageCategories",
      label: "Can Manage Categories",
      type: "checkbox",
      description: "Allow admin to create and manage menu categories",
      defaultValue: false,
    },
    {
      name: "canManageStaff",
      label: "Can Manage Staff",
      type: "checkbox",
      description: "Allow admin to manage other staff members",
      defaultValue: false,
    },
    {
      name: "canAccessSettings",
      label: "Can Access Settings",
      type: "checkbox",
      description: "Allow admin to modify hotel settings and configurations",
      defaultValue: false,
    },
    {
      name: "canManageInventory",
      label: "Can Manage Inventory",
      type: "checkbox",
      description: "Allow admin to track and manage inventory",
      defaultValue: false,
    },
  ],

  // Additional Information Section
  additionalInfo: [
    {
      name: "department",
      label: "Department",
      type: "select",
      required: false,
      options: [
        { value: "management", label: "Management" },
        { value: "operations", label: "Operations" },
        { value: "kitchen", label: "Kitchen" },
        { value: "service", label: "Service" },
        { value: "accounts", label: "Accounts" },
        { value: "marketing", label: "Marketing" },
      ],
      placeholder: "Select department",
    },
    {
      name: "dateOfJoining",
      label: "Date of Joining",
      type: "date",
      required: false,
      defaultValue: new Date().toISOString().split("T"),
    },
    {
      name: "address",
      label: "Address",
      type: "textarea",
      placeholder: "Enter complete address",
      required: false,
      rows: 3,
      validation: {
        maxLength: 500,
        message: "Address should be less than 500 characters",
      },
    },
    {
      name: "emergencyContact",
      label: "Emergency Contact",
      type: "text",
      placeholder: "Emergency contact person and number",
      required: false,
    },
    {
      name: "notes",
      label: "Additional Notes",
      type: "textarea",
      placeholder: "Any additional information about the admin",
      required: false,
      rows: 3,
      validation: {
        maxLength: 1000,
        message: "Notes should be less than 1000 characters",
      },
    },
  ],
};

// Form sections configuration with Authentication
export const adminFormSections = [
  {
    title: "Personal Information",
    description: "Basic details of the admin",
    fields: "personalInfo",
    icon: "User",
    required: true,
  },
  {
    title: "Authentication Credentials",
    description: "Login credentials and security settings",
    fields: "authCredentials",
    icon: "Key",
    required: true,
  },
  {
    title: "Role & Access",
    description: "Admin role and hotel assignment",
    fields: "roleAccess",
    icon: "Shield",
    required: true,
  },
  {
    title: "Permissions",
    description: "Define what the admin can access and manage",
    fields: "permissions",
    icon: "Key",
  },
  {
    title: "Additional Information",
    description: "Optional additional details",
    fields: "additionalInfo",
    icon: "Info",
    optional: true,
  },
];

// Initial form values with authentication
export const adminFormInitialValues = {
  // Personal Info
  fullName: "",
  email: "",
  phone: "",
  alternatePhone: "",

  // Authentication
  password: "",
  confirmPassword: "",

  // Role & Access
  role: "admin",
  linkedHotelId: "",
  status: "active",
  accountExpiresAt: "",

  // Additional Info
  department: "",
  dateOfJoining: new Date().toISOString().split("T"),
  address: "",
  emergencyContact: "",
  notes: "",

  // Permissions
  canManageMenu: false,
  canManageOrders: false,
  canManageCaptains: false,
  canViewReports: false,
  canManageCategories: false,
  canManageStaff: false,
  canAccessSettings: false,
  canManageInventory: false,
};

// Enhanced validation schema with password validation
export const getAdminValidationSchema = () => {
  return {
    validate: (values) => {
      const newErrors = {};

      // Personal Information Validation
      if (!values.fullName?.trim()) {
        newErrors.fullName = "Full name is required";
      } else if (values.fullName.length < 2) {
        newErrors.fullName = "Full name must be at least 2 characters";
      } else if (!/^[a-zA-Z\s]+$/.test(values.fullName)) {
        newErrors.fullName = "Name should contain only letters and spaces";
      }

      if (!values.email?.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      // Authentication Validation
      if (!values.password?.trim()) {
        newErrors.password = "Password is required";
      } else if (values.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long";
      } else if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
          values.password,
        )
      ) {
        newErrors.password =
          "Password must contain uppercase, lowercase, number, and special character";
      }

      if (!values.confirmPassword?.trim()) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (values.password !== values.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      // Role validation
      if (!values.role) {
        newErrors.role = "Role is required";
      }

      if (!values.status) {
        newErrors.status = "Status is required";
      }

      // Phone validation (if provided)
      if (values.phone && !/^[\+]?[0-9]{10,15}$/.test(values.phone)) {
        newErrors.phone = "Please enter a valid phone number";
      }

      if (
        values.alternatePhone &&
        !/^[\+]?[0-9]{10,15}$/.test(values.alternatePhone)
      ) {
        newErrors.alternatePhone = "Please enter a valid phone number";
      }

      // Address length validation
      if (values.address && values.address.length > 500) {
        newErrors.address = "Address should be less than 500 characters";
      }

      if (values.notes && values.notes.length > 1000) {
        newErrors.notes = "Notes should be less than 1000 characters";
      }

      // Account expiry validation
      if (values.accountExpiresAt) {
        const expiryDate = new Date(values.accountExpiresAt);
        const today = new Date();
        if (expiryDate <= today) {
          newErrors.accountExpiresAt = "Expiry date must be in the future";
        }
      }

      return newErrors;
    },
  };
};

// Permission presets for different roles with enhanced permissions
export const rolePermissionPresets = {
  super_admin: {
    canManageMenu: true,
    canManageOrders: true,
    canManageCaptains: true,
    canViewReports: true,
    canManageCategories: true,
    canManageStaff: true,
    canAccessSettings: true,
    canManageInventory: true,
  },
  admin: {
    canManageMenu: true,
    canManageOrders: true,
    canManageCaptains: true,
    canViewReports: true,
    canManageCategories: true,
    canManageStaff: false,
    canAccessSettings: false,
    canManageInventory: true,
  },
  manager: {
    canManageMenu: true,
    canManageOrders: true,
    canManageCaptains: false,
    canViewReports: true,
    canManageCategories: false,
    canManageStaff: false,
    canAccessSettings: false,
    canManageInventory: false,
  },
  staff: {
    canManageMenu: false,
    canManageOrders: true,
    canManageCaptains: false,
    canViewReports: false,
    canManageCategories: false,
    canManageStaff: false,
    canAccessSettings: false,
    canManageInventory: false,
  },
};

// Password generation utility
export const generateSecurePassword = () => {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "@$!%*?&";

  const allChars = lowercase + uppercase + numbers + symbols;

  let password = "";

  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill remaining characters
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
};

export default {
  adminFormFields,
  adminFormSections,
  adminFormInitialValues,
  getAdminValidationSchema,
  rolePermissionPresets,
  generateSecurePassword,
};
