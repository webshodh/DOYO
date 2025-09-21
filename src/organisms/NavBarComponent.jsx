import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  memo,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import {
  Menu,
  X,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Building,
  ChevronDown,
  Check,
  AlertCircle,
  Loader,
} from "lucide-react";
import { useHotelSelection } from "../context/HotelSelectionContext";
import { toast } from "react-toastify";
import LanguageSelector from "atoms/Selector/LanguageSelector";

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

// Menu toggle button component
const MenuToggleButton = memo(({ onToggle, isOpen }) => (
  <button
    onClick={onToggle}
    className="lg:hidden p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200"
    aria-label={isOpen ? "Close menu" : "Open menu"}
    aria-expanded={isOpen}
  >
    <div className="relative w-6 h-6">
      <span
        className={`absolute block w-6 h-0.5 bg-gray-600 transform transition-all duration-300 ${
          isOpen ? "rotate-45 top-3" : "top-1"
        }`}
      />
      <span
        className={`absolute block w-6 h-0.5 bg-gray-600 transform transition-all duration-300 ${
          isOpen ? "opacity-0" : "top-3"
        }`}
      />
      <span
        className={`absolute block w-6 h-0.5 bg-gray-600 transform transition-all duration-300 ${
          isOpen ? "-rotate-45 top-3" : "top-5"
        }`}
      />
    </div>
  </button>
));

MenuToggleButton.displayName = "MenuToggleButton";

