// import React from "react";
// import "../../styles/nav.css";
// import NavAvatar from "./NavAvatar";
// import HotelSelector from "../../Pages/Admin Dashboard/HotelSelector";
// import { useHotelContext } from "Context/HotelContext";
// import { getAuth } from "firebase/auth";
// import useAdminData from "data/useAdminData";

// function Nav() {
//   const auth = getAuth();
//   const currentAdminId = auth.currentUser?.uid;
//   const { hotelName, setHotelName } = useHotelContext();

//   const handleHotelSelect = (selectedHotelName, hotelData) => {
//     // Store both hotel name and full hotel data
//     setHotelName(selectedHotelName);
//     // You might want to also store the complete hotel data in context
//     // setSelectedHotel(hotelData);
//   };

//   const { data, loading, error } = useAdminData(`/admins/${currentAdminId}`);
//   const adminData = data;

//   // Show loading state
//   if (loading) {
//     return (
//       <nav className="header-nav ms-auto">
//         <ul className="d-flex align-items-center">
//           <div style={{ marginRight: "10px" }}>Loading...</div>
//           <NavAvatar />
//         </ul>
//       </nav>
//     );
//   }

//   // Handle error state
//   if (error) {
//     console.error("Error loading admin data:", error);
//   }

//   return (
//     <nav className="header-nav ms-auto">
//       <ul className="d-flex align-items-center">
//         {adminData?.role === "admin" && (
//           <li style={{ marginRight: "10px" }}>
//             <HotelSelector
//               adminId={currentAdminId}
//               onHotelSelect={handleHotelSelect}
//               selectedHotelName={hotelName}
//             />
//           </li>
//         )}

//         <li>
//           <NavAvatar />
//         </li>
//       </ul>
//     </nav>
//   );
// }

// export default Nav;

// Updated Nav.jsx with better error handling
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
  const { hotelName, setHotelName, setSelectedHotel } = useHotelContext();

  const handleHotelSelect = (selectedHotelName, hotelData) => {
    // Store both hotel name and full hotel data
    setHotelName(selectedHotelName);
    setSelectedHotel(hotelData); // Store complete hotel data in context

    // Optional: Store in localStorage for persistence
    localStorage.setItem(
      "selectedHotel",
      JSON.stringify({
        name: selectedHotelName,
        data: hotelData,
      })
    );
  };

  const { data, loading, error } = useAdminData(`/admins/${currentAdminId}`);

  // Show loading state
  if (loading) {
    return (
      <nav className="header-nav ms-auto">
        <ul className="d-flex align-items-center">
          <div style={{ marginRight: "15px", fontSize: "14px", color: "#666" }}>
            Loading...
          </div>
          <NavAvatar />
        </ul>
      </nav>
    );
  }

  // Handle error state
  if (error) {
    console.error("Error loading admin data:", error);
    return (
      <nav className="header-nav ms-auto">
        <ul className="d-flex align-items-center">
          <div
            style={{
              marginRight: "15px",
              fontSize: "12px",
              color: "#e74c3c",
              padding: "4px 8px",
              backgroundColor: "#fdf2f2",
              borderRadius: "4px",
            }}
          >
            Error loading data
          </div>
          <NavAvatar />
        </ul>
      </nav>
    );
  }

  return (
    <nav className="header-nav ms-auto">
      <ul className="d-flex align-items-center">
        {data?.role === "admin" && currentAdminId && (
          <li style={{ marginRight: "15px" }}>
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