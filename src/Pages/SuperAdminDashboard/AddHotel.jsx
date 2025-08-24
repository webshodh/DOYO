// import React, { useState } from "react";
// import { db } from "../../data/firebase/firebaseConfig";
// import { v4 as uuidv4 } from "uuid";
// import { set, ref, push, get } from "firebase/database";
// import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { Form, Row, Col, Button, Card, Table } from "react-bootstrap";
// import styled from "styled-components";
// import {
//   FaPlus,
//   FaTrash,
//   FaCheckCircle,
//   FaExclamationCircle,
// } from "react-icons/fa";

// const AdminCard = styled(Card)`
//   margin-bottom: 15px;
//   border: 2px solid ${(props) => (props.isValid ? "#28a745" : "#dc3545")};
// `;

// function AddHotelWithAdmins() {
//   // Hotel Information States
//   const [hotelName, setHotelName] = useState("");

//   // Admin Management States
//   const [admins, setAdmins] = useState([
//     {
//       id: 1,
//       name: "",
//       email: "",
//       password: "",
//       contact: "",
//       role: "admin",
//       isExisting: false,
//       existingAdminId: "",
//     },
//   ]);

//   const auth = getAuth();

//   // Validation functions
//   const validateEmail = (email) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const validatePassword = (password) => {
//     return password.length >= 6;
//   };

//   const validatePinCode = (pinCode) => {
//     return /^\d{6}$/.test(pinCode);
//   };

//   const validateContact = (contact) => {
//     return /^\d{10}$/.test(contact);
//   };

//   // Add new admin form
//   const addNewAdmin = () => {
//     if (admins.length < 2) {
//       const newAdmin = {
//         id: admins.length + 1,
//         name: "",
//         email: "",
//         password: "",
//         contact: "",
//         role: "admin",
//         isExisting: false,
//         existingAdminId: "",
//       };
//       setAdmins([...admins, newAdmin]);
//     } else {
//       toast.warning("Maximum 2 admins allowed per hotel");
//     }
//   };

//   // Remove admin
//   const removeAdmin = (adminId) => {
//     if (admins.length > 1) {
//       setAdmins(admins.filter((admin) => admin.id !== adminId));
//     } else {
//       toast.warning("At least one admin is required");
//     }
//   };

//   // Update admin field
//   const updateAdmin = (adminId, field, value) => {
//     setAdmins(
//       admins.map((admin) =>
//         admin.id === adminId ? { ...admin, [field]: value } : admin
//       )
//     );
//   };

//   // Check if existing admin exists
//   const checkExistingAdmin = async (email, adminId) => {
//     try {
//       const adminsRef = ref(db, "admins");
//       const snapshot = await get(adminsRef);

//       if (snapshot.exists()) {
//         const allAdmins = snapshot.val();
//         for (const [existingAdminId, adminData] of Object.entries(allAdmins)) {
//           if (adminData.email === email) {
//             updateAdmin(adminId, "isExisting", true);
//             updateAdmin(adminId, "existingAdminId", existingAdminId);
//             updateAdmin(adminId, "name", adminData.name);
//             updateAdmin(adminId, "contact", adminData.contact);
//             toast.info(`Found existing admin: ${adminData.name}`);
//             return true;
//           }
//         }
//       }
//       updateAdmin(adminId, "isExisting", false);
//       updateAdmin(adminId, "existingAdminId", "");
//       return false;
//     } catch (error) {
//       console.error("Error checking existing admin:", error);
//       return false;
//     }
//   };

//   // Validate all form fields
//   const validateForm = () => {
//     const errors = [];

//     // Hotel validation
//     if (!hotelName.trim()) errors.push("Hotel Name is required");

//     // Admin validation
//     admins.forEach((admin, index) => {
//       if (!admin.name.trim())
//         errors.push(`Admin ${index + 1}: Name is required`);
//       if (!admin.email.trim() || !validateEmail(admin.email))
//         errors.push(`Admin ${index + 1}: Valid email is required`);
//       if (
//         !admin.isExisting &&
//         (!admin.password.trim() || !validatePassword(admin.password))
//       ) {
//         errors.push(
//           `Admin ${index + 1}: Password must be at least 6 characters`
//         );
//       }
//       if (!admin.contact.trim() || !validateContact(admin.contact))
//         errors.push(`Admin ${index + 1}: Valid 10-digit contact is required`);
//     });

//     return errors;
//   };

//   // Create new admin account
//   const createAdminAccount = async (adminData) => {
//     try {
//       const userCredential = await createUserWithEmailAndPassword(
//         auth,
//         adminData.email,
//         adminData.password
//       );
//       return userCredential.user.uid;
//     } catch (error) {
//       console.error("Error creating admin account:", error);
//       throw error;
//     }
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const validationErrors = validateForm();
//     if (validationErrors.length > 0) {
//       validationErrors.forEach((error) => toast.error(error));
//       return;
//     }