// Hotel switcher dropdown component
const HotelSwitcher = memo(
  ({
    selectedHotel,
    availableHotels,
    onHotelSwitch,
    isOpen,
    onToggle,
    dropdownRef,
  }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleHotelSwitch = useCallback(
      async (hotel) => {
        setIsLoading(true);
        try {
          await onHotelSwitch(hotel);
        } finally {
          setIsLoading(false);
        }
      },
      [onHotelSwitch]
    );

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm font-medium"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <Building className="w-4 h-4 text-gray-600" />
          <span className="hidden sm:inline text-gray-700">Switch Hotel</span>
          <span className="sm:hidden text-gray-700">Switch</span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <>
            {/* Mobile backdrop */}
            <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden" />

            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
              <div className="p-2">
                {/* Header */}
                <div className="px-3 py-2 border-b border-gray-100 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                      Available Hotels
                    </span>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                      {availableHotels.length}
                    </span>
                  </div>
                </div>

                {/* Hotel list */}
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {availableHotels.map((hotel) => (
                    <button
                      key={hotel.id}
                      onClick={() => handleHotelSwitch(hotel)}
                      disabled={isLoading}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                        selectedHotel?.id === hotel.id
                          ? "bg-orange-50 border border-orange-200 text-orange-800"
                          : "hover:bg-gray-50 text-gray-700"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          selectedHotel?.id === hotel.id
                            ? "bg-orange-200 text-orange-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Building className="w-4 h-4" />
                      </div>
                      <span className="flex-1 font-medium truncate">
                        {hotel.name}
                      </span>
                      {selectedHotel?.id === hotel.id && (
                        <Check className="w-4 h-4 text-orange-600 flex-shrink-0" />
                      )}
                      {isLoading && (
                        <Loader className="w-4 h-4 animate-spin text-gray-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);

HotelSwitcher.displayName = "HotelSwitcher";

// User avatar component
const UserAvatar = memo(({ user, size = "md" }) => {
  const getUserInitials = useCallback(() => {
    if (user?.displayName) {
      return user.displayName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "A";
  }, [user]);

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-9 h-9 text-sm",
    lg: "w-10 h-10 text-base",
  };

  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg relative`}
    >
      {getUserInitials()}
      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
    </div>
  );
});

UserAvatar.displayName = "UserAvatar";

// Profile dropdown component
const ProfileDropdown = memo(
  ({
    user,
    isOpen,
    onToggle,
    onEditProfile,
    onLogout,
    dropdownRef,
    isLoggingOut = false,
  }) => (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Profile menu"
      >
        <UserAvatar user={user} />
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 hidden sm:block ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden" />

          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            <div className="p-2">
              {/* User info */}
              <div className="px-3 py-3 border-b border-gray-100 mb-2">
                <div className="flex items-center gap-3">
                  <UserAvatar user={user} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {user?.displayName || "Admin User"}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="space-y-1">
                <button
                  onClick={onEditProfile}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-gray-50 text-gray-700 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <span className="font-medium">Edit Profile</span>
                </button>

                <button
                  onClick={onLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-red-50 text-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                    {isLoggingOut ? (
                      <Loader className="w-4 h-4 text-red-500 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <span className="font-medium">
                    {isLoggingOut ? "Signing out..." : "Sign Out"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
);

ProfileDropdown.displayName = "ProfileDropdown";

// Main Navbar component
const Navbar = memo(({ onMenuToggle, isSidebarOpen, admin }) => {
  const navigate = useNavigate();
  const auth = getAuth();
  const { selectedHotel, availableHotels, selectHotel, user } =
    useHotelSelection();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isHotelDropdownOpen, setIsHotelDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const profileDropdownRef = useRef(null);
  const hotelDropdownRef = useRef(null);

  // Outside click handlers
  useOutsideClick(profileDropdownRef, () => setIsProfileDropdownOpen(false));
  useOutsideClick(hotelDropdownRef, () => setIsHotelDropdownOpen(false));

  // Memoized handlers
  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      // localStorage.removeItem("selectedHotel");
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error logging out. Please try again.");
    } finally {
      setIsLoggingOut(false);
      setIsProfileDropdownOpen(false);
    }
  }, [auth, navigate]);

  const handleEditProfile = useCallback(() => {
    setIsProfileDropdownOpen(false);
    if (selectedHotel?.id) {
      navigate(`/${selectedHotel.id}/admin/profile`);
    }
  }, [navigate, selectedHotel]);

  const handleHotelSwitch = useCallback(
    async (hotel) => {
      try {
        selectHotel(hotel);
        setIsHotelDropdownOpen(false);
        navigate(`/${hotel.id}/admin/dashboard`);
        toast.success(`Switched to ${hotel.name}`);
      } catch (error) {
        console.error("Hotel switch error:", error);
        toast.error("Failed to switch hotel. Please try again.");
      }
    },
    [selectHotel, navigate]
  );

  const toggleProfileDropdown = useCallback(() => {
    setIsProfileDropdownOpen((prev) => !prev);
    setIsHotelDropdownOpen(false);
  }, []);

  const toggleHotelDropdown = useCallback(() => {
    setIsHotelDropdownOpen((prev) => !prev);
    setIsProfileDropdownOpen(false);
  }, []);

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center gap-4 flex-1">
            <MenuToggleButton onToggle={onMenuToggle} isOpen={isSidebarOpen} />
          </div>
          <LanguageSelector/>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Hotel Switcher */}
            {admin && (
              <HotelSwitcher
                selectedHotel={selectedHotel}
                availableHotels={availableHotels}
                onHotelSwitch={handleHotelSwitch}
                isOpen={isHotelDropdownOpen}
                onToggle={toggleHotelDropdown}
                dropdownRef={hotelDropdownRef}
              />
            )}

            {/* Profile Dropdown */}
            <ProfileDropdown
              user={user}
              isOpen={isProfileDropdownOpen}
              onToggle={toggleProfileDropdown}
              onEditProfile={handleEditProfile}
              onLogout={handleLogout}
              dropdownRef={profileDropdownRef}
              isLoggingOut={isLoggingOut}
            />
          </div>
        </div>
      </div>
    </nav>
  );
});

Navbar.displayName = "Navbar";

// Default props
Navbar.defaultProps = {
  onMenuToggle: () => {},
  isSidebarOpen: false,
  admin: false,
};

export default Navbar;
