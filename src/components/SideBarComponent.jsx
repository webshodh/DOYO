import React, { useCallback, useMemo, memo } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useHotelSelection } from "context/HotelSelectionContext";
import { useHotelDetails } from "../hooks/useHotel"; // Add this import
import { User } from "lucide-react";
import { toast } from "react-toastify";
import {
  getRoleThemes,
  iconMap,
  getRoleConfig,
  getMenuItems,
} from "../Constants/sideBarMenuConfig";
import SidebarHeader from "atoms/Headers/SidebarHeader";
import { useTranslation } from "react-i18next";

// Menu item component
const MenuItem = memo(({ item, onClick, role, t }) => {
  const IconComponent = iconMap[item.icon] || iconMap.dashboard;
  const theme = getRoleThemes(t)[role];

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

// User info component
const UserInfo = memo(({ user, role, t }) => {
  const theme = getRoleThemes(t)[role];

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
  const { t } = useTranslation();

  // Get isOrderEnabled from hotel details
  const { isOrderEnabled } = useHotelDetails(hotelName);

  // Determine role and get configuration
  const role = getRoleConfig(admin, captain);

  // Filter menu items based on isOrderEnabled
  const menuItems = useMemo(() => {
    const allItems = getMenuItems(role, t, hotelName);

    // Items that should be hidden when isOrderEnabled is false
    const orderDependentPaths = [
      "pos-dashboard",
      "order-dashboard",
      "customer-dashboard",
      "add-captain",
      "kitchen",
    ];

    // For captain role, hide the entire menu if orders are disabled
    if (role === "captain" && !isOrderEnabled) {
      return [];
    }

    // For admin role, filter out order-dependent items
    if (role === "admin" && !isOrderEnabled) {
      return allItems.filter(
        (item) => !orderDependentPaths.some((path) => item.path.includes(path))
      );
    }

    return allItems;
  }, [role, hotelName, t, isOrderEnabled]);

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
            {menuItems.length > 0 ? (
              <ul className="space-y-1">
                {menuItems.map((item) => (
                  <MenuItem
                    key={item.name}
                    item={item}
                    onClick={handleItemClick}
                    role={role}
                    t={t}
                  />
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 px-4">
                <p className="text-sm text-gray-500">
                  {t("sidebar.noMenuItems", "No menu items available")}
                </p>
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50/50">
            <UserInfo user={user} role={role} t={t} />
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Version 2.1.0</p>
              <p className="text-xs text-gray-500">
                {t("sidebar.appName", "Restaurant Management")}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
});

Sidebar.displayName = "Sidebar";

export default Sidebar;
