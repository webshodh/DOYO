import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import useHotelsData from "../../data/useHotelsData"; 
import { Navbar, Form, FormControl } from "react-bootstrap";

const HotelSelector = ({ adminId, onHotelSelect }) => {
  const { hotelsData, loading, error } = useHotelsData(adminId);
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && hotelsData.length > 0 && !selectedHotelId) {
      const firstHotel = hotelsData[0];
      setSelectedHotelId(firstHotel?.uuid || "");
      onHotelSelect(firstHotel?.hotelName || "");
      // Only navigate if you want to automatically load the first hotel
      // navigate(`/${firstHotel?.hotelName}/admin/admin-dashboard`);
    }
  }, [hotelsData, loading, selectedHotelId, onHotelSelect]);

  const handleHotelChange = (e) => {
    const selectedId = e.target.value;
    setSelectedHotelId(selectedId);

    const selectedHotel = hotelsData.find((hotel) => hotel.uuid === selectedId);
    if (selectedHotel) {
      onHotelSelect(selectedHotel.hotelName);
      navigate(`/${selectedHotel.hotelName}/admin/admin-dashboard`);
    }
  };

  return (
    <Navbar expand="lg" className="justify-content-between">
      <Form className="ml-auto d-flex align-items-center">
        {loading && (
          <FormControl as="span" className="text-muted mr-3">
            Loading hotels...
          </FormControl>
        )}
        {error && (
          <FormControl as="span" className="text-danger mr-3">
            Error: {error.message}
          </FormControl>
        )}
        {!loading && !error && (
          <FormControl
            as="select"
            onChange={handleHotelChange}
            value={selectedHotelId}
            className="custom-select mr-sm-2"
            style={{ minWidth: "200px" }}
          >
            <option value="" disabled>
              Select a hotel
            </option>
            {hotelsData.length === 0 ? (
              <option value="">No hotels available</option>
            ) : (
              hotelsData.map((hotel) => (
                <option key={hotel?.uuid} value={hotel?.uuid}>
                  {hotel?.hotelName}
                </option>
              ))
            )}
          </FormControl>
        )}
      </Form>
    </Navbar>
  );
};

export default HotelSelector;
