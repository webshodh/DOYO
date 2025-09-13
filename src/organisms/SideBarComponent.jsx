import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useHotelSelection } from "context/HotelSelectionContext";
import {
  Home,
  Users,
  Settings,
  Bell,
  Book,
  DollarSign,
  Layers,
  CreditCard,
  BarChart2,
  FileText,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  X,
  Building,
  Star,
  Zap,
  Shield,
  Menu,
  LogOut,
  User,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  adminMenuItems,
  superAdminMenuItems,
  iconMap,
} from "../Constants/sideBarMenuConfig";

// Custom hook for outside click detection
const useOutsideClick = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

// Enhanced icon mapping with fallback
const enhancedIconMap = {
  dashboard: Home,
  users: Users,
  settings: Settings,
  notifications: Bell,
  book: Book,
  payments: DollarSign,
  inventory: Layers,
  billing: CreditCard,
  reports: BarChart2,
  menus: FileText,
  cart: ShoppingCart,
  building: Building,
  star: Star,
  zap: Zap,
  shield: Shield,
};

// Sidebar header component
const SidebarHeader = memo(({ admin, onClose }) => (
  <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200/50 bg-gradient-to-r from-orange-50 to-amber-50/80 relative">
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
        <Building className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-semibold text-gray-800 truncate">
          {admin ? "Admin Panel" : "Super Admin"}
        </h2>
        <p className="text-xs text-gray-600 hidden sm:block">
          Management Dashboard
        </p>
      </div>
    </div>

    <button
      onClick={onClose}
      className="lg:hidden p-2 rounded-xl hover:bg-white/80 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 group"
      aria-label="Close sidebar"
    >
      <X className="w-5 h-5 text-gray-700 group-hover:text-gray-900 transition-colors" />
    </button>

    {/* Decorative bottom border */}
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500" />
  </div>
));

SidebarHeader.displayName = "SidebarHeader";

// Sidebar menu item component
const SidebarMenuItem = memo(({ item, onItemClick, isCollapsed = false }) => {
  const IconComponent = enhancedIconMap[item.icon] || Home;

  return (
    <li className="group">
      <NavLink
        to={item.path}
        onClick={onItemClick}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
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
            />

            {/* Icon container */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                isActive
                  ? "bg-orange-200/80 text-orange-700"
                  : "bg-gray-100 text-gray-500 group-hover:bg-orange-100 group-hover:text-orange-600"
              }`}
            >
              <IconComponent className="w-4 h-4" />
            </div>

            {/* Menu item text */}
            {!isCollapsed && (
              <span className="flex-1 font-semibold truncate">{item.name}</span>
            )}

            {/* Badge for beta/new features */}
            {item.badge && !isCollapsed && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                {item.badge}
              </span>
            )}

            {/* Chevron indicator for active items */}
            {isActive && !isCollapsed && (
              <ChevronRight className="w-4 h-4 text-orange-600 flex-shrink-0" />
            )}

            {/* Hover effect overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform transition-transform duration-500 ${
                isActive
                  ? "translate-x-0"
                  : "-translate-x-full group-hover:translate-x-full"
              }`}
            />
          </>
        )}
      </NavLink>
    </li>
  );
});

SidebarMenuItem.displayName = "SidebarMenuItem";

// Sidebar footer component
const SidebarFooter = memo(({ user, onLogout }) => (
  <div className="p-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-slate-50/80">
    {user && (
      <div className="mb-3 p-3 bg-white/60 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.displayName || "Admin"}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    )}

    <div className="text-center">
      <p className="text-xs text-gray-500 mb-2">Version 2.0.1</p>
      <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
        <Zap className="w-3 h-3" />
        <span>Powered by React</span>
      </div>
    </div>
  </div>
));

SidebarFooter.displayName = "SidebarFooter";

// Main Sidebar component
const Sidebar = memo(({ isOpen, onClose, admin = false }) => {
  const { hotelName } = useParams();
  const navigate = useNavigate();
  const { selectedHotel, user, availableHotels, selectHotel } =
    useHotelSelection();

  const [isHotelDropdownOpen, setIsHotelDropdownOpen] = useState(false);
  const hotelDropdownRef = useRef(null);

  // Outside click handler for hotel dropdown
  useOutsideClick(hotelDropdownRef, () => setIsHotelDropdownOpen(false));

  // Memoized menu items
  const menu = useMemo(() => {
    return admin ? adminMenuItems(hotelName) : superAdminMenuItems;
  }, [admin, hotelName]);

  // Event handlers
  const handleItemClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleHotelSwitch = useCallback(
    async (hotel) => {
      try {
        selectHotel(hotel);
        setIsHotelDropdownOpen(false);
        navigate(`/${hotel.id}/admin/dashboard`);
        toast.success(`Switched to ${hotel.name}`);
      } catch (error) {
        console.error("Error switching hotel:", error);
        toast.error("Failed to switch hotel. Please try again.");
      }
    },
    [selectHotel, navigate]
  );

  const toggleHotelDropdown = useCallback(() => {
    setIsHotelDropdownOpen((prev) => !prev);
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={onClose}
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white/95 backdrop-blur-md shadow-2xl border-r border-gray-200/50 transform transition-all duration-300 ease-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:transform-none`}
        aria-hidden={!isOpen}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SidebarHeader admin={admin} onClose={onClose} />

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
            <div className="px-3 sm:px-4">
              <ul className="space-y-1">
                {menu.map((item) => (
                  <SidebarMenuItem
                    key={item.name}
                    item={item}
                    onItemClick={handleItemClick}
                  />
                ))}
              </ul>
            </div>
          </nav>

          {/* Footer */}
          <SidebarFooter user={user} />
        </div>
      </aside>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  );
});

Sidebar.displayName = "Sidebar";

// Default props
Sidebar.defaultProps = {
  isOpen: false,
  onClose: () => {},
  admin: false,
};

export default Sidebar;
