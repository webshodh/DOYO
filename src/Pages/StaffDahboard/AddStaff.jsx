// import React, { useState } from "react";
// import styled from "styled-components";
// import { db } from "../../data/firebase/firebaseConfig"; // Import your firebase configuration
// import { ref, set } from "firebase/database"; // Import the necessary functions from the Firebase SDK
// import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

// export const FormContainer = styled.div`
//   display: flex;
//   flex-wrap: wrap;
//   gap: 20px;
//   margin: 20px;
//   flex-direction: column;
// `;

// export const SectionTitle = styled.h2`
//   margin-top: 30px;
//   font-size: 1.5rem;
//   border-bottom: 1px solid #ccc;
//   padding-bottom: 10px;
// `;

// export const InputWrapper = styled.div`
//   display: flex;
//   flex-direction: column;
//   margin-bottom: 20px;
// `;

// export const Label = styled.label`
//   margin-bottom: 8px;
//   font-weight: bold;
// `;

// export const Input = styled.input`
//   padding: 10px;
//   border: 1px solid
//     ${(props) => (props.error ? "#dc3545" : props.success ? "#28a745" : "#ccc")};
//   border-radius: 4px;
//   outline: none;
//   box-shadow: ${(props) =>
//     props.error ? "0 0 0 1px rgba(220, 53, 69, 0.5)" : "none"};

//   &:focus {
//     border-color: ${(props) => (props.error ? "#dc3545" : "#80bdff")};
//     box-shadow: ${(props) =>
//       props.error
//         ? "0 0 0 1px rgba(220, 53, 69, 0.5)"
//         : "0 0 0 0.2rem rgba(38, 143, 255, 0.25)"};
//   }
// `;

// export const Icon = styled.div`
//   position: absolute;
//   right: 10px;
//   top: 50%;
//   transform: translateY(-50%);
//   color: ${(props) => (props.error ? "#dc3545" : "#28a745")};
// `;

// export const ErrorMessage = styled.p`
//   color: #dc3545;
//   font-size: 0.875rem;
//   margin: 5px 0 0;
// `;

// export const Button = styled.button`
//   width: 200px;
//   border: none;
//   border-radius: 4px;
//   cursor: pointer;
//   color: white;
//   background-color: ${(props) => (props.primary ? "#28a745" : "#dc3545")};
//   margin-top: 10px;

//   &:hover {
//     background-color: ${(props) => (props.primary ? "#218838" : "#c82333")};
//   }
// `;

// function AddStaff() {
//   const [personalInfo, setPersonalInfo] = useState({
//     firstName: "",
//     lastName: "",
//     dob: "",
//     gender: "",
//     aadharNumber: "",
//   });

//   const [contactInfo, setContactInfo] = useState({
//     mobileNumber: "",
//     email: "",
//     residentialAddress: "",
//     emergencyContactName: "",
//     emergencyContactNumber: "",
//   });

//   const [employmentDetails, setEmploymentDetails] = useState({
//     role: "",
//     employeeId: "",
//     joiningDate: "",
//     shiftTiming: "",
//     department: "",
//     workLocation: "",
//   });

//   const [additionalInfo, setAdditionalInfo] = useState({
//     bankAccountDetails: "",
//     panCardNumber: "",
//     previousEmploymentHistory: "",
//     skills: "",
//     photograph: "",
//   });

//   const [formErrors, setFormErrors] = useState({
//     firstName: false,
//     lastName: false,
//     dob: false,
//     gender: false,
//     aadharNumber: false,
//     mobileNumber: false,
//     email: false,
//     residentialAddress: false,
//     emergencyContactName: false,
//     emergencyContactNumber: false,
//     role: false,
//     employeeId: false,
//     joiningDate: false,
//     shiftTiming: false,
//     department: false,
//     workLocation: false,
//     bankAccountDetails: false,
//     panCardNumber: false,
//   });

