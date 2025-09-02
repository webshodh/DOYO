import React from "react";
import { NavLink, useParams } from "react-router-dom";
import { adminMenuItems, superAdminMenuItems, iconMap } from "../Constants/sideBarMenuConfig";

const Sidebar = ({ isOpen, onClose, admin = false }) => {
  const { hotelName } = useParams(); // Will exist only for Admin routes

  // Select menu set dynamically
  const menu = admin ? adminMenuItems(hotelName) : superAdminMenuItems;

  return (
    <>
      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">
              {admin ? "Admin Panel" : "Super Admin Panel"}
            </h3>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {menu.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? "bg-orange-100 text-orange-700 border-r-2 border-orange-500"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`
                    }
                  >
                    <span className="flex-shrink-0">{iconMap[item.icon]}</span>
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
            Need help? Contact Support
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
