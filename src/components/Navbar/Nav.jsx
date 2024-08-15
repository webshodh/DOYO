import React from "react";
import "../../styles/nav.css";
import NavNotice from "./NavNotice";
import NavMessage from "./NavMessage";
import NavAvatar from "./NavAvatar";
import HotelSelector from "../../Pages/Admin Dashboard/HotelSelector";
import { useHotelContext } from "../../Context/HotelContext";
import { getAuth } from "firebase/auth";

function Nav() {
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const { hotelName, setHotelName } = useHotelContext();
  const handleHotelSelect = (selectedHotelName) => {
    setHotelName(selectedHotelName);
  };
  return (
    <nav className="header-nav ms-auto">
      <ul className="d-flex align-items-center">
        <div style={{marginRight:'10px'}}>
        <HotelSelector
          adminId={currentAdminId}
          onHotelSelect={handleHotelSelect}
        />
        </div>
        <NavNotice />
        <NavMessage />
        <NavAvatar />
      </ul>
    </nav>
  );
}

export default Nav;