//   const handleInputChange = (section, field, value) => {
//     switch (section) {
//       case "personalInfo":
//         setPersonalInfo({ ...personalInfo, [field]: value });
//         break;
//       case "contactInfo":
//         setContactInfo({ ...contactInfo, [field]: value });
//         break;
//       case "employmentDetails":
//         setEmploymentDetails({ ...employmentDetails, [field]: value });
//         break;
//       case "additionalInfo":
//         setAdditionalInfo({ ...additionalInfo, [field]: value });
//         break;
//       default:
//         break;
//     }
//   };

//   const handleSubmit = async () => {
//     // Reset errors
//     const newErrors = {
//       firstName: !personalInfo.firstName,
//       lastName: !personalInfo.lastName,
//       dob: !personalInfo.dob,
//       gender: !personalInfo.gender,
//       aadharNumber: !personalInfo.aadharNumber,
//       mobileNumber: !contactInfo.mobileNumber,
//       email: !contactInfo.email,
//       residentialAddress: !contactInfo.residentialAddress,
//       emergencyContactName: !contactInfo.emergencyContactName,
//       emergencyContactNumber: !contactInfo.emergencyContactNumber,
//       role: !employmentDetails.role,
//       employeeId: !employmentDetails.employeeId,
//       joiningDate: !employmentDetails.joiningDate,
//       shiftTiming: !employmentDetails.shiftTiming,
//       department: !employmentDetails.department,
//       workLocation: !employmentDetails.workLocation,
//       bankAccountDetails: !additionalInfo.bankAccountDetails,
//       panCardNumber: !additionalInfo.panCardNumber,
//     };
//     setFormErrors(newErrors);

//     // Check if there are any errors
//     if (Object.values(newErrors).some((error) => error)) {
//       return; // Stop submission if there are errors
//     }

//     // Handle successful form submission
//     const staffData = {
//       personalInfo,
//     //   contactInfo,
//     //   employmentDetails,
//       additionalInfo,
//     };

//     try {
//       // Store data in Firebase
//       const staffRef = ref(db, 'staff/' + personalInfo.aadharNumber); // Using Aadhar number as the unique key
//       await set(staffRef, staffData);
//       console.log("Staff data stored successfully:", staffData);
//       // Optionally, reset the form
//       resetForm();
//     } catch (error) {
//       console.error("Error storing data in Firebase:", error);
//     }
//   };

//   const resetForm = () => {
//     setPersonalInfo({
//       firstName: "",
//       lastName: "",
//       dob: "",
//       gender: "",
//       aadharNumber: "",
//     });
//     setContactInfo({
//       mobileNumber: "",
//       email: "",
//       residentialAddress: "",
//       emergencyContactName: "",
//       emergencyContactNumber: "",
//     });
//     setEmploymentDetails({
//       role: "",
//       employeeId: "",
//       joiningDate: "",
//       shiftTiming: "",
//       department: "",
//       workLocation: "",
//     });
//     setAdditionalInfo({
//       bankAccountDetails: "",
//       panCardNumber: "",
//       previousEmploymentHistory: "",
//       skills: "",
//       photograph: "",
//     });
//     setFormErrors({});
//   };

