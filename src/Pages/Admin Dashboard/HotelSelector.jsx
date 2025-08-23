import React, { useState, useEffect } from "react";
import useAdminData from "../../data/useAdminData"; // Adjust path as needed

const HotelSelector = ({ adminId, onHotelSelect, selectedHotelName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hotels, setHotels] = useState([]);
  
  // Fetch hotels data for this admin
  const { data: hotelsData, loading, error } = useAdminData(`/admins/${adminId}/hotels`);
  
  useEffect(() => {
    if (hotelsData) {
      // Assuming hotelsData is an array of hotel objects
      // Adjust this based on your actual data structure
      setHotels(Array.isArray(hotelsData) ? hotelsData : Object.values(hotelsData));
    }
  }, [hotelsData]);

  const handleHotelClick = (hotel) => {
    onHotelSelect(hotel.name, hotel); // Pass both name and full hotel data
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  if (loading) {
    return <div className="hotel-selector-loading">Loading hotels...</div>;
  }

  if (error) {
    return <div className="hotel-selector-error">Error loading hotels</div>;
  }

  return (
    <div className="hotel-selector">
      <div 
        className="hotel-selector-header"
        onClick={toggleDropdown}
        style={{
          padding: "8px 12px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          cursor: "pointer",
          backgroundColor: "#fff",
          minWidth: "200px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <span>{selectedHotelName || "Select Hotel"}</span>
        <span style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
          ▼
        </span>
      </div>
      
      {isOpen && (
        <div 
          className="hotel-selector-dropdown"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            borderTop: "none",
            borderRadius: "0 0 4px 4px",
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: 1000,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
        >
          {hotels.length > 0 ? (
            hotels.map((hotel) => (
              <div
                key={hotel.id || hotel.name}
                className="hotel-option"
                onClick={() => handleHotelClick(hotel)}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  borderBottom: "1px solid #f0f0f0",
                  backgroundColor: selectedHotelName === hotel.name ? "#f5f5f5" : "#fff"
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#f9f9f9"}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = selectedHotelName === hotel.name ? "#f5f5f5" : "#fff";
                }}
              >
                <div style={{ fontWeight: "500" }}>{hotel.name}</div>
                {hotel.location && (
                  <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
                    {hotel.location}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div 
              style={{
                padding: "10px 12px",
                color: "#666",
                fontStyle: "italic"
              }}
            >
              No hotels found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HotelSelector;