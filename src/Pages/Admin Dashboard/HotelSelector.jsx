// import React, { useState, useEffect } from "react";
// import useAdminData from "../../data/useAdminData"; // Adjust path as needed

// const HotelSelector = ({ adminId, onHotelSelect, selectedHotelName }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [hotels, setHotels] = useState([]);
  
//   // Fetch hotels data for this admin
//   const { data: hotelsData, loading, error } = useAdminData(`/admins/${adminId}/hotels`);
  
//   useEffect(() => {
//     if (hotelsData) {
//       // Assuming hotelsData is an array of hotel objects
//       // Adjust this based on your actual data structure
//       setHotels(Array.isArray(hotelsData) ? hotelsData : Object.values(hotelsData));
//     }
//   }, [hotelsData]);

//   const handleHotelClick = (hotel) => {
//     onHotelSelect(hotel.name, hotel); // Pass both name and full hotel data
//     setIsOpen(false);
//   };

//   const toggleDropdown = () => {
//     setIsOpen(!isOpen);
//   };

//   if (loading) {
//     return <div className="hotel-selector-loading">Loading hotels...</div>;
//   }

//   if (error) {
//     return <div className="hotel-selector-error">Error loading hotels</div>;
//   }

//   return (
//     <div className="hotel-selector">
//       <div 
//         className="hotel-selector-header"
//         onClick={toggleDropdown}
//         style={{
//           padding: "8px 12px",
//           border: "1px solid #ddd",
//           borderRadius: "4px",
//           cursor: "pointer",
//           backgroundColor: "#fff",
//           minWidth: "200px",
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center"
//         }}
//       >
//         <span>{selectedHotelName || "Select Hotel"}</span>
//         <span style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
//           ▼
//         </span>
//       </div>
      
//       {isOpen && (
//         <div 
//           className="hotel-selector-dropdown"
//           style={{
//             position: "absolute",
//             top: "100%",
//             left: 0,
//             right: 0,
//             backgroundColor: "#fff",
//             border: "1px solid #ddd",
//             borderTop: "none",
//             borderRadius: "0 0 4px 4px",
//             maxHeight: "200px",
//             overflowY: "auto",
//             zIndex: 1000,
//             boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
//           }}
//         >
//           {hotels.length > 0 ? (
//             hotels.map((hotel) => (
//               <div
//                 key={hotel.id || hotel.name}
//                 className="hotel-option"
//                 onClick={() => handleHotelClick(hotel)}
//                 style={{
//                   padding: "10px 12px",
//                   cursor: "pointer",
//                   borderBottom: "1px solid #f0f0f0",
//                   backgroundColor: selectedHotelName === hotel.name ? "#f5f5f5" : "#fff"
//                 }}
//                 onMouseEnter={(e) => e.target.style.backgroundColor = "#f9f9f9"}
//                 onMouseLeave={(e) => {
//                   e.target.style.backgroundColor = selectedHotelName === hotel.name ? "#f5f5f5" : "#fff";
//                 }}
//               >
//                 <div style={{ fontWeight: "500" }}>{hotel.name}</div>
//                 {hotel.location && (
//                   <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
//                     {hotel.location}
//                   </div>
//                 )}
//               </div>
//             ))
//           ) : (
//             <div 
//               style={{
//                 padding: "10px 12px",
//                 color: "#666",
//                 fontStyle: "italic"
//               }}
//             >
//               No hotels found
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default HotelSelector;


// HotelSelector.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAdminData from "../../data/useAdminData";

const HotelSelector = ({ adminId, onHotelSelect, selectedHotelName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hotels, setHotels] = useState([]);
  const navigate = useNavigate();
  
  // Fetch hotels data for this admin
  const { data: hotelsData, loading, error } = useAdminData(`/admins/${adminId}/hotels`);
  
  useEffect(() => {
    if (hotelsData) {
      setHotels(Array.isArray(hotelsData) ? hotelsData : Object.values(hotelsData));
    }
  }, [hotelsData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.hotel-selector')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleHotelClick = (hotel) => {
    // Update the selected hotel
    onHotelSelect(hotel.name, hotel);
    setIsOpen(false);
    
    // Navigate to the hotel's dashboard
    // Adjust the route path according to your routing structure
    navigate(`/admin/hotel/${hotel.id}/dashboard`, { 
      state: { hotelData: hotel }
    });
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  if (loading) {
    return (
      <div style={{ 
        padding: "8px 12px", 
        fontSize: "14px", 
        color: "#666" 
      }}>
        Loading hotels...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: "8px 12px", 
        fontSize: "14px", 
        color: "#e74c3c" 
      }}>
        Error loading hotels
      </div>
    );
  }

  return (
    <div className="hotel-selector" style={{ position: "relative" }}>
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
          alignItems: "center",
          fontSize: "14px",
          transition: "border-color 0.2s, box-shadow 0.2s",
          ...(isOpen && {
            borderColor: "#007bff",
            boxShadow: "0 0 0 2px rgba(0,123,255,0.25)"
          })
        }}
      >
        <span style={{ 
          overflow: "hidden", 
          textOverflow: "ellipsis", 
          whiteSpace: "nowrap",
          marginRight: "8px"
        }}>
          {selectedHotelName || "Select Hotel"}
        </span>
        <span style={{ 
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", 
          transition: "transform 0.2s",
          fontSize: "12px",
          flexShrink: 0
        }}>
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
            maxHeight: "250px",
            overflowY: "auto",
            zIndex: 1000,
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
          }}
        >
          {hotels.length > 0 ? (
            hotels.map((hotel, index) => (
              <div
                key={hotel.id || hotel.name || index}
                className="hotel-option"
                onClick={() => handleHotelClick(hotel)}
                style={{
                  padding: "12px",
                  cursor: "pointer",
                  borderBottom: index < hotels.length - 1 ? "1px solid #f0f0f0" : "none",
                  backgroundColor: selectedHotelName === hotel.name ? "#e3f2fd" : "#fff",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => {
                  if (selectedHotelName !== hotel.name) {
                    e.target.style.backgroundColor = "#f8f9fa";
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = selectedHotelName === hotel.name ? "#e3f2fd" : "#fff";
                }}
              >
                <div style={{ 
                  fontWeight: "500",
                  marginBottom: "2px",
                  fontSize: "14px"
                }}>
                  {hotel.name}
                </div>
                {hotel.location && (
                  <div style={{ 
                    fontSize: "12px", 
                    color: "#666"
                  }}>
                    📍 {hotel.location}
                  </div>
                )}
                {hotel.status && (
                  <div style={{
                    fontSize: "11px",
                    color: hotel.status === 'active' ? '#28a745' : '#dc3545',
                    fontWeight: "500",
                    marginTop: "2px"
                  }}>
                    {hotel.status.toUpperCase()}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div 
              style={{
                padding: "12px",
                color: "#666",
                fontStyle: "italic",
                textAlign: "center",
                fontSize: "14px"
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

