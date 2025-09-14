import { FaUserShield, FaUserTie, FaConciergeBell } from "react-icons/fa";

export const LOGIN_CONFIGS = {
  admin: {
    title: "Admin Login",
    subtitle: "Log in to access your administrative dashboard",
    icon: FaUserShield,
    iconColor: "text-orange-600 dark:text-orange-400",
    titleColor: "text-orange-600 dark:text-orange-400",
    buttonText: "Login as Admin",
    buttonColor: "bg-orange-500",
    buttonHover: "bg-orange-600",
    buttonActive: "bg-orange-700",
    rightPanelBg: "bg-gradient-to-br from-orange-400 to-orange-600",
    rightPanelIcon: FaUserShield,
    rightPanelTitle: "Administrative Access",
    rightPanelSubtitle: "Secure. Reliable. Professional.",
    rightPanelImage: "/admin-dashboard.jpg",
    imageAlt: "Admin Dashboard",
    securityNotice:
      "Secure admin portal - Access level determined by credentials",
    features: [
      "Full system access",
      "Analytics & Reports",
      "User Management",
      "System Configuration",
    ],
  },
  superadmin: {
    title: "Super Admin Login",
    subtitle: "Ultimate access to system administration",
    icon: FaUserTie,
    iconColor: "text-purple-600 dark:text-purple-400",
    titleColor: "text-purple-600 dark:text-purple-400",
    buttonText: "Login as Super Admin",
    buttonColor: "bg-purple-500",
    buttonHover: "bg-purple-600",
    buttonActive: "bg-purple-700",
    rightPanelBg: "bg-gradient-to-br from-purple-500 to-indigo-600",
    rightPanelIcon: FaUserTie,
    rightPanelTitle: "Supreme Control",
    rightPanelSubtitle: "Master. Command. Control.",
    rightPanelImage: "/superadmin-control.jpg",
    imageAlt: "Super Admin Control Panel",
    securityNotice: "Maximum security clearance - Complete system authority",
    features: [
      "Multi-tenant management",
      "Global configurations",
      "System monitoring",
      "Advanced analytics",
    ],
  },
  waiter: {
    title: "Waiter Login",
    subtitle: "Access your service management portal",
    icon: FaConciergeBell,
    iconColor: "text-green-600 dark:text-green-400",
    titleColor: "text-green-600 dark:text-green-400",
    buttonText: "Login as Waiter",
    buttonColor: "bg-green-500",
    buttonHover: "bg-green-600",
    buttonActive: "bg-green-700",
    rightPanelBg: "bg-gradient-to-br from-green-400 to-teal-500",
    rightPanelIcon: FaConciergeBell,
    rightPanelTitle: "Service Excellence",
    rightPanelSubtitle: "Serve. Smile. Succeed.",
    rightPanelImage: "/waiter-service.jpg",
    imageAlt: "Waiter Service Interface",
    securityNotice: "Service portal - Enhanced customer experience tools",
    features: [
      "Order management",
      "Table assignments",
      "Customer preferences",
      "Service tracking",
    ],
  },
};

export const getUserType = (pathname) => {
  if (pathname.includes("super-admin")) return "superadmin";
  if (pathname.includes("waiter") || pathname.includes("captain"))
    return "waiter";
  return "admin";
};
