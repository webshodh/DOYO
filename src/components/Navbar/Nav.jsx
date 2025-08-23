import React from "react";
import "../../styles/nav.css";
import NavAvatar from "./NavAvatar";
import HotelSelector from "../../Pages/Admin Dashboard/HotelSelector";
import { useHotelContext } from "Context/HotelContext";
import { getAuth } from "firebase/auth";
import useAdminData from "data/useAdminData";

function Nav() {
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const { hotelName, setHotelName } = useHotelContext();
  
  const handleHotelSelect = (selectedHotelName, hotelData) => {
    // Store both hotel name and full hotel data
    setHotelName(selectedHotelName);
    // You might want to also store the complete hotel data in context
    // setSelectedHotel(hotelData);
  };

  const { data, loading, error } = useAdminData(`/admins/${currentAdminId}`);
  const adminData = data;

  // Show loading state
  if (loading) {
    return (
      <nav className="header-nav ms-auto">
        <ul className="d-flex align-items-center">
          <div style={{ marginRight: "10px" }}>Loading...</div>
          <NavAvatar />
        </ul>
      </nav>
    );
  }

  // Handle error state
  if (error) {
    console.error("Error loading admin data:", error);
  }

  return (
    <nav className="header-nav ms-auto">
      <ul className="d-flex align-items-center">
        {adminData?.role === "admin" && (
          <li style={{ marginRight: "10px" }}>
            <HotelSelector
              adminId={currentAdminId}
              onHotelSelect={handleHotelSelect}
              selectedHotelName={hotelName}
            />
          </li>
        )}
        
        <li>
          <NavAvatar />
        </li>
      </ul>
    </nav>
  );
}

export default Nav;