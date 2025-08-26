// HotelSelector.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAdminData from "../../data/useAdminData";

const HotelSelector = ({ adminId, selectedHotelName, onHotelSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hotels, setHotels] = useState([]);
  const navigate = useNavigate();

  const {
    data: hotelsData,
    loading,
    error,
  } = useAdminData(`/admins/${adminId}/hotels`);
console.log("selectedHotelName", selectedHotelName)
  useEffect(() => {
    if (hotelsData) {
      setHotels(
        Array.isArray(hotelsData) ? hotelsData : Object.values(hotelsData)
      );
    }
  }, [hotelsData]);

  const handleHotelClick = (hotel) => {
    onHotelSelect(hotel.name, hotel); // pass hotel up to context or navbar
    setIsOpen(false);
    navigate(`/admin/hotel/${hotel.id}/dashboard`, {
      state: { hotelData: hotel },
    });
  };

  if (loading)
    return <span className="text-sm text-gray-300">Loading hotels...</span>;
  if (error)
    return <span className="text-sm text-red-400">Error loading hotels</span>;

  return (
    <div className="relative hotel-selector">
      <div
        className="px-3 py-1 bg-orange-600 rounded-md cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedHotelName || "Select Hotel"}</span>
        <span
          className={`ml-2 transform transition ${isOpen ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </div>

      {isOpen && (
        <div className="absolute mt-1 bg-white text-black rounded-md shadow-lg w-48 z-50">
          {hotels.length > 0 ? (
            hotels.map((hotel) => (
              <div
                key={hotel.id || hotel.name}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                  selectedHotelName === hotel.name ? "bg-gray-200" : ""
                }`}
                onClick={() => handleHotelClick(hotel)}
              >
                {hotel.name}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500 italic">No hotels</div>
          )}
        </div>
      )}
    </div>
  );
};

export default HotelSelector;