//   return (
//     <FormContainer>
//       <div className="background-card p-3">
//         <SectionTitle>Personal Information</SectionTitle>
//         <div className="row g-3">
//           <div className="col-md-6">
//             <InputWrapper>
//               <Label>First Name</Label>
//               <Input
//                 type="text"
//                 value={personalInfo.firstName}
//                 onChange={(e) =>
//                   handleInputChange("personalInfo", "firstName", e.target.value)
//                 }
//                 placeholder="Enter First Name"
//                 className={`form-control ${
//                   formErrors.firstName ? "is-invalid" : ""
//                 }`}
//               />
//               {formErrors.firstName && (
//                 <ErrorMessage>First Name is required.</ErrorMessage>
//               )}
//             </InputWrapper>
//           </div>
//           <div className="col-md-6">
//             <InputWrapper>
//               <Label>Last Name</Label>
//               <Input
//                 type="text"
//                 value={personalInfo.lastName}
//                 onChange={(e) =>
//                   handleInputChange("personalInfo", "lastName", e.target.value)
//                 }
//                 placeholder="Enter Last Name"
//                 className={`form-control ${
//                   formErrors.lastName ? "is-invalid" : ""
//                 }`}
//               />
//               {formErrors.lastName && (
//                 <ErrorMessage>Last Name is required.</ErrorMessage>
//               )}
//             </InputWrapper>
//           </div>
//           <div className="col-md-6">
//             <InputWrapper>
//               <Label>Date of Birth</Label>
//               <Input
//                 type="date"
//                 value={personalInfo.dob}
//                 onChange={(e) =>
//                   handleInputChange("personalInfo", "dob", e.target.value)
//                 }
//                 className={`form-control ${formErrors.dob ? "is-invalid" : ""}`}
//               />
//               {formErrors.dob && (
//                 <ErrorMessage>Date of Birth is required.</ErrorMessage>
//               )}
//             </InputWrapper>
//           </div>
//           <div className="col-md-6">
//             <InputWrapper>
//               <Label>Gender</Label>
//               <Input
//                 type="text"
//                 value={personalInfo.gender}
//                 onChange={(e) =>
//                   handleInputChange("personalInfo", "gender", e.target.value)
//                 }
//                 placeholder="Enter Gender"
//                 className={`form-control ${
//                   formErrors.gender ? "is-invalid" : ""
//                 }`}
//               />
//               {formErrors.gender && (
//                 <ErrorMessage>Gender is required.</ErrorMessage>
//               )}
//             </InputWrapper>
//           </div>
//           <div className="col-md-6">
//             <InputWrapper>
//               <Label>Aadhar Number</Label>
//               <Input
//                 type="text"
//                 value={personalInfo.aadharNumber}
//                 onChange={(e) =>
//                   handleInputChange(
//                     "personalInfo",
//                     "aadharNumber",
//                     e.target.value
//                   )
//                 }
//                 placeholder="Enter Aadhar Number"
//                 className={`form-control ${
//                   formErrors.aadharNumber ? "is-invalid" : ""
//                 }`}
//               />
//               {formErrors.aadharNumber && (
//                 <ErrorMessage>Aadhar Number is required.</ErrorMessage>
//               )}
//             </InputWrapper>
//           </div>
//         </div>
//       </div>

