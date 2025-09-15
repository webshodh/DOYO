// src/constants/menuConfig.js
import {
  Home,
  Users,
  Settings,
  Building,
  Plus,
  Star,
  BookOpen,
  Tag,
  ChefHat,
  Upload,
  Eye,
  CreditCard,
  UtensilsCrossed,
  ClipboardList,
  Receipt,
  MessageSquare,
  BarChart3,
  TableProperties,
  ShoppingCart,
  UserPlus,
} from "lucide-react";

// Role-based theme configurations
export const roleThemes = {
  admin: {
    title: "Admin Panel",
    subtitle: "Hotel Management",
    gradient: "from-orange-500 to-amber-500",
    bgGradient: "from-orange-50 to-amber-50",
    iconBg: "from-orange-200 to-amber-200",
    activeBg: "from-orange-100 to-amber-100",
    textColor: "text-orange-800",
    borderColor: "border-orange-200",
  },
  superAdmin: {
    title: "Super Admin",
    subtitle: "System Control",
    gradient: "from-blue-600 to-indigo-600",
    bgGradient: "from-blue-50 to-indigo-50",
    iconBg: "from-blue-200 to-indigo-200",
    activeBg: "from-blue-100 to-indigo-100",
    textColor: "text-blue-800",
    borderColor: "border-blue-200",
  },
  captain: {
    title: "Captain Panel",
    subtitle: "Floor Management",
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-50 to-emerald-50",
    iconBg: "from-green-200 to-emerald-200",
    activeBg: "from-green-100 to-emerald-100",
    textColor: "text-green-800",
    borderColor: "border-green-200",
  },
};

// Admin menu items
export const adminMenuItems = (hotelName) => [
  {
    name: "Dashboard",
    path: `/${hotelName}/admin/dashboard`,
    icon: "dashboard",
    description: "Overview and analytics",
  },
 
  {
    name: "Add Category",
    path: `/${hotelName}/admin/add-category`,
    icon: "category",
    description: "Manage food categories",
  },
  {
    name: "Add Options",
    path: `/${hotelName}/admin/add-options`,
    icon: "options",
    description: "Menu customization options",
  },
  {
    name: "Add Menu",
    path: `/${hotelName}/admin/add-menu`,
    icon: "menu",
    description: "Create menu items",
  },
  {
    name: "Add Offers",
    path: `/${hotelName}/admin/add-offers`,
    icon: "offers",
    description: "Promotional deals",
  },
  {
    name: "Add Captain",
    path: `/${hotelName}/admin/add-captain`,
    icon: "addUser",
    description: "Manage staff members",
  },
  // {
  //   name: "Kitchen",
  //   path: `/${hotelName}/admin/kitchen`,
  //   icon: "kitchen",
  //   description: "Kitchen operations",
  // },
  {
    name: "Preview",
    path: `/viewMenu/${hotelName}/home`,
    icon: "preview",
    description: "View customer menu",
  },
  {
    name: "Settings",
    path: `/${hotelName}/admin/profile`,
    icon: "settings",
    description: "System configuration",
  },
];

// Super Admin menu items
export const superAdminMenuItems = [
  {
    name: "Dashboard",
    path: "/super-admin/dashboard",
    icon: "dashboard",
    description: "System overview",
  },
  {
    name: "Add Hotels",
    path: "/super-admin/view-hotel",
    icon: "hotels",
    description: "Manage properties",
  },
  {
    name: "View Admins",
    path: "/super-admin/view-admin",
    icon: "users",
    description: "Administrator accounts",
  },
  {
    name: "Subscriptions",
    path: "/super-admin/view-hotel-subscriptions",
    icon: "subscriptions",
    description: "Billing and plans",
  },
];

// Captain menu items
export const captainMenuItems = (hotelName) => [
  {
    name: "Dashboard",
    path: `/viewMenu/${hotelName}/captain/dashboard`,
    icon: "dashboard",
    description: "Floor overview",
  },
  // {
  //   name: "Tables",
  //   path: `/viewMenu/${hotelName}/captain/tables`,
  //   icon: "tables",
  //   description: "Table management",
  // },
  {
    name: "Add Order",
    path: `/viewMenu/${hotelName}/captain/home`,
    icon: "addOrder",
    description: "Take new orders",
  },
  {
    name: "My Orders",
    path: `/viewMenu/${hotelName}/captain/my-orders`,
    icon: "orders",
    description: "Track active orders",
  },

  // {
  //   name: "Kitchen",
  //   path: `/viewMenu/${hotelName}/captain/kitchen`,
  //   icon: "kitchen",
  //   description: "Kitchen communication",
  // },
  {
    name: "Bills",
    path: `/viewMenu/${hotelName}/captain/bills`,
    icon: "bills",
    description: "Payment processing",
  },
];

// Centralized icon mapping with modern Lucide icons
export const iconMap = {
  // Common icons
  dashboard: Home,
  settings: Settings,
  users: Users,

  // Admin specific
  category: BookOpen,
  options: Star,
  menu: UtensilsCrossed,
  offers: Tag,
  addUser: UserPlus,
  kitchen: ChefHat,
  preview: Eye,
  upload: Upload,

  // Super Admin specific
  hotels: Building,
  subscriptions: CreditCard,

  // Captain specific
  tables: TableProperties,
  addOrder: Plus,
  orders: ClipboardList,
  bills: Receipt,
  messages: MessageSquare,
};

// Get role configuration
export const getRoleConfig = (admin = false, captain = false) => {
  if (captain) return "captain";
  if (admin) return "admin";
  return "superAdmin";
};

// Get menu items based on role
export const getMenuItems = (role, hotelName = null) => {
  switch (role) {
    case "admin":
      return adminMenuItems(hotelName);
    case "captain":
      return captainMenuItems(hotelName);
    case "superAdmin":
    default:
      return superAdminMenuItems;
  }
};
