import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useHotelSelection } from "../Context/HotelSelectionContext";
import { toast } from "react-toastify";

const Navbar = ({ onMenuToggle, isSidebarOpen, admin }) => {
  const navigate = useNavigate();
  const auth = getAuth();
  const { selectedHotel, availableHotels, selectHotel, user } =
    useHotelSelection();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isHotelDropdownOpen, setIsHotelDropdownOpen] = useState(false);

  const profileDropdownRef = useRef(null);
  const hotelDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
      if (
        hotelDropdownRef.current &&
        !hotelDropdownRef.current.contains(event.target)
      ) {
        setIsHotelDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("selectedHotel");
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error logging out. Please try again.");
    }
  };

  const handleEditProfile = () => {
    setIsProfileDropdownOpen(false);
    navigate(`/${selectedHotel?.id}/admin/profile`);
  };

  const handleHotelSwitch = (hotel) => {
    selectHotel(hotel);
    setIsHotelDropdownOpen(false);
    navigate(`/${hotel.id}/admin/dashboard`);
    toast.success(`Switched to ${hotel.name}`);
  };

  const getUserInitials = () => {
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
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 px-3 sm:px-4 lg:px-6 py-3 transition-all duration-300">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Section */}
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
          {/* Menu Toggle Button */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100/80 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-orange-50 transition-all duration-200 group"
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-gray-800 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isSidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Hotel Name */}
          {admin && (
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
                  Hotel Management
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
          {/* Hotel Switcher Dropdown */}
          {admin && (
            <div className="relative" ref={hotelDropdownRef}>
              <button
                onClick={() => setIsHotelDropdownOpen(!isHotelDropdownOpen)}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-xl border border-gray-300/60 hover:bg-gray-50/80 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 group"
                aria-label="Switch hotel"
              >
                <svg
                  className="w-4 h-4 text-gray-600 group-hover:text-orange-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700 hidden sm:inline transition-colors">
                  Switch
                </span>
                <svg
                  className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-orange-600 transition-all duration-200 ${
                    isHotelDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Hotel Dropdown Menu */}
              {isHotelDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10 bg-black/10 backdrop-blur-[1px] lg:hidden"></div>
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/60 z-50 overflow-hidden">
                    <div className="p-1">
                      <div className="px-4 py-3 text-sm font-semibold text-gray-700 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl mb-1">
                        <div className="flex items-center justify-between">
                          <span>Available Hotels</span>
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                            {availableHotels.length}
                          </span>
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {availableHotels.map((hotel, index) => (
                          <button
                            key={hotel.id}
                            onClick={() => handleHotelSwitch(hotel)}
                            className={`w-full text-left px-4 py-3 text-sm rounded-xl hover:bg-orange-50/80 flex items-center space-x-3 transition-all duration-200 group ${
                              selectedHotel?.id === hotel.id
                                ? "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 shadow-sm"
                                : "text-gray-700 hover:text-orange-700"
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                selectedHotel?.id === hotel.id
                                  ? "bg-orange-200"
                                  : "bg-gray-100 group-hover:bg-orange-100"
                              }`}
                            >
                              <svg
                                className={`w-4 h-4 transition-colors ${
                                  selectedHotel?.id === hotel.id
                                    ? "text-orange-600"
                                    : "text-gray-500 group-hover:text-orange-500"
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"
                                />
                              </svg>
                            </div>
                            <span className="flex-1 font-medium truncate">
                              {hotel.name}
                            </span>
                            {selectedHotel?.id === hotel.id && (
                              <div className="flex-shrink-0">
                                <svg
                                  className="w-5 h-5 text-orange-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Profile Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-xl hover:bg-gray-100/80 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-orange-50 transition-all duration-200 group"
              aria-label="Profile menu"
            >
              <div className="relative">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                  {getUserInitials()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div className="hidden sm:block text-left min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate max-w-20 lg:max-w-32">
                  {user?.displayName?.split(" ")[0] || "Admin"}
                </p>
                <p className="text-xs text-gray-500">Online</p>
              </div>
              <svg
                className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-orange-600 transition-all duration-200 hidden sm:block ${
                  isProfileDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10 bg-black/10 backdrop-blur-[1px] lg:hidden"></div>
                <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/60 z-50 overflow-hidden">
                  <div className="p-1">
                    <div className="px-4 py-3 text-sm border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl mb-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                          {getUserInitials()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-800 truncate">
                            {user?.displayName || "Admin User"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleEditProfile}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-700 flex items-center space-x-3 transition-all duration-200 rounded-xl group"
                    >
                      <div className="w-8 h-8 bg-gray-100 group-hover:bg-orange-100 rounded-lg flex items-center justify-center transition-colors">
                        <svg
                          className="w-4 h-4 text-gray-500 group-hover:text-orange-600 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <span className="font-medium">Edit Profile</span>
                    </button>

                    <div className="h-px bg-gray-100 mx-3 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-all duration-200 rounded-xl group"
                    >
                      <div className="w-8 h-8 bg-red-50 group-hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors">
                        <svg
                          className="w-4 h-4 text-red-500 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                      </div>
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
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
    </nav>
  );
};

export default Navbar;
