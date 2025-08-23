import React, { createContext, useContext, useState } from 'react';

const HotelContext = createContext();

export const useHotelContext = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotelContext must be used within a HotelProvider');
  }
  return context;
};

export const HotelProvider = ({ children }) => {
  const [hotelName, setHotelName] = useState('');
  const [selectedHotel, setSelectedHotel] = useState(null);

  const updateSelectedHotel = (hotelName, hotelData) => {
    setHotelName(hotelName);
    setSelectedHotel(hotelData);
  };

  const clearSelection = () => {
    setHotelName('');
    setSelectedHotel(null);
  };

  const value = {
    hotelName,
    setHotelName,
    selectedHotel,
    setSelectedHotel,
    updateSelectedHotel,
    clearSelection
  };

  return (
    <HotelContext.Provider value={value}>
      {children}
    </HotelContext.Provider>
  );
};