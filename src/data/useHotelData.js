import { useState, useEffect } from "react";
import { db } from "../services/firebase/firebaseConfig";
import { onValue, ref } from "firebase/database";
import { getAuth } from "firebase/auth";

const useHotelData = (path = "/") => {
  const [hotelData, setHotelData] = useState([]);
  const [hotelsObject, setHotelsObject] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const adminID = currentAdminId;

  useEffect(() => {
    const hotelsRef = ref(db, path);

    const unsubscribe = onValue(hotelsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          // Store original object format
          setHotelsObject(data);

          // Convert to array with hotel names as keys
          const hotelsArray = Object.entries(data).map(
            ([hotelName, hotelInfo]) => ({
              id: hotelName,
              name: hotelName,
              ...hotelInfo,
            })
          );

          setHotelData(hotelsArray);
        } else {
          setHotelData([]);
          setHotelsObject({});
        }
      } catch (err) {
        console.error("Error fetching hotel data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [path]);

  // Calculate useful metrics
  const totalHotels = hotelData.length;

  const hotelsByType = hotelData.reduce((acc, hotel) => {
    const type = hotel.info.businessType || "unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const hotelsByState = hotelData.reduce((acc, hotel) => {
    const state = hotel.info.state || "Unknown State";
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {});

  const hotelsByDistrict = hotelData.reduce((acc, hotel) => {
    const district = hotel.info.district || "Unknown District";
    acc[district] = (acc[district] || 0) + 1;
    return acc;
  }, {});

  const hotelsByCity = hotelData.reduce((acc, hotel) => {
    const city = hotel.info.city || "Unknown City";
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});

  // Get hotels by specific criteria
  const getHotelsByType = (type) => {
    return hotelData.filter((hotel) => hotel.type === type);
  };

  const getHotelsByState = (state) => {
    return hotelData.filter((hotel) => hotel.state === state);
  };

  const getHotelsByDistrict = (district) => {
    return hotelData.filter((hotel) => hotel.district === district);
  };

  const getHotelsByCity = (city) => {
    return hotelData.filter((hotel) => hotel.city === city);
  };

  // Search functionality
  const searchHotels = (searchTerm) => {
    if (!searchTerm) return hotelData;

    const term = searchTerm.toLowerCase();
    return hotelData.filter(
      (hotel) =>
        hotel.name?.toLowerCase().includes(term) ||
        hotel.city?.toLowerCase().includes(term) ||
        hotel.state?.toLowerCase().includes(term) ||
        hotel.district?.toLowerCase().includes(term) ||
        hotel.type?.toLowerCase().includes(term)
    );
  };

  // Get hotel by specific name/id
  const getHotelById = (hotelId) => {
    return hotelData.find((hotel) => hotel.id === hotelId);
  };

  const getHotelByName = (hotelName) => {
    return hotelData.find((hotel) => hotel.name === hotelName);
  };

  // Statistics
  const stats = {
    totalHotels,
    totalCafes: hotelsByType.cafe || 0,
    totalBars: hotelsByType.bar || 0,
    totalRestaurants: hotelsByType.restaurant || 0,
    totalStates: Object.keys(hotelsByState).length,
    totalDistricts: Object.keys(hotelsByDistrict).length,
    totalCities: Object.keys(hotelsByCity).length,
    mostPopularState: Object.entries(hotelsByState).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0],
    mostPopularDistrict: Object.entries(hotelsByDistrict).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0],
    mostPopularCity: Object.entries(hotelsByCity).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0],
  };

  console.log("hotelData", hotelData);
  console.log("Hotel Stats", stats);

  return {
    // Core data
    hotelData,
    hotelsObject,
    loading,
    error,
    adminID,

    // Metrics
    totalHotels,
    hotelsByType,
    hotelsByState,
    hotelsByDistrict,
    hotelsByCity,
    stats,

    // Helper functions
    getHotelsByType,
    getHotelsByState,
    getHotelsByDistrict,
    getHotelsByCity,
    searchHotels,
    getHotelById,
    getHotelByName,
  };
};

export default useHotelData;