//       {/* <div className="background-card p-3">
//         <SectionTitle>Contact Information</SectionTitle>
//         <div className="row g-3">
//           <div className="col-md-6">
//             <InputWrapper>
//               <Label>Mobile Number</Label>
//               <Input
//                 type="text"
//                 value={contactInfo.mobileNumber}
//                 onChange={(e) =>
//                   handleInputChange("contactInfo", "mobileNumber", e.target.value)
//                 }
//                 placeholder="Enter Mobile Number"
//                 className={`form-control ${
//                   formErrors.mobileNumber ? "is-invalid" : ""
//                 }`}
//               />
//               {formErrors.mobileNumber && (
//                 <ErrorMessage>Mobile Number is required.</ErrorMessage>
//               )}
//             </InputWrapper>
//           </div>
//           <div className="col-md-6">
//             <InputWrapper>
//               <Label>Email</Label>
//               <Input
//                 type="email"
//                 value={contactInfo.email}
//                 onChange={(e) =>
//                   handleInputChange("contactInfo", "email", e.target.value)
//                 }
//                 placeholder="Enter Email"
//                 className={`form-control ${
//                   formErrors.email ? "is-invalid" : ""
//                 }`}
//               />
//               {formErrors.email && (
//                 <ErrorMessage>Email is required.</ErrorMessage>
//               )}
//             </InputWrapper>
//           </div>
//           <div className="col-md-6">
//             <InputWrapper>
//               <Label>Residential Address</Label>
//               <Input
//                 type="text"
//                 value={contactInfo.residentialAddress}
//                 onChange={(e) =>
//                   handleInputChange(
//                     "contactInfo",
//                     "residentialAddress",
//                     e.target.value
//                   )
//                 }
//                 placeholder="Enter Residential Address"
//                 className={`form-control ${
//                   formErrors.residentialAddress ? "is-invalid" : ""
//                 }`}
//               />
//               {formErrors.residentialAddress && (
//                 <ErrorMessage>Residential Address is required.</ErrorMessage>
//               )}
//             </InputWrapper>
//           </div>
//           <div className="col-md-6">
//             <InputWrapper>
//               <Label>Emergency Contact Name</Label>
//               <Input
//                 type="text"
//                 value={contactInfo.emergencyContactName}
//                 onChange={(e) =>
//                   handleInputChange(
//                     "contactInfo",
//                     "emergencyContactName",
//                     e.target.value
//                   )
//                 }
//                 placeholder="Enter Emergency Contact Name"
//                 className={`form-control ${
//                   formErrors.emergencyContactName ? "is-invalid" : ""
//                 }`}
//               />
//               {formErrors.emergencyContactName && (
//                 <ErrorMessage>Emergency Contact Name is required.</ErrorMessage>
//               )}
//             </InputWrapper>
//           </div>
//           <div className="col-md-6">
//             <InputWrapper>
//               <Label>Emergency Contact Number</Label>
//               <Input
//                 type="text"
//                 value={contactInfo.emergencyContactNumber}
//                 onChange={(e) =>
//                   handleInputChange(
//                     "contactInfo",
//                     "emergencyContactNumber",
//                     e.target.value
//                   )
//                 }
//                 placeholder="Enter Emergency Contact Number"
//                 className={`form-control ${
//                   formErrors.emergencyContactNumber ? "is-invalid" : ""
//                 }`}
//               />
//               {formErrors.emergencyContactNumber && (
//                 <ErrorMessage>Emergency Contact Number is required.</ErrorMessage>
//               )}
//             </InputWrapper>
//           </div>
//         </div>
//       </div>

//       <div className="background-card p-3">
//         <SectionTitle>Employment Details</SectionTitle>
//         <div className="row g-3">
//           <div className="col-md-6">
//             <InputWrapper>
//               <Label>Role/Position</Label>
//               <Input
//                 type="text"
//                 value={employmentDetails.role}
//                 onChange={(e) =>
//                   handleInputChange("employmentDetails", "role", e.target.value)
//                 }
//                 placeholder="Enter Role/Position"
//                 className={`form-control ${
//                   formErrors.role ? "is-invalid" : ""
//                 }`}
//               />
//               {formErrors.role && (
//                 <ErrorMessage>Role/Position is required.</ErrorMessage>
//               )}
//             </InputWrapper>
//           </div>
//           <div className="col-md-6">
//             <InputWrapper>
//               <Label>Employee ID</Label>
//               <Input
//                 type="text"
//                 value={employmentDetails.employeeId}
//                 onChange={(e) =>
//                   handleInputChange(
//                     "employmentDetails",
//                     "employeeId",
//                     e.target.value
//                   )
//                 }
//                 placeholder="Enter Employee ID"
//                 className={`form-control ${
//                   formErrors.employeeId ? "is-invalid" : ""
//                 }`}
//               />
//               {formErrors.employeeId && (
//                 <ErrorMessage>Employee ID is required.</ErrorMessage>
//               )}
//             </InputWrapper>
//           </div>
//           <div className="col-md-6">
//             <InputWrapper>
//               <Label>Joining Date</Label>
//               <Input
//                 type="date"
//                 value={employmentDetails.joiningDate}
//                 onChange={(e) =>
//                   handleInputChange(
//                     "employmentDetails",
//                     "joiningDate",
//                     e.target.value
//                   )
//                 }
//                 className={`form-control ${
//                   formErrors.joiningDate ? "is-invalid" : ""
//                 }`}
//               />
//               {formErrors.joiningDate && (
//                 <ErrorMessage>Joining Date is required.</ErrorMessage>
//               )}
//             </InputWrapper>
//           </div>
//           <div className="col-md-6">
//             <InputWrapper>
//               <Label>Shift Timing</Label>
//               <Input
//                 type="text"
//                 value={employmentDetails.shiftTiming}
//                 onChange={(e) =>
//                   handleInputChange(
//                     "employmentDetails",
//                     "shiftTiming",
//                     e.target.value
//                   )
//                 }
//                 placeholder="Enter Shift Timing"
//                 className={`form-control ${
//                   formErrors.shiftTiming ? "is-invalid" : ""
//                 }`}
//               />
//               {formErrors.shiftTiming && (
//                 <ErrorMessage>Shift Timing is required.</ErrorMessage>
//               )}
//             </InputWrapper>
//           </div>
//           <div className="col-md-6">
//             <InputWrapper>
//               <Label>Department</Label>
//               <Input
//                 type="text"
//                 value={employmentDetails.department}
//                 onChange={(e) =>
//                   handleInputChange(
//                     "employmentDetails",
//                     "department",
//                     e.target.value
//                   )
//                 }
//                 placeholder="Enter Department"
//                 className={`form-control ${
//                   formErrors.department ? "is-invalid" : ""
//                 }`}
//               />
//               {formErrors.department && (
//                 <ErrorMessage>Department is required.</ErrorMessage>
//               )}
//             </InputWrapper>
//           </div>
//           <div className="col-md-6">
//             <InputWrapper>
//               <Label>Work Location</Label>
//               <Input
//                 type="text"
//                 value={employmentDetails.workLocation}
//                 onChange={(e) =>
//                   handleInputChange(
//                     "employmentDetails",
//                     "workLocation",
//                     e.target.value
//                   )
//                 }
//                 placeholder="Enter Work Location"
//                 className={`form-control ${
//                   formErrors.workLocation ? "is-invalid" : ""
//                 }`}
//               />
//               {formErrors.workLocation && (
//                 <ErrorMessage>Work Location is required.</ErrorMessage>
//               )}
//             </InputWrapper>
//           </div>
//         </div>
//       </div> */}

