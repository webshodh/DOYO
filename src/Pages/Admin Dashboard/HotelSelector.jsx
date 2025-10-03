// components/HotelSelector.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHotelContext } from "../../context/HotelContext";
import { Spinner } from "atoms";
import ErrorMessage from "atoms/Messages/ErrorMessage";

const HotelSelector = ({ onHotelSelect }) => {
  const {
    hotels,
    selectedHotel,
    loading,
    error,
    selectHotel,
    canAccessHotel,
    getSelectedHotelName,
  } = useHotelContext();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const selectedName = getSelectedHotelName() || "Select Hotel";

  const handleHotelClick = (hotel) => {
    selectHotel(hotel);
    setIsOpen(false);
    onHotelSelect?.(hotel);
    navigate(
      `/${hotel.businessName
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, "_")}/admin/dashboard`,
      {
        state: { hotelData: hotel },
      },
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="relative hotel-selector inline-block text-left">
      <button
        type="button"
        className="px-3 py-1 bg-orange-600 text-white rounded-md flex items-center justify-between w-48"
        onClick={() => setIsOpen((o) => !o)}
      >
        <span>{selectedName}</span>
        <span
          className={`ml-2 transform transition ${isOpen ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute mt-1 bg-white text-black rounded-md shadow-lg w-48 z-50 max-h-60 overflow-y-auto">
          {hotels.length > 0 ? (
            hotels.map((hotel) => (
              <div
                key={hotel.id}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                  selectedHotel?.id === hotel.id ? "bg-gray-200" : ""
                }`}
                onClick={() => handleHotelClick(hotel)}
              >
                {hotel.businessName || hotel.hotelName || hotel.name}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500 italic">
              No hotels assigned
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HotelSelector;
