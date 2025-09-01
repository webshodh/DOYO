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
    <nav className="bg-white shadow-lg border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Menu Toggle Button */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <svg
              className="w-6 h-6 text-gray-600"
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
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
              <h1 className="text-xl font-bold text-gray-800">
                {selectedHotel?.name || "Select Hotel"}
              </h1>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Hotel Switcher Dropdown */}
          {admin && (
            <div className="relative" ref={hotelDropdownRef}>
              <button
                onClick={() => setIsHotelDropdownOpen(!isHotelDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              >
                <svg
                  className="w-4 h-4 text-gray-600"
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
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                  Switch Hotel
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
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
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border-b">
                      Available Hotels ({availableHotels.length})
                    </div>
                    {availableHotels.map((hotel) => (
                      <button
                        key={hotel.id}
                        onClick={() => handleHotelSwitch(hotel)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 flex items-center space-x-3 transition-colors ${
                          selectedHotel?.id === hotel.id
                            ? "bg-orange-100 text-orange-700"
                            : "text-gray-700"
                        }`}
                      >
                        <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-orange-500"
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
                        <span className="flex-1">{hotel.name}</span>
                        {selectedHotel?.id === hotel.id && (
                          <svg
                            className="w-4 h-4 text-orange-500"
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
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Profile Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
            >
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {getUserInitials()}
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform hidden sm:block ${
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
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  <div className="px-4 py-2 text-sm text-gray-500 border-b">
                    {user?.email}
                  </div>
                  <button
                    onClick={handleEditProfile}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 text-gray-400"
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
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 text-red-400"
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
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
