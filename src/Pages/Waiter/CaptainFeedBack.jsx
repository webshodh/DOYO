import React, { useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { colors } from "../../theme/theme";

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
  const [upiId] = useState("vishal.gholkar1@ybl"); // Replace with the captain's UPI ID
  const payeeName = "Vishal";
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
      // Generate the UPI payment link
      const paymentLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
        payeeName
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
      style={{ backgroundColor: colors.Orange, minHeight: "100vh" }}
    >
      <Row className="text-center">
        <Col>
          <div className="p-5 text-white">
            <h1 className="mt-3">Leave a Tip for Our Captain!</h1>
            <p className="lead">Show your appreciation with a tip!</p>

            <div className="mb-4">
              <p>Rate Your Experience:</p>
              {["😞", "😐", "😊", "😁", "😍"].map((emoji, index) => (
                <span
                  key={index}
                  onClick={() => setRating(index + 1)}
                  style={{
                    cursor: "pointer",
                    fontSize: "2rem",
                    margin: "0 5px",
                    filter:
                      rating === index + 1
                        ? "drop-shadow(0 0 10px white)"
                        : "none",
                  }}
                >
                  {emoji}
                </span>
              ))}
            </div>

            {rating && (
              <Form>
                <Form.Group controlId="feedbackSelect">
                  <Form.Label>
                    Select Feedback (You can select multiple options)
                  </Form.Label>
                  <div className="d-flex flex-column align-items-start">
                    {feedbackOptions[rating].map((option, index) => (
                      <Form.Check
                        key={index}
                        type="checkbox"
                        label={option}
                        value={option}
                        onChange={handleFeedbackChange}
                        className="mb-2"
                      />
                    ))}
                  </div>
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
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default TipEntry;
