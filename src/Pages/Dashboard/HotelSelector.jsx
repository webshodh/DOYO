import React, { useState } from 'react';
import useHotelsData from '../../data/useHotelsData'; // Adjust the import path accordingly
import { PageTitle } from '../../Atoms';

const HotelSelector = ({ adminId, onHotelSelect }) => {
  const { hotelsData, loading, error } = useHotelsData(adminId);
  const [selectedHotelId, setSelectedHotelId] = useState('');

  const handleHotelChange = (e) => {
    const selectedId = e.target.value;
    setSelectedHotelId(selectedId);

    const selectedHotel = hotelsData.find(hotel => hotel.uuid === selectedId); // Match by UUID
    if (selectedHotel) {
      // Call the callback function to update hotel name in the main component
      onHotelSelect(selectedHotel.hotelName);
    }
  };

  return (
    <div className='d-flex justify-content-around'>
      <PageTitle pageTitle={'Select Hotel'}/>
      {loading && <p>Loading hotels...</p>}
      {error && <p>Error loading hotels: {error.message}</p>}
      <div style={{height:'20px', marginTop:'25px', marginLeft:'10px'}}>
      <select onChange={handleHotelChange} value={selectedHotelId}>
        <option value="">Select a hotel</option>
        {hotelsData.map((hotel) => (
          <option key={hotel.uuid} value={hotel.uuid}> {/* Use UUID as the key and value */}
            {hotel.hotelName}
          </option>
        ))}
      </select>
      </div>
    </div>
  );
};

export default HotelSelector;
