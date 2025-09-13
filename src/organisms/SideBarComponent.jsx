import React, { useState, useCallback, useMemo, memo } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useHotelSelection } from "context/HotelSelectionContext";
import { X, Building, User, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import {
  roleThemes,
  iconMap,
  getRoleConfig,
  getMenuItems,
} from "../Constants/sideBarMenuConfig";
import SidebarHeader from "atoms/Headers/SidebarHeader";



// Menu item component
const MenuItem = memo(({ item, onClick, role }) => {
  const IconComponent = iconMap[item.icon] || iconMap.dashboard;
  const theme = roleThemes[role];

  return (
    <li>
      <NavLink
        to={item.path}
        onClick={onClick}
        className={({ isActive }) =>
          `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            isActive
              ? `bg-gradient-to-r ${theme.activeBg} ${theme.textColor} shadow-sm ${theme.borderColor} border`
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`
        }
        title={item.description}
      >
        {({ isActive }) => (
          <>
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                isActive
                  ? `bg-gradient-to-br ${theme.gradient} text-white shadow-sm`
                  : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
              }`}
            >
              <IconComponent className="w-4 h-4" />
            </div>
            <span className="flex-1 truncate">{item.name}</span>
            {item.badge && (
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {item.badge}
              </span>
            )}
          </>
        )}
      </NavLink>
    </li>
  );
});

MenuItem.displayName = "MenuItem";

// Hotel selector component
const HotelSelector = memo(
  ({ selectedHotel, availableHotels, onHotelChange, role }) => {
    const [isOpen, setIsOpen] = useState(false);
    const theme = roleThemes[role];

    if (!availableHotels?.length > 1) return null;

    return (
      <div className="p-3 border-t border-gray-200 bg-gray-50/50">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200 text-sm hover:bg-gray-50 transition-colors"
          >
            <span className="truncate">
              {selectedHotel?.name || "Select Hotel"}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-32 overflow-y-auto z-50">
              {availableHotels.map((hotel) => (
                <button
                  key={hotel.id}
                  onClick={() => {
                    onHotelChange(hotel);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gradient-to-r hover:${theme.bgGradient} first:rounded-t-lg last:rounded-b-lg transition-colors`}
                >
                  {hotel.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

HotelSelector.displayName = "HotelSelector";

// User info component
const UserInfo = memo(({ user, role }) => {
  const theme = roleThemes[role];

  if (!user) return null;

  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded-lg mb-2">
      <div
        className={`w-6 h-6 bg-gradient-to-br ${theme.gradient} rounded-full flex items-center justify-center`}
      >
        <User className="w-3 h-3 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-900 truncate">
          {user.displayName || "User"}
        </p>
        <p className="text-xs text-gray-500 truncate">{user.email}</p>
      </div>
    </div>
  );
});

UserInfo.displayName = "UserInfo";

// Main Sidebar component
const Sidebar = memo(({ isOpen, onClose, admin = false, captain = false }) => {
  const { hotelName } = useParams();
  const navigate = useNavigate();
  const { selectedHotel, user, availableHotels, selectHotel } =
    useHotelSelection();

  // Determine role and get configuration
  const role = getRoleConfig(admin, captain);
  const menuItems = useMemo(
    () => getMenuItems(role, hotelName),
    [role, hotelName]
  );

  // Event handlers
  const handleItemClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleHotelChange = useCallback(
    async (hotel) => {
      try {
        selectHotel(hotel);
        const basePath = role === "captain" ? "captain" : "admin";
        navigate(`/${hotel.id}/${basePath}/dashboard`);
        toast.success(`Switched to ${hotel.name}`);
      } catch (error) {
        console.error("Hotel switch error:", error);
        toast.error("Failed to switch hotel");
      }
    },
    [selectHotel, navigate, role]
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SidebarHeader role={role} onClose={onClose} />

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <MenuItem
                  key={item.name}
                  item={item}
                  onClick={handleItemClick}
                  role={role}
                />
              ))}
            </ul>
          </nav>

          {/* Hotel Selector */}
          {(admin || captain) && (
            <HotelSelector
              selectedHotel={selectedHotel}
              availableHotels={availableHotels}
              onHotelChange={handleHotelChange}
              role={role}
            />
          )}

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50/50">
            <UserInfo user={user} role={role} />
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Version 2.1.0</p>
              <p className="text-xs text-gray-500">Restaurant Management</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
});

Sidebar.displayName = "Sidebar";

export default Sidebar;
