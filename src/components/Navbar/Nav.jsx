import React from "react";
import "../../styles/nav.css";
import NavNotice from "./NavNotice";
import NavMessage from "./NavMessage";
import NavAvatar from "./NavAvatar";
import HotelSelector from "../../Pages/Dashboard/HotelSelector";
import { useHotelContext } from "../../Context/HotelContext";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
function Nav() {
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const { hotelName, setHotelName } = useHotelContext();
  const navigate = useNavigate();
  const handleHotelSelect = (selectedHotelName) => {
    // const formattedHotelName = selectedHotelName.replace(/\s+/g, ''); // Remove spaces
    setHotelName(selectedHotelName); // Update hotelName in context
    navigate(`/${selectedHotelName}/admin/dashboard`);
  };
  return (
    <nav className="header-nav ms-auto">
      <ul className="d-flex align-items-center">
        <HotelSelector
          adminId={currentAdminId}
          onHotelSelect={handleHotelSelect}
        />
        <NavNotice />
        <NavMessage />
        <NavAvatar />
      </ul>
    </nav>
  );
}

export default Nav;
