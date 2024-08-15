import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

const OrderSearchForm = ({ onSearch }) => {
  const [name, setName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ name, mobileNo, date });
  };

  return (
    <Container className="mt-4">
      <Form onSubmit={handleSubmit}>
        <Row className="align-items-center">
          <Col xs={12} md={4} className="mb-3">
            <Form.Group controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={4} className="mb-3">
            <Form.Group controlId="formMobileNo">
              <Form.Label>Mobile No</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter mobile number"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={4} className="mb-3">
            <Form.Group controlId="formDate">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col xs={12} className="text-center">
            <Button variant="primary" type="submit">
              Search
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default OrderSearchForm;
