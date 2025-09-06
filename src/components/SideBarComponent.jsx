import React from "react";
import { NavLink, useParams } from "react-router-dom";
import {
  adminMenuItems,
  superAdminMenuItems,
  iconMap,
} from "../Constants/sideBarMenuConfig";
import { useHotelSelection } from "Context/HotelSelectionContext";

const Sidebar = ({ isOpen, onClose, admin = false }) => {
  const { hotelName } = useParams(); // Will exist only for Admin routes
  const { selectedHotel, user } = useHotelSelection();
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
        className={`fixed left-0 top-0 h-full w-72 bg-white/95 backdrop-blur-md shadow-2xl border-r border-gray-200/50 transform transition-all duration-300 ease-out z-50  ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Header */}
          <div className="relative p-4 sm:p-6 border-b border-gray-200/50 bg-gradient-to-r from-orange-50 to-amber-50/80">
            {/* Hotel Name */}
            {admin && (
              <>
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 truncate">
                      {selectedHotel?.name || "Select Hotel"}
                    </h1>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      {admin ? "Admin Panel" : "Super Admin Panel"}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block text-left min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate max-w-20 lg:max-w-32">
                    Welcome, {user?.displayName?.split(" ")[0] || "Admin"}
                    <span className="text-xs text-gray-500 ml-2">● Online</span>
                  </p>
                </div>
              </>
            )}
            <div className="flex items-center justify-between">
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
              <ul style={{ marginLeft: "-2rem" }}>
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
          <div className="p-2 sm:p-6 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-slate-50/80">
            {/* Version info */}
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">Version 2.0.1</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