//     const hotelUuid = uuidv4();

//     try {
//       // Prepare hotel data
//       const hotelData = {
//         uuid: hotelUuid,
//         hotelName,
//         createdAt: new Date().toISOString(),
//         status: "active",
//       };

//       // Process admins
//       const hotelAdmins = [];

//       for (const admin of admins) {
//         let adminId;

//         if (admin.isExisting) {
//           adminId = admin.existingAdminId;
//         } else {
//           // Create new admin account
//           adminId = await createAdminAccount(admin);

//           // Save new admin details
//           const newAdminData = {
//             name: admin.name,
//             email: admin.email,
//             contact: admin.contact,
//             role: admin.role,
//             createdAt: new Date().toISOString(),
//             hotels: {},
//           };

//           // await set(ref(db, `admins/${adminId}`), newAdminData);
//         }

//         hotelAdmins.push({
//           adminId,
//           name: admin.name,
//           email: admin.email,
//           contact: admin.contact,
//           role: admin.role,
//           assignedAt: new Date().toISOString(),
//         });

//         // Update admin's hotel list
//         await set(ref(db, `admins/${adminId}/hotels/${hotelName}`), {
//           hotelName,
//           hotelUuid,
//           assignedAt: new Date().toISOString(),
//         });
//       }

//       // Add admins to hotel data
//       hotelData.admins = hotelAdmins.reduce((acc, admin) => {
//         acc[admin.adminId] = admin;
//         return acc;
//       }, {});

//       // Save hotel data
//       await set(ref(db, `/hotels/${hotelName}/info`), hotelData);

//       // Also maintain hotel name index for easy lookup
//       // await set(ref(db, `hotelIndex/${hotelName.toLowerCase().replace(/\s+/g, '_')}`), {
//       //   hotelUuid,
//       //   hotelName
//       // });

//       // Reset form
//       resetForm();

//       toast.success("Hotel and Admin(s) added successfully!", {
//         position: toast.POSITION.TOP_RIGHT,
//       });
//     } catch (error) {
//       console.error("Error adding hotel:", error);
//       toast.error(`Error: ${error.message}`, {
//         position: toast.POSITION.TOP_RIGHT,
//       });
//     }
//   };

//   const resetForm = () => {
//     setHotelName("");
//     setAdmins([
//       {
//         id: 1,
//         name: "",
//         email: "",
//         password: "",
//         contact: "",
//         role: "admin",
//         isExisting: false,
//         existingAdminId: "",
//       },
//     ]);
//   };

//   return (
//     <>
//       <div className="container mt-4">
//         <h2 className="mb-4">Add Hotel with Admin Management</h2>

//         <Form onSubmit={handleSubmit}>
//           {/* Basic Hotel Information */}
//           <Card className="mb-4">
//             <Card.Header>
//               <h4>Basic Hotel Information</h4>
//             </Card.Header>
//             <Card.Body>
//               <Row>
//                 <Col md={6}>
//                   <Form.Group controlId="hotelName" className="mb-3">
//                     <Form.Label>Hotel Name *</Form.Label>
//                     <Form.Control
//                       type="text"
//                       value={hotelName}
//                       onChange={(e) => setHotelName(e.target.value)}
//                       placeholder="Enter Hotel Name"
//                       isInvalid={!hotelName.trim()}
//                       isValid={hotelName.trim()}
//                     />
//                   </Form.Group>
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>

//           {/* Admin Management */}
//           <Card className="mb-4">
//             <Card.Header className="d-flex justify-content-between align-items-center">
//               <h4>Admin Management</h4>
//               <Button
//                 variant="outline-primary"
//                 size="sm"
//                 onClick={addNewAdmin}
//                 disabled={admins.length >= 2}
//               >
//                 <FaPlus /> Add Admin
//               </Button>
//             </Card.Header>
//             <Card.Body>
//               {admins.map((admin, index) => (
//                 <AdminCard
//                   key={admin.id}
//                   isValid={admin.name && admin.email && admin.contact}
//                 >
//                   <Card.Header className="d-flex justify-content-between align-items-center">
//                     <h6>Admin {index + 1}</h6>
//                     {admins.length > 1 && (
//                       <Button
//                         variant="outline-danger"
//                         size="sm"
//                         onClick={() => removeAdmin(admin.id)}
//                       >
//                         <FaTrash />
//                       </Button>
//                     )}
//                   </Card.Header>
//                   <Card.Body>
//                     <Row>
//                       <Col md={6}>
//                         <Form.Group className="mb-3">
//                           <Form.Label>Admin Name *</Form.Label>
//                           <Form.Control
//                             type="text"
//                             value={admin.name}
//                             onChange={(e) =>
//                               updateAdmin(admin.id, "name", e.target.value)
//                             }
//                             placeholder="Enter admin name"
//                             disabled={admin.isExisting}
//                             isInvalid={!admin.name.trim()}
//                             isValid={admin.name.trim()}
//                           />
//                         </Form.Group>
//                       </Col>

