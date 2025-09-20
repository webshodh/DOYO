import React, { createContext, useContext, useState, useEffect } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { getAuth } from "firebase/auth";

const HotelSelectionContext = createContext();

export const useHotelSelection = () => {
  const context = useContext(HotelSelectionContext);
  if (!context) {
    throw new Error(
      "useHotelSelection must be used within a HotelSelectionProvider"
    );
  }
  return context;
};

export const HotelSelectionProvider = ({ children }) => {
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [availableHotels, setAvailableHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const auth = getAuth();

  // Fetch user's hotels
  const fetchUserHotels = async (userId) => {
    try {
      setLoading(true);
      const db = getDatabase();
      const hotelsRef = ref(db, `admins/${userId}/hotels`);
      const snapshot = await get(hotelsRef);

      if (snapshot.exists()) {
        const hotelsData = snapshot.val();
        const hotelsList = Object.keys(hotelsData).map((hotelKey) => ({
          id: hotelKey,
          name: hotelKey,
          data: hotelsData[hotelKey],
        }));
        setAvailableHotels(hotelsList);
        return hotelsList;
      } else {
        setAvailableHotels([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setAvailableHotels([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Initialize user and hotels
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const hotels = await fetchUserHotels(currentUser.uid);

        // Auto-select first hotel if available and no hotel is selected
        if (hotels.length > 0 && !selectedHotel) {
          setSelectedHotel(hotels[0]);
        }
      } else {
        setUser(null);
        setAvailableHotels([]);
        setSelectedHotel(null);
      }
    });

    return unsubscribe;
  }, [selectedHotel]);

  const selectHotel = (hotel) => {
    setSelectedHotel(hotel);
  };

  const refreshHotels = async () => {
    if (user) {
      await fetchUserHotels(user.uid);
    }
  };

  const value = {
    selectedHotel,
    availableHotels,
    loading,
    user,
    selectHotel,
    fetchUserHotels,
    refreshHotels,
  };

  return (
    <HotelSelectionContext.Provider value={value}>
      {children}
    </HotelSelectionContext.Provider>
  );
};
