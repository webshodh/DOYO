import React, { useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { colors } from "../../theme/theme";
import { useLocation } from "react-router-dom";

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

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: colors.Orange,
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <Row className="text-center w-100">
        <Col xs={12} md={8} lg={6}>
          <div className="p-4 text-white bg-dark rounded shadow-sm">
            <h1 className="mb-4">Rate and Tip to {selectedCaptain}</h1>
            <div className="mb-4">
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
                        ? "drop-shadow(0 0 10px white)"
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
                  <div className="d-flex flex-column align-items-start">
                    {feedbackOptions[rating].map((option, idx) => (
                      <Form.Check
                        key={idx}
                        type="checkbox"
                        label={option}
                        value={option}
                        onChange={handleFeedbackChange}
                        className="mb-2"
                        style={{ marginRight: "1rem" }} // Adjust spacing between checkboxes
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

                <Button
                  variant="light"
                  className="w-100"
                  style={{
                    color: colors.Orange,
                    fontWeight: "bold",
                    padding: "0.75rem",
                  }}
                  onClick={handlePay}
                >
                  Pay
                </Button>
              </Form>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default TipEntry;