//                       <Col md={6}>
//                         <Form.Group className="mb-3">
//                           <Form.Label>Admin Email *</Form.Label>
//                           <Form.Control
//                             type="email"
//                             value={admin.email}
//                             onChange={(e) =>
//                               updateAdmin(admin.id, "email", e.target.value)
//                             }
//                             onBlur={() =>
//                               checkExistingAdmin(admin.email, admin.id)
//                             }
//                             placeholder="Enter admin email"
//                             isInvalid={
//                               !admin.email.trim() || !validateEmail(admin.email)
//                             }
//                             isValid={
//                               admin.email.trim() && validateEmail(admin.email)
//                             }
//                           />
//                           {admin.isExisting && (
//                             <Form.Text className="text-info">
//                               ✓ Existing admin found - will be linked to this
//                               hotel
//                             </Form.Text>
//                           )}
//                         </Form.Group>
//                       </Col>
//                     </Row>

//                     <Row>
//                       <Col md={6}>
//                         <Form.Group className="mb-3">
//                           <Form.Label>Contact Number *</Form.Label>
//                           <Form.Control
//                             type="tel"
//                             value={admin.contact}
//                             onChange={(e) =>
//                               updateAdmin(admin.id, "contact", e.target.value)
//                             }
//                             placeholder="Enter 10-digit contact"
//                             maxLength="10"
//                             disabled={admin.isExisting}
//                             isInvalid={
//                               !admin.contact.trim() ||
//                               !validateContact(admin.contact)
//                             }
//                             isValid={
//                               admin.contact.trim() &&
//                               validateContact(admin.contact)
//                             }
//                           />
//                         </Form.Group>
//                       </Col>

//                       <Col md={6}>
//                         <Form.Group className="mb-3">
//                           <Form.Label>
//                             Password{" "}
//                             {admin.isExisting
//                               ? "(Not Required - Existing Admin)"
//                               : "*"}
//                           </Form.Label>
//                           <Form.Control
//                             type="password"
//                             value={admin.password}
//                             onChange={(e) =>
//                               updateAdmin(admin.id, "password", e.target.value)
//                             }
//                             placeholder="Enter password (min 6 characters)"
//                             disabled={admin.isExisting}
//                             isInvalid={
//                               !admin.isExisting &&
//                               (!admin.password.trim() ||
//                                 !validatePassword(admin.password))
//                             }
//                             isValid={
//                               admin.isExisting ||
//                               (admin.password.trim() &&
//                                 validatePassword(admin.password))
//                             }
//                           />
//                           {!admin.isExisting && (
//                             <Form.Text className="text-muted">
//                               Password must be at least 6 characters long
//                             </Form.Text>
//                           )}
//                         </Form.Group>
//                       </Col>
//                     </Row>
//                   </Card.Body>
//                 </AdminCard>
//               ))}
//             </Card.Body>
//           </Card>

//           <div className="d-flex gap-3 mb-4">
//             <Button variant="success" type="submit" size="lg">
//               Create Hotel with Admin(s)
//             </Button>
//             <Button
//               variant="outline-secondary"
//               type="button"
//               onClick={resetForm}
//               size="lg"
//             >
//               Reset Form
//             </Button>
//           </div>
//         </Form>
//       </div>
//       <ToastContainer />
//     </>
//   );
// }

// export default AddHotelWithAdmins;

import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HotelFormModal from "../../components/HotelFormModal";
import { useHotel } from "../../customHooks/useHotel";

function AddHotelWithAdmins() {
  const {
    // State
    hotelName,
    admins,
    loading,
    submitting,

    // Actions
    setHotelName,
    addNewAdmin,
    removeAdmin,
    updateAdmin,
    checkExistingAdmin,
    submitHotelWithAdmins,
    resetForm,

    // Computed values
    getAdminValidationStatus,
    getFormValidationStatus,

    // Utilities
    canAddMoreAdmins,
    canRemoveAdmin,
  } = useHotel();

  const handleSubmit = async () => {
    const validationStatus = getFormValidationStatus();

    if (!validationStatus.isFormValid) {
      return;
    }

    await submitHotelWithAdmins();
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Checking admin information...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <HotelFormModal
        hotelName={hotelName}
        admins={admins}
        onHotelNameChange={setHotelName}
        onAddAdmin={addNewAdmin}
        onRemoveAdmin={removeAdmin}
        onUpdateAdmin={updateAdmin}
        onCheckExistingAdmin={checkExistingAdmin}
        onSubmit={handleSubmit}
        onReset={resetForm}
        canAddMoreAdmins={canAddMoreAdmins}
        canRemoveAdmin={canRemoveAdmin}
        submitting={submitting}
        getAdminValidationStatus={getAdminValidationStatus}
      />
      <ToastContainer />
    </>
  );
}

export default AddHotelWithAdmins;