//       <div className="background-card p-3">
//         <SectionTitle>Additional Information</SectionTitle>
//         <div className="row g-3">
//           <div className="col-md-6">
//             <InputWrapper>
//               <Label>Bank Account Details</Label>
//               <Input
//                 type="text"
//                 value={additionalInfo.bankAccountDetails}
//                 onChange={(e) =>
//                   handleInputChange(
//                     "additionalInfo",
//                     "bankAccountDetails",
//                     e.target.value
//                   )
//                 }
//                 placeholder="Enter Bank Account Details"
//                 className={`form-control ${
//                   formErrors.bankAccountDetails ? "is-invalid" : ""
//                 }`}
//               />
//               {formErrors.bankAccountDetails && (
//                 <ErrorMessage>Bank Account Details are required.</ErrorMessage>
//               )}
//             </InputWrapper>
//           </div>
//           <div className="col-md-6">
//             <InputWrapper>
//               <Label>PAN Card Number</Label>
//               <Input
//                 type="text"
//                 value={additionalInfo.panCardNumber}
//                 onChange={(e) =>
//                   handleInputChange(
//                     "additionalInfo",
//                     "panCardNumber",
//                     e.target.value
//                   )
//                 }
//                 placeholder="Enter PAN Card Number"
//                 className={`form-control ${
//                   formErrors.panCardNumber ? "is-invalid" : ""
//                 }`}
//               />
//               {formErrors.panCardNumber && (
//                 <ErrorMessage>PAN Card Number is required.</ErrorMessage>
//               )}
//             </InputWrapper>
//           </div>
//           <div className="col-md-6">
//             <InputWrapper>
//               <Label>Previous Employment History</Label>
//               <Input
//                 type="text"
//                 value={additionalInfo.previousEmploymentHistory}
//                 onChange={(e) =>
//                   handleInputChange(
//                     "additionalInfo",
//                     "previousEmploymentHistory",
//                     e.target.value
//                   )
//                 }
//                 placeholder="Enter Previous Employment History"
//                 className="form-control"
//               />
//             </InputWrapper>
//           </div>
//           <div className="col-md-6">
//             <InputWrapper>
//               <Label>Skills/Certifications</Label>
//               <Input
//                 type="text"
//                 value={additionalInfo.skills}
//                 onChange={(e) =>
//                   handleInputChange(
//                     "additionalInfo",
//                     "skills",
//                     e.target.value
//                   )
//                 }
//                 placeholder="Enter Skills/Certifications"
//                 className="form-control"
//               />
//             </InputWrapper>
//           </div>
//           <div className="col-md-6">
//             <InputWrapper>
//               <Label>Photograph</Label>
//               <Input
//                 type="file"
//                 onChange={(e) =>
//                   handleInputChange(
//                     "additionalInfo",
//                     "photograph",
//                     e.target.files[0]
//                   )
//                 }
//                 className="form-control"
//               />
//             </InputWrapper>
//           </div>
//         </div>
//       </div>

