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
  TableProperties,
  UserPlus,
} from "lucide-react";
import { useTranslation } from "react-i18next";
// Role-based theme configurations
export const getRoleThemes = (t) => ({
  admin: {
    title: t("sidebar.adminPanel"),
    subtitle: t("sidebar.adminPanelDec"),
    gradient: "from-orange-500 to-amber-500",
    bgGradient: "from-orange-50 to-amber-50",
    iconBg: "from-orange-200 to-amber-200",
    activeBg: "from-orange-100 to-amber-100",
    textColor: "text-orange-800",
    borderColor: "border-orange-200",
  },
  superAdmin: {
    title: t("sidebar.superAdminPanel"),
    subtitle: t("sidebar.superAdminPanelDec"),
    gradient: "from-blue-600 to-indigo-600",
    bgGradient: "from-blue-50 to-indigo-50",
    iconBg: "from-blue-200 to-indigo-200",
    activeBg: "from-blue-100 to-indigo-100",
    textColor: "text-blue-800",
    borderColor: "border-blue-200",
  },
  captain: {
    title: t("sidebar.captainPanel"),
    subtitle: t("sidebar.captainPanelDec"),
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-50 to-emerald-50",
    iconBg: "from-green-200 to-emerald-200",
    activeBg: "from-green-100 to-emerald-100",
    textColor: "text-green-800",
    borderColor: "border-green-200",
  },
});

// Admin menu items
export const adminMenuItems = (hotelName, t) => [
  {
    name: t("sidebar.dashboard"),
    path: `/${hotelName}/admin/dashboard`,
    icon: "dashboard", // assuming icon name matches your icon set
    description: t("sidebar.dashboardDesc"),
  },
  {
    name: t("sidebar.orderDashboard"),
    path: `/${hotelName}/admin/order-dashboard`,
    icon: "dashboard",
    description: t("sidebar.orderDashboardDesc"),
  },
  {
    name: t("sidebar.addCategory"),
    path: `/${hotelName}/admin/add-category`,
    icon: "category",
    description: t("sidebar.addCategoryDesc"),
  },
  // Uncomment or remove as needed
  // {
  //   name: t("sidebar.addOptions"),
  //   path: `/${hotelName}/admin/add-options`,
  //   icon: "options",
  //   description: t("sidebar.addOptionsDesc"),
  // },
  {
    name: t("sidebar.addMenu"),
    path: `/${hotelName}/admin/add-menu`,
    icon: "menu",
    description: t("sidebar.addMenuDesc"),
  },
  {
    name: t("sidebar.addOffers"),
    path: `/${hotelName}/admin/add-offers`,
    icon: "offers",
    description: t("sidebar.addOffersDesc"),
  },
  {
    name: t("sidebar.addCaptain"),
    path: `/${hotelName}/admin/add-captain`,
    icon: "addUser",
    description: t("sidebar.addCaptainDesc"),
  },
  {
    name: t("sidebar.kitchen"),
    path: `/${hotelName}/admin/kitchen`,
    icon: "kitchen",
    description: t("sidebar.kitchenDesc"),
  },
  {
    name: t("sidebar.preview"),
    path: `/viewMenu/${hotelName}/home`,
    icon: "preview",
    description: t("sidebar.previewDesc"),
  },
  {
    name: t("sidebar.settings"),
    path: `/${hotelName}/admin/profile`,
    icon: "settings",
    description: t("sidebar.settingsDesc"),
  },
];

// Super Admin menu items
export const superAdminMenuItems = (t, hotelName) => [
  {
    name: t("sidebar.dashboard"),
    path: "/super-admin/dashboard",
    icon: "dashboard",
    description: t("sidebar.dashboardDesc"),
  },
  {
    name: t("sidebar.addHotels"),
    path: "/super-admin/add-hotel",
    icon: "hotels",
    description: t("sidebar.addHotelsDesc"),
  },
  {
    name: t("sidebar.addAdmin"),
    path: "/super-admin/add-admin",
    icon: "users",
    description: t("sidebar.viewAdminsDesc"),
  },
  {
    name: t("sidebar.subscriptions"),
    path: "/super-admin/add-subscription-plan",
    icon: "subscriptions",
    description: t("sidebar.subscriptionsDesc"),
  },
];

// Captain menu items
export const captainMenuItems = (hotelName, t) => [
  {
    name: t("sidebar.dashboard"),
    path: `/viewMenu/${hotelName}/captain/dashboard`,
    icon: "dashboard",
    description: t("sidebar.dashboardDesc"),
  },
  // {
  //   name: t("sidebar.tables"),
  //   path: `/viewMenu/${hotelName}/captain/tables`,
  //   icon: "tables",
  //   description: t("sidebar.tablesDesc"),
  // },
  {
    name: t("sidebar.addOrder"),
    path: `/viewMenu/${hotelName}/captain/home`,
    icon: "addOrder",
    description: t("sidebar.addOrderDesc"),
  },
  {
    name: t("sidebar.myOrders"),
    path: `/viewMenu/${hotelName}/captain/my-orders`,
    icon: "orders",
    description: t("sidebar.myOrdersDesc"),
  },
  // {
  //   name: t("sidebar.kitchen"),
  //   path: `/viewMenu/${hotelName}/captain/kitchen`,
  //   icon: "kitchen",
  //   description: t("sidebar.kitchenDesc"),
  // },
  // {
  //   name: t("sidebar.bills"),
  //   path: `/viewMenu/${hotelName}/captain/bills`,
  //   icon: "bills",
  //   description: t("sidebar.billsDesc"),
  // },
];

// Icon mapping stays the same
export const iconMap = {
  dashboard: Home,
  settings: Settings,
  users: Users,
  category: BookOpen,
  options: Star,
  menu: UtensilsCrossed,
  offers: Tag,
  addUser: UserPlus,
  kitchen: ChefHat,
  preview: Eye,
  upload: Upload,
  hotels: Building,
  subscriptions: CreditCard,
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
export const getMenuItems = (role, t, hotelName = null) => {
  switch (role) {
    case "admin":
      return adminMenuItems(hotelName, t);
    case "captain":
      return captainMenuItems(hotelName, t);
    case "superAdmin":
    default:
      return superAdminMenuItems(t, hotelName);
  }
};
