// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useMobileLoginAuth } from "../../Context/MobileLoginAuthProvider"; // Adjust the path as needed

// function UserLogin() {
//   const [name, setName] = useState("");
//   const [mobile, setMobile] = useState("");
//   const navigate = useNavigate();
//   const [hotelName, setHotelName] = useState("");
//   const { loginUser } = useMobileLoginAuth();

//   useEffect(() => {
//     const path = window.location.pathname;
//     const pathSegments = path.split("/");
//     const hotelNameFromPath = pathSegments[pathSegments.length - 3];
//     setHotelName(hotelNameFromPath);
//   }, []);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     loginUser(name, mobile, hotelName);
//     navigate(`/viewMenu/${hotelName}/home`);
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <div>
//         <label>Name:</label>
//         <input
//           type="text"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           required
//         />
//       </div>
//       <div>
//         <label>Mobile Number:</label>
//         <input
//           type="text"
//           value={mobile}
//           onChange={(e) => setMobile(e.target.value)}
//           required
//         />
//       </div>
//       <button type="submit">Register/Login</button>
//     </form>
//   );
// }

// export default UserLogin;