//       <Button primary onClick={handleSubmit}>
//         Submit
//       </Button>
//     </FormContainer>
//   );
// }

// export default AddStaff;
import React, { useState, useEffect } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { ref, set, onValue, remove, update } from "firebase/database";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled from "styled-components";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { getAuth } from "firebase/auth";
import { uid } from "uid";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { useHotelContext } from "Context/HotelContext";
import { useNavigate } from "react-router-dom";
import { ViewStaffColumns } from "../../data/Columns";
import { DynamicTable, FilterSortSearch } from "components";

// Styled components for the form
const FormContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin: 20px;
`;

const InputWrapper = styled.div`
  flex: 1 1 calc(50% - 300px);
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

const Label = styled.label`
  margin-bottom: 8px;
  font-weight: bold;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid
    ${(props) =>
      props.error ? "#dc3545" : props.success ? "#28a745" : "#ccc"};
  border-radius: 4px;
  outline: none;
  box-shadow: ${(props) =>
    props.error ? "0 0 0 1px rgba(220, 53, 69, 0.5)" : "none"};

  &:focus {
    border-color: ${(props) => (props.error ? "#dc3545" : "#80bdff")};
    box-shadow: ${(props) =>
      props.error
        ? "0 0 0 1px rgba(220, 53, 69, 0.5)"
        : "0 0 0 0.2rem rgba(38, 143, 255, 0.25)"};
`;

const Icon = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: ${(props) => (props.error ? "#dc3545" : "#28a745")};
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  font-size: 0.875rem;
  margin: 5px 0 0;
`;

const Button = styled.button`
  width: 200px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  background-color: ${(props) => (props.primary ? "#28a745" : "#dc3545")};
  margin-top: 10px;

  &:hover {
    background-color: ${(props) => (props.primary ? "#218838" : "#c82333")};
  }
