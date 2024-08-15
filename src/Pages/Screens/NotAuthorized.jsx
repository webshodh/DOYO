// NotAuthorized.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

const NotAuthorized = () => {
  return (
    <Container className="mt-5 text-center">
      <Row>
        <Col>
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Access Denied</h4>
            <p>You do not have permission to view this page.</p>
            <hr />
            <p className="mb-0">
              Please contact your administrator if you believe this is a mistake.
            </p>
          </div>
          <Link to="/">
            <Button variant="primary">Go to Home</Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default NotAuthorized;
