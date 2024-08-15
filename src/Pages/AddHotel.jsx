import React, { useState } from "react";
import { db, storage } from "../data/firebase/firebaseConfig";
import { v4 as uuidv4 } from "uuid";
import { set, ref } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Form } from "react-bootstrap";
import styled from "styled-components";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { getAuth } from "firebase/auth";
// Container for the form
export const FormContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin: 20px;
`;

// Wrapper for each input
export const InputWrapper = styled.div`
  flex: 1 1 calc(50% - 20px); // Adjusted layout for responsiveness
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

// Label styling
export const Label = styled.label`
  margin-bottom: 8px;
  font-weight: bold;
`;

// Input field with conditional styling
export const Input = styled.input`
  padding: 10px;
  border: 1px solid
    ${(props) => (props.error ? "#dc3545" : props.success ? "#28a745" : "#ccc")};
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
  }
`;

// Icon for error or success
export const Icon = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: ${(props) => (props.error ? "#dc3545" : "#28a745")};
`;

// Error message styling
export const ErrorMessage = styled.p`
  color: #dc3545;
  font-size: 0.875rem;
  margin: 5px 0 0;
`;

// Success message styling
export const SuccessMessage = styled.p`
  color: #28a745;
  font-size: 0.875rem;
  margin: 5px 0 0;
`;

// File upload section
export const FileUpload = styled.div`
  flex: 1 1 100%;
`;

// Button styling
export const Button = styled.button`
  padding: 10px 20px;
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

// Define additional constants for states and districts
const statesInIndia = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli",
  "Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const districtsInIndia = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli",
  "Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

function AddHotel() {
  const [hotelName, setHotelName] = useState("");
  const [stateName, setStateName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [hotelAddress, setHotelAddress] = useState("");
  const [categories, setCategories] = useState([]); // Add your category options
  const [pinCode, setPinCode] = useState("Available");
  const [selectedImage, setSelectedImage] = useState(null); // For file upload
  const [imageUrl, setImageUrl] = useState(""); // URL for uploaded image

  const handleHotelNameChange = (e) => setHotelName(e.target.value);
  const handleStateChange = (e) => setStateName(e.target.value);
  const handleDistrictChange = (e) => setDistrictName(e.target.value);
  const handleHotelAddressChange = (e) => setHotelAddress(e.target.value);
  const handlePinCodeChange = (e) => setPinCode(e.target.value);

  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const handleFileChange = (e) => {
    if (e.target.files.length) {
      setSelectedImage(e.target.files[0]);
    }
  };
 


  // const writeToDatabase = async (adminID) => {
  //   const uuid = uuidv4();
  //     // Check if adminID is provided
  // if (!adminID) {
  //   console.error("Admin ID is undefined");
  //   return;
  // }
  //   await set(ref(db, `hotels/${uuid}`), {
  //     Hotelname: hotelName,
  //     state: stateName,
  //     district: districtName,
  //     address: hotelAddress,
  //     pinCode,
  //     imageUrl,
  //     adminID, // Store adminID in the hotel data
  //   });

  //   // Add hotel reference under the particular admin's collection
  //   await set(ref(db, `admins/${adminID}/hotels/${uuid}`), true);

  //   setHotelName("");
  //   setStateName("");
  //   setDistrictName("");
  //   setHotelAddress("");
  //   setPinCode("Available");
  //   setSelectedImage(null);
  //   setImageUrl("");

  //   toast.success("Hotel Added Successfully!", {
  //     position: toast.POSITION.TOP_RIGHT,
  //   });
  // };

  const writeToDatabase = async () => {
    const uuid = uuidv4();
    const adminID = currentAdminId; // Replace this with the actual admin ID
  
    if (!adminID) {
      console.error("Admin ID is undefined");
      toast.error("Error: Admin ID is undefined", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }
  
    const hotelData = {
      hotelName,
      state: stateName,
      district: districtName,
      address: hotelAddress,
      pinCode,
      imageUrl,
      uuid,
    };
  
    try {
      // Reference to the admin's hotels collection
      const adminHotelRef = ref(db, `admins/${adminID}/hotels/${hotelName}/`);
  
      // Reference to the general hotels collection
      const generalHotelRef = ref(db, `hotels/${hotelName}/`);
  
      // Store hotel data under the admin's collection
      await set(adminHotelRef, hotelData);
  
      // Store hotel name and UUID in the general hotels collection
      await set(generalHotelRef, { hotelName, uuid });
  
      // Clear form fields after successful submission
      setHotelName("");
      setStateName("");
      setDistrictName("");
      setHotelAddress("");
      setPinCode("");
      setSelectedImage(null);
      setImageUrl("");
  
      toast.success("Hotel Added Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    } catch (error) {
      console.error("Error adding hotel:", error);
      toast.error("Error adding hotel. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    await writeToDatabase();
  };

  return (
    <>
      <div className="background-card">
        <FormContainer>
          <InputWrapper>
            <Label htmlFor="hotelName">Hotel Name</Label>
            <div style={{ position: "relative" }}>
              <Input
                type="text"
                value={hotelName}
                onChange={handleHotelNameChange}
                id="hotelName"
                error={!hotelName}
                success={hotelName}
                placeholder="Enter Hotel Name"
              />
              {hotelName && (
                <Icon success>
                  <FaCheckCircle />
                </Icon>
              )}
              {!hotelName && (
                <Icon error>
                  <FaExclamationCircle />
                </Icon>
              )}
            </div>
            {!hotelName && <ErrorMessage>Hotel Name is required.</ErrorMessage>}
          </InputWrapper>

          <InputWrapper>
            <Label htmlFor="stateName">State</Label>
            <select
              id="stateName"
              className="form-select"
              onChange={handleStateChange}
              value={stateName}
            >
              <option value="" disabled>
                Select State
              </option>
              {statesInIndia.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </InputWrapper>

          <InputWrapper>
            <Label htmlFor="districtName">District</Label>
            <select
              id="districtName"
              className="form-select"
              onChange={handleDistrictChange}
              value={districtName}
            >
              <option value="" disabled>
                Select District
              </option>
              {districtsInIndia.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </InputWrapper>

          <InputWrapper>
            <Label htmlFor="hotelAddress">Address</Label>
            <textarea
              id="hotelAddress"
              className="form-control"
              rows="3"
              value={hotelAddress}
              onChange={handleHotelAddressChange}
              placeholder="Enter Hotel Address"
            ></textarea>
          </InputWrapper>

          <InputWrapper>
            <Label>Status</Label>
            <div>
              <input
                type="radio"
                id="availableRadio"
                name="status"
                value="Available"
                checked={pinCode === "Available"}
                onChange={() => setPinCode("Available")}
                className="form-check-input"
              />
              <label
                htmlFor="availableRadio"
                className="form-check-label"
                style={{ width: "100px" }}
              >
                Available
              </label>
              <input
                type="radio"
                id="notAvailableRadio"
                name="status"
                value="Not Available"
                checked={pinCode === "Not Available"}
                onChange={() => setPinCode("Not Available")}
                className="form-check-input"
              />
              <label htmlFor="notAvailableRadio" className="form-check-label">
                Not Available
              </label>
            </div>
          </InputWrapper>

          <FileUpload>
            <Label htmlFor="formFile">Upload Image</Label>
            <input
              type="file"
              id="formFile"
              onChange={handleFileChange}
              className="form-control"
            />
          </FileUpload>

          <Button primary onClick={handleSubmit}>
            Submit
          </Button>
        </FormContainer>
      </div>
      <ToastContainer />
    </>
  );
}

export default AddHotel;
