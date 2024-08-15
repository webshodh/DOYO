import React, { useState } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { colors } from '../theme/theme';

const RestaurantRating = () => {
  const [rating, setRating] = useState(null);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    // Handle the rating submission, then navigate to the next screen
    // e.g., using react-router
  };

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center"
      style={{ backgroundColor: colors.Orange, minHeight: '100vh' }}
    >
      <Row className="text-center">
        <Col>
          <div className="p-5 text-white">
            <h1 className="mt-3">Rate Your Experience!</h1>
            <p className="lead">We value your feedback to improve our services.</p>
            <div className="mb-4">
              {['😞', '😐', '😊', '😁', '😍'].map((emoji, index) => (
                <span key={index} onClick={() => setRating(index + 1)} style={{ cursor: 'pointer', fontSize: '2rem' }}>
                  {emoji}
                </span>
              ))}
            </div>
            <Form>
              <Form.Group controlId="feedbackTextarea">
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Your feedback (optional)"
                  className="mb-3"
                />
              </Form.Group>
              <Button variant="light" onClick={handleSubmit}>
                Submit Feedback
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default RestaurantRating;
