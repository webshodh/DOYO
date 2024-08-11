

// // Import necessary dependencies
// import React, { useState, useEffect } from "react";
// import { db } from "../../firebase/firebase";
// import { onValue, remove, ref } from "firebase/database";
// import { useNavigate, useParams, Link } from "react-router-dom";
// import { Form } from "react-bootstrap";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import KeyInput from "./Key";
// function ViewHotel() {
//   const [hotels, sethotels] = useState([]);
//   const [isEdit, setIsEdit] = useState(false);
//   const [tempUuid, setTempUuid] = useState("");
//   const navigate = useNavigate();
//   const { hotelName } = useParams();
//   const [isKeyEntered, setIsKeyEntered] = useState(false);

//   useEffect(() => {
//     onValue(ref(db, "/"), (snapshot) => {
//       sethotels([]);
//       const data = snapshot.val();
//       if (data !== null) {
//         Object.values(data).map((item) => {
//           sethotels((oldArray) => [...oldArray, item]);
//         });
//       }
//     });
//   }, []);

//   const handleUpdate = (item) => {
//     setIsEdit(true);
//     setTempUuid(item.uuid);
//     navigate(`/updateHotel/${item.Hotelname}`);
//   };

//   const handleDelete = (item) => {
//     if (window.confirm("confirm delete")) {
//       remove(ref(db, `/${item.Hotelname}`));
//     }
//     toast.error("Hotel Deleted Successfully !", {
//       position: toast.POSITION.TOP_RIGHT,
//     });
//   };

//   const handleAddCategory = (item) => {
//     navigate(`/addCategory/${item.Hotelname}`);
//   };

//   const handleAddMenu = (item) => {
//     navigate(`/addMenu/${item.Hotelname}`);
//   };

//   const handleAddHotelInfo = (item) => {
//     navigate(`/addHotelInfo/${item.Hotelname}`);
//   };

//   const handleHotelHome = (item) => {
//     navigate(`/viewMenu/${item.Hotelname}`);
//   };

//   const handleKeyEntered = (isEntered) => {
//     setIsKeyEntered(isEntered);
//   };

//   return (
//     <div className="view-hotel-container">
//        {/* {isKeyEntered ? ( */}
//         <>
//       <h1>View Hotel</h1>
//       <div
//         // style={{
//         //   display: "grid",
//         //   gridTemplateColumns: "2fr 2fr",
//         //   marginLeft: "20px",
//         //   gap: "10px",
//         // }}
//       >
//         {hotels
//           .filter((item) => (hotelName ? item.Hotelname === hotelName : true))
//           .map((item) => (
//             <div className="card" key={item.uuid}>
//               <div
//                 className="card-header"
//                 style={{ display: "flex", justifyContent: "space-between" }}
//               >
//                 {item.Hotelname}
//                 {/* <Form>
//                   <Form.Check type="switch" id="custom-switch" label="" />
//                 </Form> */}
//               </div>
//               <div className="card-body">
//                 <button
//                   onClick={() => handleAddCategory(item)}
//                   className="btn btn-primary btn-margin"
//                 >
//                   Add Category
//                 </button>
//                 <button
//                   onClick={() => handleAddMenu(item)}
//                   className="btn btn-success btn-margin"
//                 >
//                   Add Menu
//                 </button>
//                 <button
//                   onClick={() => handleAddHotelInfo(item)}
//                   className="btn btn-warning btn-margin"
//                   style={{ color: "white" }}
//                 >
//                   Add Info
//                 </button>
//                 <button
//                   onClick={() => handleHotelHome(item)}
//                   className="btn btn-warning btn-margin"
//                   style={{ color: "white" }}
//                 >
//                   View Home
//                 </button>
//               </div>
//               <div
//                 className="card-footer text-muted"
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                 }}
//               >
//                 <img
//                   src="/update.png"
//                   alt="update"
//                   width="25px"
//                   height="25px"
//                   style={{ marginRight: "2px" }}
//                   onClick={() => handleUpdate(item)}
//                 />
//                 <div>
//                   <img
//                     src="/delete.png"
//                     alt="delete"
//                     width="25px"
//                     height="25px"
//                     style={{ marginRight: "2px" }}
//                     onClick={() => handleDelete(item)}
//                   />
//                   <ToastContainer />
//                 </div>
//               </div>
//             </div>
//           ))}
//       </div>
//       </>
//        {/* ) : (
//         // Render KeyInput if the key is not entered
//         <KeyInput onKeyEntered={handleKeyEntered} />
//       )} */}
//     </div>
    
//   );
// }

// export default ViewHotel;
