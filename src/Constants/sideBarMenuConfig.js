// src/constants/menuConfig.js
export const adminMenuItems = (hotelName) => [
  {
    name: "Dashboard",
    path: `/${hotelName}/admin/dashboard`,
    icon: "dashboard",
  },
  {
    name: "Add Category",
    path: `/${hotelName}/admin/add-category`,
    icon: "category",
  },
  // {
  //   name: "Add Special Category",
  //   path: `/${hotelName}/admin/add-special-category`,
  //   icon: "star",
  // },
  {
    name: "Add Options",
    path: `/${hotelName}/admin/add-options`,
    icon: "star",
  },
  {
    name: "Add Menu",
    path: `/${hotelName}/admin/add-menu`,
    icon: "menu",
  },
  {
    name: "Add Offers",
    path: `/${hotelName}/admin/add-offers`,
    icon: "offer",
  },
  {
    name: "Preview",
    path: `/viewMenu/${hotelName}/home`,
    icon: "preview",
  },
  {
    name: "Settings",
    path: `/${hotelName}/admin/settings`,
    icon: "settings",
  },
];

export const superAdminMenuItems = [
  {
    name: "Dashboard",
    path: `/super-admin/dashboard`,
    icon: "dashboard",
  },
  {
    name: "Add Hotel",
    path: `/super-admin/add-hotel`,
    icon: "hotel",
  },
  {
    name: "View Admins",
    path: `/super-admin/view-admin`,
    icon: "users",
  },
  {
    name: "Settings",
    path: `/super-admin/settings`,
    icon: "settings",
  },
];

// Centralized icon map
export const iconMap = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v4H8V5z" />
    </svg>
  ),
  category: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  // Add other icons here...
};
