import React, { useState, useEffect } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { colors } from "../../theme/theme";
import CartCard from "../../components/Cards/CartCard";
import { ref, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";

const CaptainTip = () => {
  const [tipAmount, setTipAmount] = useState("");
  const [staff, setStaff] = useState([]);
  const [selectedCaptain, setSelectedCaptain] = useState(null);
  const hotelName = "Atithi";
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;

  // Fetch staff data from the database
  useEffect(() => {
    const staffRef = ref(
      db,
      `/admins/${currentAdminId}/hotels/${hotelName}/staff/`
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

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [hotelName, currentAdminId]);

  // Extract fullName and upiId for each staff member
  const staffDetails = staff.map((staff) => {
    const { firstName, lastName, upiId } = staff;
    const fullName = `${firstName} ${lastName}`;
    return { fullName, upiId };
  });

  const handlePay = () => {
    if (tipAmount && selectedCaptain) {
      // Generate the payment link using the selected captain's upiId
      const paymentLink = `upi://pay?pa=${selectedCaptain.upiId}&pn=${encodeURIComponent(
        selectedCaptain.fullName
      )}&am=${tipAmount}&cu=INR&tn=Payment%20for%20order`;

      window.open(paymentLink); // Open the payment app
      
      // Redirect to Google after a slight delay to allow payment link to open
      setTimeout(() => {
        window.location.href = "https://www.google.com";
      }, 2000); // Adjust the delay as needed
    } else {
      alert("Please select a captain and enter a tip amount.");
    }
  };

  const cartItems = [];

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center"
      style={{ backgroundColor: colors.Orange, minHeight: "100vh" }}
    >
      <Row className="text-center">
        <Col>
          <div className="p-5 text-white">
            <h1 className="mt-3">Leave a Tip for Our Captain!</h1>
            <p className="lead">Show your appreciation with a tip!</p>

            {cartItems.map((item) => (
              <Col xs={12} md={6} lg={4} key={item.uuid} className="mb-1">
                <CartCard item={item} />
              </Col>
            ))}
            <Form>
              <Form.Group controlId="selectCaptain">
                <Form.Label>Select Captain</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedCaptain?.fullName || ""}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    const captain = staffDetails.find(
                      (staff) => staff.fullName === selectedName
                    );
                    setSelectedCaptain(captain);
                  }}
                >
                  <option value="" disabled>
                    Select a Captain
                  </option>
                  {staffDetails.map((staff, index) => (
                    <option key={index} value={staff.fullName}>
                      {staff.fullName}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="tipAmountInput">
                <Form.Label>Tip Amount</Form.Label>
                <Form.Control
                  type="number"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  placeholder="Enter Tip Amount"
                />
              </Form.Group>

              <Button variant="light" onClick={handlePay}>
                Pay
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CaptainTip;
