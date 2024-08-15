import React, { useState } from "react";
import useHotelsData from "../../data/useHotelsData"; // Adjust the import path accordingly
import { PageTitle } from "../../Atoms";
import { Navbar, Nav, Form, FormControl } from "react-bootstrap";

const HotelSelector = ({ adminId, onHotelSelect }) => {
  const { hotelsData, loading, error } = useHotelsData(adminId);
  const [selectedHotelId, setSelectedHotelId] = useState("");

  const handleHotelChange = (e) => {
    const selectedId = e.target.value;
    setSelectedHotelId(selectedId);

    const selectedHotel = hotelsData.find((hotel) => hotel.uuid === selectedId); // Match by UUID
    if (selectedHotel) {
      // Call the callback function to update hotel name in the main component
      onHotelSelect(selectedHotel.hotelName);
    }
  };

  return (
    <Navbar  expand="lg" className="justify-content-between">
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
            <option value="">Select a hotel</option>
            {hotelsData.map((hotel) => (
              <option key={hotel.uuid} value={hotel.uuid}>
                {hotel.hotelName}
              </option>
            ))}
          </FormControl>
        )}
      </Form>
    </Navbar>
  );
};

export default HotelSelector;
