// sidebarMenus.js
export const sidebarMenus = {
  superAdmin: [
    {
      id: "admin-dashboard",
      label: "Dashboard",
      icon: "bi bi-house",
      path: (hotelName) => `/${hotelName}/admin/admin-dashboard`,
      pathMatch: "/viewMenu/",
    },
    {
      id: "add-category",
      label: "Add Category",
      icon: "bi bi-grid",
      path: (hotelName) => `/${hotelName}/admin/add-category`,
      pathMatch: "/admin/admin-dashboard",
    },
    {
      id: "add-special-category",
      label: "Add Special Category",
      icon: "bi bi-grid",
      path: (hotelName) => `/${hotelName}/admin/add-special-category`,
      pathMatch: "/admin/admin-dashboard",
    },
    {
      id: "add-menu",
      label: "Add Menu",
      icon: "bi bi-grid",
      path: (hotelName) => `/${hotelName}/admin/add-menu`,
      pathMatch: "/admin/admin-dashboard",
    },
  ],

  admin: [
    {
      id: "super-admin-dashboard",
      label: "Dashboard",
      icon: "bi bi-grid",
      path: () => "/super-admin/dashboard",
      pathMatch: "/super-admin/dashboard",
    },
    {
      id: "admin-list",
      label: "Admin List",
      icon: "bi bi-speedometer2",
      path: () => `/super-admin/dashboard/admin-list`,
      pathMatch: "/super-admin/dashboard/admin-list",
    },
    {
      id: "add-hotel",
      label: "Add Hotel",
      icon: "bi bi-speedometer2",
      path: () => `/super-admin/dashboard/add-hotel`,
      pathMatch: "/super-admin/dashboard/add-hotel",
    },
  ],
};
