import React from "react";
import { Star } from "lucide-react"; // Star icon for reviews
import { colors } from "theme/theme";
import { useNavigate } from "react-router-dom";

const NavBar = ({ title, hotelPlaceId, hotelName, home, offers }) => {
  const navigate = useNavigate();

  const handleOfferClick = () => {
    navigate(`/viewMenu/${hotelName}/offers`);
  };

  const handleHomeClick = () => {
    navigate(`/viewMenu/${hotelName}/home`);
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
  };

  return (
    <>
      <div
        className="text-white p-2 flex justify-between items-center sticky"
        style={{ background: colors.Orange }}
      >
        <h2
          className="font-semibold text-white mt-2"
          style={{ marginLeft: "10px" }}
        >
          {title}
        </h2>
      </div>
      <div
        className="text-black p-2 flex justify-between items-center sticky"
        style={{ background: colors.White }}
      >
        <div className="flex items-center gap-4">
          {/* Offer Button */}
          {offers && (
            <button
              onClick={handleOfferClick}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-yellow-50 hover:scale-105 border border-yellow-400"
              style={{
                backgroundColor: colors.LightGrey || "#f8f9fa",
                color: "#f59e0b", // yellow-500
              }}
              title="View Offers"
            >
              <Star
                size={20}
                fill="#f59e0b"
                stroke="#f59e0b"
                className="animate-pulse"
              />
              <span className="text-sm font-medium text-yellow-600">
                Offers
              </span>
            </button>
          )}
          {/* Home Button */}
          {home && (
            <button
              onClick={handleHomeClick}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-yellow-50 hover:scale-105 border border-yellow-400"
              style={{
                backgroundColor: colors.LightGrey || "#f8f9fa",
                color: "#f59e0b", // yellow-500
              }}
              title="View Menu"
            >
              <Star
                size={20}
                fill="#f59e0b"
                stroke="#f59e0b"
                className="animate-pulse"
              />
              <span className="text-sm font-medium text-yellow-600">Menu</span>
            </button>
          )}
          {/* Review Icon Button */}
          <button
            onClick={handleReviewClick}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-yellow-50 hover:scale-105 border border-yellow-400"
            style={{
              backgroundColor: colors.LightGrey || "#f8f9fa",
              color: "#f59e0b", // yellow-500
            }}
            title="Write a Review"
          >
            <Star
              size={20}
              fill="#f59e0b"
              stroke="#f59e0b"
              className="animate-pulse"
            />
            <span className="text-sm font-medium text-yellow-600">Review</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default NavBar;