`;

function AddStaff() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [role, setRole] = useState("");
  const [file, setFile] = useState(null); // State to hold the selected image file
  const [roles, setRoles] = useState([]); // Example roles
  const [selectedRole, setSelectedRole] = useState("");
  const [staff, setStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleCounts, setRoleCounts] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const navigate = useNavigate(); // Initialize navigate function for redirection

  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const adminID = currentAdminId;
  const { hotelName } = useHotelContext(); // Replace with your hotel name or use context
  const storage = getStorage();

  // Handle image file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !upiId || !role) {
      toast.error("All fields are required!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }

    const newStaffId = uid(); // Generate a unique ID for the new staff member

    try {
      let imageUrl = null;

      if (file) {
        // Upload image to Firebase Storage
        const imageRef = storageRef(
          storage,
          `staff_images/${hotelName}/${file.name}`
        );
        await uploadBytes(imageRef, file);

        // Get the download URL of the uploaded image
        imageUrl = await getDownloadURL(imageRef);
      }

      // Add new staff member under the admin's collection
      const staffData = {
        firstName,
        lastName,
        upiId,
        role,
        imageUrl, // Store the image URL in the database
        uuid: newStaffId,
      };

      await set(
        ref(db, `/admins/${adminID}/hotels/${hotelName}/staff/${newStaffId}`),
        staffData
      );

      // If the staff role is 'Captain', also store the data in the public hotel staff collection
      if (role === "Captain") {
        await set(
          ref(db, `/hotels/${hotelName}/staff/${newStaffId}`),
          staffData
        );
      }

      toast.success("Staff Added Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });

      // Clear form fields
      setFirstName("");
      setLastName("");
      setUpiId("");
      setRole("");
      setFile(null);
    } catch (error) {
      toast.error("Error adding staff: " + error.message, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  // Fetch staff data from database
  useEffect(() => {
    const staffRef = ref(db, `/hotels/${hotelName}/staff/`);
    const unsubscribe = onValue(staffRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const staffArray = Object.values(data);
        setStaff(staffArray);
      } else {
        setStaff([]); // Clear staff if none exist
      }
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [hotelName, currentAdminId]);

  // Fetch roles from database
  useEffect(() => {
    const rolesRef = ref(db, `/hotels/${hotelName}/roles/`);
    const unsubscribe = onValue(rolesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const rolesArray = Object.values(data);
        setRoles(rolesArray);
      } else {
        setRoles([]); // Clear roles if none exist
      }
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [hotelName, currentAdminId]);

  useEffect(() => {
    const countsByRole = {};
    staff.forEach((staffMember) => {
      const role = staffMember.role;
      countsByRole[role] = (countsByRole[role] || 0) + 1;
    });

    setRoleCounts(countsByRole);
  }, [staff]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = (staffMember) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this staff member?"
    );
    if (confirmDelete) {
      // Delete the staff member
      remove(ref(db, `/hotels/${hotelName}/staff/${staffMember.uuid}`));

      toast.success("Staff Member Deleted Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const handleEdit = (role) => {
    setIsEdit(true);
    setFirstName(role.FirstName);
      setLastName(role.LastName);
      setUpiId(role.upiId);
      setRole(role.Role);
      setFile(null);
  };

  const handleSubmitChange = (staffMember) => {
    if (window.confirm("Confirm update")) {
      update(
        ref(db, `/hotels/${hotelName}/staff/${staffMember.uuid}`),
        {
          firstName,
         lastName
        }
      );
      toast.success("Role Updated Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      setFirstName(role.FirstName);
      setLastName(role.LastName);
      setUpiId(role.upiId);
      setRole(role.Role);
      setFile(null);
      setIsEdit(false);
    }
  };
  const filterAndSortItems = () => {
    let filteredItems = staff.filter((member) => {
      const memberName = member.firstName || ""; // Use empty string if name is undefined
      return memberName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (selectedRole !== "") {
      filteredItems = filteredItems.filter((member) => {
        const memberRole = member.role || ""; // Use empty string if role is undefined
        return memberRole.toLowerCase() === selectedRole.toLowerCase();
      });
    }

    return filteredItems;
  };

  const filteredAndSortedItems = filterAndSortItems();

  const handleRoleFilter = (role) => {
    setSelectedRole(role);
  };

  // Prepare data for the table
  const data = filteredAndSortedItems.map((item, index) => ({
    "Sr.No": index + 1,
    FirstName: item.firstName,
    LastName: item.lastName,
    upiId: item.upiId,
    Role: item.role,
    Actions: (
      <>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => handleEdit(item)}
        >
          Edit
        </button>
        <button
          className="btn btn-danger btn-sm ml-2"
          onClick={() => handleDelete(item)}
        >
          <img src="/delete.png" width="20px" height="20px" alt="Delete" />
        </button>
      </>
    ),
  }));

  const columns = ViewStaffColumns;
  return (
    <>
      <div className="d-flex justify-between" style={{width:'100%'}}>
        <div
          className="bg-white p-6 rounded-lg shadow-lg"
          style={{ marginRight: "10px", width: "30%" }}
        >
          <form className=" gap-6">
            <div className="relative">
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                id="firstName"
                className={`mt-1 block w-full px-3 py-2 border ${
                  firstName ? "border-green-500" : "border-red-500"
                } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                placeholder="Enter First Name"
              />
              {firstName && (
                <FaCheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500" />
              )}
              {!firstName && (
                <FaExclamationCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500" />
              )}
              {!firstName && (
                <p className="text-red-500 text-xs mt-1">
                  First Name is required.
                </p>
              )}
            </div>

            <div className="relative">
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                id="lastName"
                className={`mt-1 block w-full px-3 py-2 border ${
                  lastName ? "border-green-500" : "border-red-500"
                } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                placeholder="Enter Last Name"
              />
              {lastName && (
                <FaCheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500" />
              )}
              {!lastName && (
                <FaExclamationCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500" />
              )}
              {!lastName && (
                <p className="text-red-500 text-xs mt-1">
                  Last Name is required.
                </p>
              )}
            </div>

            <div className="relative">
              <label
                htmlFor="upiId"
                className="block text-sm font-medium text-gray-700"
              >
                UPI ID
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                id="upiId"
                className={`mt-1 block w-full px-3 py-2 border ${
                  upiId ? "border-green-500" : "border-red-500"
                } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                placeholder="Enter UPI ID"
              />
              {upiId && (
                <FaCheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500" />
              )}
              {!upiId && (
                <FaExclamationCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500" />
              )}
              {!upiId && (
                <p className="text-red-500 text-xs mt-1">UPI ID is required.</p>
              )}
            </div>

            <div className="relative ">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 bg-white"
              >
                Select Role
              </label>
              <select
                id="role"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="" disabled>
                  Select Role
                </option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              {!role && (
                <p className="text-red-500 text-xs mt-1">Role is required.</p>
              )}
            </div>

            <div className="col-span-2">
              <label
                htmlFor="file"
                className="block text-sm font-medium text-gray-700"
              >
                Profile Image
              </label>
              <input
                type="file"
                id="file"
                className="mt-1 block w-full text-sm text-gray-500 border border-gray-300 rounded-md shadow-sm file:border-0 file:bg-gray-200 file:text-gray-700"
                onChange={handleFileChange}
              />
            </div>

            <div className="col-span-2">
            {isEdit ? (
            <>
              <Button primary onClick={handleSubmitChange}>
                Submit Change
              </Button>
              <Button onClick={() => setIsEdit(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button primary onClick={handleSubmit}>
              Submit
            </Button>
          )}
            </div>
          </form>
        </div>
        <div className="background-card" style={{width:'70%'}}>
          <div className="mt-2">
            <div className="row">
              <div className="col-12">
                <div className="d-flex flex-wrap justify-content-start">
                  <div
                    className="d-flex flex-nowrap overflow-auto"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    <div
                      className="p-2 mb-2 bg-light border cursor-pointer d-inline-block roleTab"
                      onClick={() => handleRoleFilter("")}
                      style={{ marginRight: "5px" }}
                    >
                      <div>
                        All{" "}
                        <span
                          className="badge bg-danger badge-number"
                          style={{ borderRadius: "50%", padding: "5px" }}
                        >
                          {Object.values(roleCounts).reduce((a, b) => a + b, 0)}
                        </span>
                      </div>
                    </div>
                    {roles
                      .filter((role) => roleCounts[role.roleName] > 0) // Only include roles with non-zero counts
                      .map((role) => (
                        <div
                          className="role p-2 mb-2 bg-light border cursor-pointer d-inline-block roleTab"
                          key={role.id}
                          onClick={() => handleRoleFilter(role.roleName)}
                        >
                          <div className="role-name">
                            {role.roleName}{" "}
                            <span
                              className="badge bg-danger badge-number"
                              style={{ borderRadius: "50%" }}
                            >
                              {roleCounts[role.roleName]}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <FilterSortSearch
              searchTerm={searchTerm}
              handleSearch={handleSearch}
            />
            {/* <BackgroundCard>
          <PageTitle pageTitle={"View Staff"} /> */}
            <DynamicTable
              columns={columns}
              data={data}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            {/* </BackgroundCard> */}
          </div>
        </div>
      </div>
    </>
  );
}

export default AddStaff;
