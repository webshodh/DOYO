import React, { useState } from "react";
import { db, storage } from "../../data/firebase/firebaseConfig";
import { v4 as uuidv4 } from "uuid";
import { set, ref } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Form, Row, Col, Button} from "react-bootstrap";
import styled from "styled-components";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { getAuth } from "firebase/auth";

// Custom styled components for icons
const Icon = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: ${(props) => (props.error ? "#dc3545" : "#28a745")};
`;

function AddHotel() {
  const [hotelName, setHotelName] = useState("");
  const [stateName, setStateName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [hotelAddress, setHotelAddress] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerContact, setOwnerContact] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");

  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const uuid = uuidv4();
    const adminID = currentAdminId;

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
      ownerName,
      ownerContact,
      ownerEmail,
    };

    try {
      const adminHotelRef = ref(db, `admins/${adminID}/hotels/${hotelName}/`);
      const generalHotelRef = ref(db, `hotels/${hotelName}/`);

      await set(adminHotelRef, hotelData);
      await set(generalHotelRef, { hotelName, uuid });

      setHotelName("");
      setStateName("");
      setDistrictName("");
      setHotelAddress("");
      setPinCode("");
      setSelectedImage(null);
      setImageUrl("");
      setOwnerName("");
      setOwnerContact("");
      setOwnerEmail("");

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

  return (
    <>
      <div className="container mt-4">
        <h2>Add Hotel</h2>
        <Form onSubmit={handleSubmit}>
          <h4 className="mt-4">Hotel Info</h4>
          <Row>
            <Col md={6}>
              <Form.Group controlId="hotelName">
                <Form.Label>Hotel Name</Form.Label>
                <Form.Control
                  type="text"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  placeholder="Enter Hotel Name"
                  isInvalid={!hotelName}
                  isValid={hotelName}
                />
                {!hotelName && (
                  <Form.Control.Feedback type="invalid">
                    Hotel Name is required.
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="stateName">
                <Form.Label>State</Form.Label>
                <Form.Control
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="Enter State"
                  isInvalid={!stateName}
                  isValid={stateName}
                />
                {!stateName && (
                  <Form.Control.Feedback type="invalid">
                    State is required.
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group controlId="districtName">
                <Form.Label>District</Form.Label>
                <Form.Control
                  type="text"
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  placeholder="Enter District"
                  isInvalid={!districtName}
                  isValid={districtName}
                />
                {!districtName && (
                  <Form.Control.Feedback type="invalid">
                    District is required.
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="hotelAddress">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={hotelAddress}
                  onChange={(e) => setHotelAddress(e.target.value)}
                  placeholder="Enter Hotel Address"
                  isInvalid={!hotelAddress}
                  isValid={hotelAddress}
                />
                {!hotelAddress && (
                  <Form.Control.Feedback type="invalid">
                    Address is required.
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group controlId="pinCode">
                <Form.Label>Pin Code</Form.Label>
                <Form.Control
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="Enter Pin Code"
                  isInvalid={!pinCode}
                  isValid={pinCode}
                />
                {!pinCode && (
                  <Form.Control.Feedback type="invalid">
                    Pin Code is required.
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="formFile">
                <Form.Label>Upload Image</Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) => setSelectedImage(e.target.files[0])}
                />
              </Form.Group>
            </Col>
          </Row>

          <h4 className="mt-4">Owner Info</h4>
          <Row>
            <Col md={6}>
              <Form.Group controlId="ownerName">
                <Form.Label>Owner Name</Form.Label>
                <Form.Control
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Enter Owner Name"
                  isInvalid={!ownerName}
                  isValid={ownerName}
                />
                {!ownerName && (
                  <Form.Control.Feedback type="invalid">
                    Owner Name is required.
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="ownerContact">
                <Form.Label>Owner Contact</Form.Label>
                <Form.Control
                  type="text"
                  value={ownerContact}
                  onChange={(e) => setOwnerContact(e.target.value)}
                  placeholder="Enter Owner Contact"
                  isInvalid={!ownerContact}
                  isValid={ownerContact}
                />
                {!ownerContact && (
                  <Form.Control.Feedback type="invalid">
                    Contact number is required.
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group controlId="ownerEmail">
                <Form.Label>Owner Email</Form.Label>
                <Form.Control
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="Enter Owner Email"
                  isInvalid={!ownerEmail}
                  isValid={ownerEmail}
                />
                {!ownerEmail && (
                  <Form.Control.Feedback type="invalid">
                    Valid email is required.
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Button className="btn btn-success mt-3" type="submit">
            Submit
          </Button>
        </Form>
      </div>
      <ToastContainer />
    </>
  );
}

export default AddHotel;
