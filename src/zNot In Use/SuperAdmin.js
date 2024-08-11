// // SuperAdminDashboard.js
// import React, { useEffect, useState } from "react";
// import CountCard from "../../components/CountCard/CountCard";
// import { db } from "../../firebase/firebase";
// import { onValue, ref, remove } from "firebase/database";
// import NavButtons from "../../components/NavButtons/Navbutton";
// import { Link } from "react-router-dom";

// const SuperAdminDashboard = () => {
//   const [hotelCount, setHotelCount] = useState(0);
//   const [hotelCountsByState, setHotelCountsByState] = useState({});
//   const [hotelCountsByDistrict, setHotelCountsByDistrict] = useState({});
//   const [hotels, setHotels] = useState([]);
//   useEffect(() => {
//     const hotelsRef = ref(db, "/");
//     onValue(hotelsRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data !== null) {
//         setHotelCount(Object.keys(data).length);
//         setHotels(Object.values(data));
//       }
//     });
//   }, []);

//   useEffect(() => {
//     const hotelsRef = ref(db, "/");
//     onValue(hotelsRef, (snapshot) => {
//       const data = snapshot.val();

//       if (data !== null) {
//         const countsByState = {};
//         const countsByDistrict = {};

//         Object.values(data).forEach((hotel) => {
//           const state = hotel.state || "Unknown State";
//           const district = hotel.district || "Unknown District";

//           countsByState[state] = (countsByState[state] || 0) + 1;
//           countsByDistrict[district] = (countsByDistrict[district] || 0) + 1;
//         });

//         setHotelCountsByState(countsByState);
//         setHotelCountsByDistrict(countsByDistrict);
//       }
//     });
//   }, []);

//   // Generate a dynamic color based on the string value
//   const generateColor = (str) => {
//     const hash = str
//       .split("")
//       .reduce((acc, char) => char.charCodeAt(0) + acc, 0);

//     const hue = hash % 360;
//     return `hsl(${hue}, 50%, 70%)`;
//   };
//   const handleDeleteHotel = (hotelName) => {
//     if (window.confirm("Are you sure you want to delete this hotel?")) {
//       remove(ref(db, `/${hotelName}`));
//     }
//   };
//   console.log('ghhh', hotelCount)
//   return (
//     <>
//       <div style={{ display: "grid", gridTemplateColumns: "2fr " }}>
//         <div className="dashboard-container">
//           <NavButtons />

//           <div>
//             <h1 className="heading">Total Number of Hotels: {hotelCount}</h1>
//           </div>

//           <div>
//             <h2 className="heading">Hotel Counts by State</h2>
//             <ul style={{ display: "grid", gridTemplateColumns: "2fr 2fr" }}>
//               {Object.entries(hotelCountsByState).map(
//                 ([state, count], index) => (
//                   <CountCard
//                     key={index}
//                     count={count}
//                     name={state}
//                     bgColor={generateColor(state)}
//                   />
//                 )
//               )}
//             </ul>
//           </div>

//           <div>
//             <h2 className="heading">Hotel Counts by District</h2>
//             <ul style={{ display: "grid", gridTemplateColumns: "2fr 2fr" }}>
//               {Object.entries(hotelCountsByDistrict).map(
//                 ([district, count], index) => (
//                   <CountCard
//                     key={index}
//                     count={count}
//                     name={district}
//                     bgColor={generateColor(district)}
//                   />
//                 )
//               )}
//             </ul>
//           </div>
//         </div>
//       </div>
//       <table class="table">
//         <thead class="thead-dark">
//           <tr>
//             <th scope="col">Sr.No</th>
//             <th scope="col">Hotel Name</th>
//             {/* <th scope="col">State</th> */}
//             <th scope="col">District</th>
//             <th scope="col">View</th>
//             <th scope="col">Edit</th>
//             <th scope="col">Delete</th>
//           </tr>
//         </thead>
//         <tbody>
//           {hotels.map((hotel, index) => (
//             <tr key={index}>
//               <th scope="row">{index + 1}</th>
//               <td>{hotel.Hotelname}</td>
//               {/* <td>{hotel.state || "NA"}</td> */}
//               <td>{hotel.district || "NA"}</td>
//               <td style={{ display: "flex", justifyContent: "center" }}>
//                 <Link to={`/admin/${hotel.Hotelname}`}>
//                   <img src="view.png" width="25px" height="25px" />
//                 </Link>
//               </td>
//               <td>
//                 <img
//                   src="/update.png"
//                   width="25px"
//                   height="25px"
//                   // onClick={() => handleShow(item.uuid)}
//                 />
//               </td>
//               <td>
//                 <img
//                   src="delete.png"
//                   width="25px"
//                   height="25px"
//                   onClick={() => handleDeleteHotel(hotel.Hotelname)}
//                 />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </>
//   );
// };

// export default SuperAdminDashboard;
