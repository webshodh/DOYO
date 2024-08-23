import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate from React Router v6
import useHotelsData from "../../data/useHotelsData"; // Adjust the import path accordingly
import { Navbar, Form, FormControl } from "react-bootstrap";

const HotelSelector = ({ adminId, onHotelSelect }) => {
  const { hotelsData, loading, error } = useHotelsData(adminId);
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    if (!loading && hotelsData.length > 0 && !selectedHotelId) {
      const firstHotel = hotelsData[0];
      setSelectedHotelId(firstHotel.uuid);
      onHotelSelect(firstHotel.hotelName);
      navigate(`/${firstHotel.hotelName}/admin/admin-dashboard`); // Update URL on initial load
    }
  }, [hotelsData, loading, selectedHotelId, onHotelSelect, navigate]);

  const handleHotelChange = (e) => {
    const selectedId = e.target.value;
    setSelectedHotelId(selectedId);

    const selectedHotel = hotelsData.find((hotel) => hotel.uuid === selectedId);
    if (selectedHotel) {
      onHotelSelect(selectedHotel.hotelName);
      navigate(`/${selectedHotel.hotelName}/admin/admin-dashboard`); // Update URL on hotel selection
    }
  };

  return (
    <Navbar expand="lg" className="justify-content-between">
      <Form inline className="ml-auto">
        {loading ? (
          <FormControl as="span" className="text-muted mr-3">
            Loading hotels...
          </FormControl>
        ) : error ? (
          <FormControl as="span" className="text-danger mr-3">
            Error: {error.message}
          </FormControl>
        ) : (
          <FormControl
            as="select"
            onChange={handleHotelChange}
            value={selectedHotelId}
            className="custom-select mr-sm-2"
            style={{ minWidth: "200px" }}
          >
            {hotelsData.length === 0 ? (
              <option value="">No hotels available</option>
            ) : (
              <>
                <option value="" disabled>
                  Select a hotel
                </option>
                {hotelsData.map((hotel) => (
                  <option key={hotel.uuid} value={hotel.uuid}>
                    {hotel.hotelName}
                  </option>
                ))}
              </>
            )}
          </FormControl>
        )}
      </Form>
    </Navbar>
  );
};

export default HotelSelector;
