import React, { createContext, useContext, useState } from "react";

const HotelContext = createContext();

export const useHotelContext = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error("useHotelContext must be used within a HotelProvider");
  }
  return context;
};

export const HotelProvider = ({ children }) => {
  const [hotels, setHotels] = useState([]); // list of hotels for admin
  const [selectedHotel, setSelectedHotel] = useState(null); // currently active hotel

  // Set hotels list + default selection (first hotel)
  const updateHotels = (hotelList) => {
    setHotels(hotelList);
    if (hotelList.length > 0) {
      setSelectedHotel(hotelList[0]);
    }
  };

  const clearSelection = () => {
    setHotels([]);
    setSelectedHotel(null);
  };

  const value = {
    hotels,
    setHotels,
    selectedHotel,
    setSelectedHotel,
    updateHotels,
    clearSelection,
  };

  return <HotelContext.Provider value={value}>{children}</HotelContext.Provider>;
};
