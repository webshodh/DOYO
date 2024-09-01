import React, { useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { colors } from "../../theme/theme";
import { useLocation } from "react-router-dom";
import { Navbar } from "../../components";
import Footer from "Atoms/Footer";

const feedbackOptions = {
  1: [
    "Very Rude!",
    "Terrible Service!",
    "Ignored Us!",
    "Food Wasn't Served!",
    "Extremely Slow!",
  ],
  2: [
    "Not Friendly!",
    "Service Was Slow!",
    "Made Mistakes!",
    "Unhelpful!",
    "Lacked Attention!",
  ],
  3: [
    "Average Service.",
    "Decent but Room for Improvement.",
    "Friendly but Slow.",
    "Some Mistakes Made.",
    "Could Be Better.",
  ],
  4: [
    "Very Good Service!",
    "Attentive and Friendly!",
    "Prompt Responses!",
    "Made Good Recommendations!",
    "Pleasant Experience!",
  ],
  5: [
    "Excellent Service!",
    "Went Above and Beyond!",
    "Highly Recommend!",
    "Perfectly Attentive!",
    "Will Come Again!",
  ],
};

const TipEntry = () => {
  const [rating, setRating] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState([]);
  const [tipAmount, setTipAmount] = useState("");
  const location = useLocation();
  const { selectedCaptain } = location.state;

  const handleFeedbackChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedFeedback((prev) => [...prev, value]);
    } else {
      setSelectedFeedback((prev) =>
        prev.filter((feedback) => feedback !== value)
      );
    }
  };

  const handlePay = () => {
    if (tipAmount && rating) {
      const paymentLink = `upi://pay?pa=${
        selectedCaptain.upiId
      }&pn=${encodeURIComponent(
        selectedCaptain.fullName
      )}&am=${tipAmount}&cu=INR&tn=Payment%20for%20order`;
      window.open(paymentLink); // Open the payment app
    } else {
      alert("Please select a rating and enter a tip amount.");
    }
  };

  const hotelName = "Atithi";

  return (
    <>
      <Navbar
        title={`${hotelName}`}
        style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}
      />
      <Container
        fluid
        className="d-flex align-items-center justify-content-center"
        style={{
          backgroundColor: colors.Orange,
          minHeight: "100vh"
        }}
      >
        <Row className="w-100">
          <Col xs={12} md={8} lg={6} className="mx-auto">
            <div
              style={{ maxHeight: "80vh" }} // Add vertical scrolling
            >
              <h1 className="text-center mb-4 text-dark">
                Rate and Tip {selectedCaptain.fullName}
              </h1>
              <div className="mb-4 text-center">
                <p className="lead">Rate Your Experience:</p>
                {["😞", "😐", "😊", "😁", "😍"].map((emoji, index) => (
                  <span
                    key={index}
                    onClick={() => setRating(index + 1)}
                    style={{
                      cursor: "pointer",
                      fontSize: "2rem",
                      margin: "0 10px",
                      filter:
                        rating === index + 1
                          ? "drop-shadow(0 0 10px #000)"
                          : "none",
                      transition: "filter 0.3s ease",
                    }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>

              {rating && (
                <Form>
                  <Form.Group controlId="feedbackSelect" className="mb-4">
                    <Form.Label>
                      Select Feedback (You can select multiple options)
                    </Form.Label>
                    <div className="d-flex flex-column">
                      {feedbackOptions[rating].map((option, idx) => (
                        <Form.Check
                          key={idx}
                          type="checkbox"
                          label={option}
                          value={option}
                          onChange={handleFeedbackChange}
                          className="mb-2"
                        />
                      ))}
                    </div>
                  </Form.Group>

                  <Form.Group controlId="tipAmount" className="mb-4">
                    <Form.Label>Tip Amount (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter tip amount"
                      value={tipAmount}
                      onChange={(e) => setTipAmount(e.target.value)}
                      style={{ borderRadius: "4px" }}
                    />
                  </Form.Group>

                  <button
                    className="w-100 py-3 rounded-full bg-orange-500 text-white text-lg font-semibold hover:bg-orange-600 transition-colors duration-200"
                    onClick={handlePay}
                  >
                    Pay
                  </button>
                </Form>
              )}
            </div>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
};

export default TipEntry;
