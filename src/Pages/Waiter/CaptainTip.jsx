import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { colors } from "../../theme/theme";
import { ref, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import { CaptainCard, Navbar } from "../../components";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { db } from "../../data/firebase/firebaseConfig";

const ScrollableDiv = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
  margin-top: 10px;
  border: 1px solid ${colors.Gray}; // Add a border for better visual separation
  border-radius: 8px; // Rounded corners
  background-color: ${colors.LightGray}; // Light background color
`;

const CaptainTip = () => {
  const [staff, setStaff] = useState([]);
  const [selectedCaptain, setSelectedCaptain] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const hotelName = "Atithi";
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const navigate = useNavigate();

  useEffect(() => {
    const staffRef = ref(
      db,
      `/hotels/${hotelName}/staff/`
    );
    const unsubscribe = onValue(staffRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const staffArray = Object.values(data);
        setStaff(staffArray);
      } else {
        setStaff([]); // Clear staff if none exist
      }
    });

    return () => unsubscribe();
  }, [hotelName, currentAdminId]);

  const staffDetails = staff.map((staff) => {
    const { firstName, lastName, upiId, imageUrl } = staff;
    const fullName = `${firstName} ${lastName}`;
    return { fullName, upiId, imageUrl };
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleNext = () => {
    if (selectedCaptain) {
      // Pass selectedCaptain object to the next page
      navigate("/Atithi/orders/captain-feedback", {
        state: { selectedCaptain },
      });
    } else {
      alert("Please select a captain before proceeding.");
    }
  };

  const filteredStaff = staffDetails.filter((staff) =>
    staff.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar title={"Atithi"} />
      <Container
        fluid
        className="d-flex flex-column align-items-center justify-content-center"
        style={{
          backgroundColor: colors.White,
          minHeight: "100vh",
          padding: "2rem",
        }}
      >
        <Row className="text-center w-100">
          <Col xs={12} md={10} lg={8}>
            <div className="p-1 text-dark bg-light rounded shadow-sm">
              <h1 className="mb-4">Leave a Tip for Our Captain!</h1>
              <p className="lead mb-4">Show your appreciation with a tip!</p>

              <Form>
                <Form.Group controlId="searchCaptain" className="mb-4">
                  <Form.Label>Search Captain</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search by name"
                    value={searchTerm}
                    onChange={handleSearch}
                    style={{ borderRadius: "4px" }} // Rounded corners for input
                  />
                </Form.Group>

                <ScrollableDiv>
                  <h5 className="mb-3">Select a Captain</h5>
                  {filteredStaff.map((staff, index) => (
                    <CaptainCard
                      key={index}
                      fullName={staff.fullName}
                      imageUrl={staff.imageUrl}
                      upiId={staff.upiId}
                      selectedCaptain={selectedCaptain}
                      setSelectedCaptain={setSelectedCaptain}
                      isSelected={
                        selectedCaptain.fullName === staff.fullName &&
                        selectedCaptain.upiId === staff.upiId
                      }
                    />
                  ))}
                  {selectedCaptain.fullName && (
                    <div className="mt-3">
                      <h6>Selected Captain: {selectedCaptain.fullName}</h6>
                    </div>
                  )}
                </ScrollableDiv>

                <Button
                  className="mt-4 w-100"
                  onClick={handleNext}
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "20px",
                    background: `${colors.Orange}`,
                    borderColor: `${colors.Orange}`,
                  }}
                >
                  Next
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default CaptainTip;
