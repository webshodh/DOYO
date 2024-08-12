import React, { createContext, useState, useContext } from 'react';

const HotelContext = createContext();

export const HotelProvider = ({ children }) => {
  const [hotelName, setHotelName] = useState('');

  return (
    <HotelContext.Provider value={{ hotelName, setHotelName }}>
      {children}
    </HotelContext.Provider>
  );
};

export const useHotelContext = () => {
  return useContext(HotelContext);
};
