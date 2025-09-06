import React from "react";
import { NavLink, useParams } from "react-router-dom";
import {
  adminMenuItems,
  superAdminMenuItems,
  iconMap,
} from "../Constants/sideBarMenuConfig";

const Sidebar = ({ isOpen, onClose, admin = false }) => {
  const { hotelName } = useParams(); // Will exist only for Admin routes

  // Select menu set dynamically
  const menu = admin ? adminMenuItems(hotelName) : superAdminMenuItems;

  return (
    <>
      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-72 bg-white/95 backdrop-blur-md shadow-2xl border-r border-gray-200/50 transform transition-all duration-300 ease-out z-50 lg:translate-x-0 lg:static lg:z-auto lg:w-64 xl:w-72 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="relative p-4 sm:p-6 border-b border-gray-200/50 bg-gradient-to-r from-orange-50 to-amber-50/80">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {admin ? "Admin Panel" : "Super Admin Panel"}
                </h3>
                <p className="text-xs text-gray-600 font-medium">
                  {admin ? "Hotel Management" : "System Management"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-xl hover:bg-white/80 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 group"
                aria-label="Close sidebar"
              >
                <svg
                  className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Decorative element */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500"></div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
            <div className="px-3 sm:px-4">
              <ul style={{marginLeft:'-2rem'}}>
                {menu.map((item, index) => (
                  <li key={item.name} className="group">
                    <NavLink
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                          isActive
                            ? "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 shadow-sm border border-orange-200/50"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 hover:shadow-sm"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active indicator */}
                          <div
                            className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-orange-500 to-amber-500 rounded-r-full transition-all duration-300 ${
                              isActive
                                ? "opacity-100 translate-x-0"
                                : "opacity-0 -translate-x-2"
                            }`}
                          ></div>

                          {/* Icon container */}
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                              isActive
                                ? "bg-orange-200/80 text-orange-700"
                                : "bg-gray-100 text-gray-500 group-hover:bg-orange-100 group-hover:text-orange-600"
                            }`}
                          >
                            <div className="w-4 h-4">{iconMap[item.icon]}</div>
                          </div>

                          {/* Menu item text */}
                          <span className="flex-1 font-semibold truncate">
                            {item.name}
                          </span>

                          {/* Chevron indicator for active items */}
                          {isActive && (
                            <svg
                              className="w-4 h-4 text-orange-600 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          )}

                          {/* Hover effect overlay */}
                          <div
                            className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform transition-transform duration-500 ${
                              isActive
                                ? "translate-x-0"
                                : "-translate-x-full group-hover:translate-x-full"
                            }`}
                          ></div>
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-slate-50/80">
            <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl border border-gray-200/50">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">
                  Need Help?
                </p>
                <p className="text-xs text-gray-600">Contact Support Team</p>
              </div>
            </div>

            {/* Version info */}
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">Version 2.0.1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 10px;
          margin: 8px 0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #e2e8f0, #cbd5e1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #cbd5e1, #94a3b8);
        }
      `}</style>
    </>
  );
};

export default Sidebar;
