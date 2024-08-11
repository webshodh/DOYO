import React, { createContext } from "react";

export const HotelContext = createContext();

export const HotelProvider = ({ children }) => {
  const path = window.location.pathname;
  const parts = path.split("/");
  const hotelName = parts[1]; // "Atithi"
  console.log("HotelContext",hotelName);

  return (
    <HotelContext.Provider value={hotelName}>{children}</HotelContext.Provider>
  );
};
