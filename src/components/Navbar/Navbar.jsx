import React, { useState } from "react";
import { Star, Menu, X } from "lucide-react"; // Added Menu and X icons for sidebar toggle
import { colors } from "theme/theme";
import { useNavigate } from "react-router-dom";

const NavBar = ({ title, hotelPlaceId, hotelName, home, offers }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleOfferClick = () => {
    navigate(`/viewMenu/${hotelName}/offers`);
    setIsSidebarOpen(false); // Close sidebar after navigation
  };

  const handleHomeClick = () => {
    navigate(`/viewMenu/${hotelName}/home`);
    setIsSidebarOpen(false); // Close sidebar after navigation
  };

  // Function to handle Google review redirection
  const handleReviewClick = () => {
    let reviewUrl;

    if (hotelPlaceId) {
      // If you have Google Place ID (most accurate)
      reviewUrl = `https://search.google.com/local/writereview?placeid=${hotelPlaceId}`;
    } else if (hotelName) {
      // If you only have hotel name, search for it
      const encodedHotelName = encodeURIComponent(`${hotelName} reviews`);
      reviewUrl = `https://www.google.com/search?q=${encodedHotelName}`;
    } else {
      // Fallback to generic Google reviews
      reviewUrl = `https://www.google.com/search?q=hotel+reviews`;
    }

    // Open in new tab
    window.open(reviewUrl, "_blank", "noopener,noreferrer");
    setIsSidebarOpen(false); // Close sidebar after action
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* Main Navigation Bar */}
      <div
        className="text-white p-2 flex justify-between items-left sticky z-50"
        style={{ background: colors.Orange }}
      >
        {/* Menu Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all duration-200"
          title="Menu"
        >
          <Menu size={24} className="text-white" />
        </button>
        <h2 className="font-semibold text-white" style={{ marginLeft: "10px" }}>
          {title}
        </h2>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header with Logo */}
        <div
          className="p-4 border-b flex justify-between items-center"
          style={{ background: colors.Orange }}
        >
          {/* Logo */}
          <div className="flex items-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
              style={{ background: colors.White }}
            >
              <span style={{ color: colors.Orange }}>
                {hotelName ? hotelName.charAt(0).toUpperCase() : "H"}
              </span>
            </div>
            <div className="ml-3">
              <h3 className="text-white font-semibold text-lg">
                {hotelName || "Hotel"}
              </h3>
            </div>
          </div>
          {/* Close Button */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all duration-200"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Sidebar Menu Items */}
        <div className="p-4">
          {/* Review Option */}
          <button
            onClick={handleReviewClick}
            className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-gray-100 transition-all duration-200 mb-3 border border-gray-200"
          >
            <Star
              size={24}
              fill="#f59e0b"
              stroke="#f59e0b"
              className="animate-pulse"
            />
            <div className="text-left">
              <span className="text-lg font-medium text-gray-800">Review</span>
              <p className="text-sm text-gray-600">Write a review on Google</p>
            </div>
          </button>

          {/* Offers Option */}
          {offers && (
            <button
              onClick={handleOfferClick}
              className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-gray-100 transition-all duration-200 mb-3 border border-gray-200"
            >
              <Star
                size={24}
                fill="#f59e0b"
                stroke="#f59e0b"
                className="animate-pulse"
              />
              <div className="text-left">
                <span className="text-lg font-medium text-gray-800">
                  Offers
                </span>
                <p className="text-sm text-gray-600">View special offers</p>
              </div>
            </button>
          )}

          {/* Menu/Home Option */}
          {home && (
            <button
              onClick={handleHomeClick}
              className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-gray-100 transition-all duration-200 mb-3 border border-gray-200"
            >
              <Star
                size={24}
                fill="#f59e0b"
                stroke="#f59e0b"
                className="animate-pulse"
              />
              <div className="text-left">
                <span className="text-lg font-medium text-gray-800">Menu</span>
                <p className="text-sm text-gray-600">View menu items</p>
              </div>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default NavBar;
