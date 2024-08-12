import React, { useState } from 'react';
import useHotelsData from '../../data/useHotelsData'; // Adjust the import path accordingly

const HotelSelector = ({ adminId, onHotelSelect }) => {
  const { hotelsData, loading, error } = useHotelsData(adminId);
  const [selectedHotelId, setSelectedHotelId] = useState('');

  const handleHotelChange = (e) => {
    const selectedId = e.target.value;
    setSelectedHotelId(selectedId);

    const selectedHotel = hotelsData.find(hotel => hotel.id === selectedId);
    if (selectedHotel) {
      // Call the callback function to update hotel name in the main component
      onHotelSelect(selectedHotel.hotelName);
    }
  };

  return (
    <div>
      <h2>Select a Hotel</h2>
      {loading && <p>Loading hotels...</p>}
      {error && <p>Error loading hotels: {error.message}</p>}
      <select onChange={handleHotelChange} value={selectedHotelId}>
        <option value="">Select a hotel</option>
        {hotelsData.map((hotel) => (
          <option key={hotel.id} value={hotel.id}>
            {hotel.hotelName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default HotelSelector;
