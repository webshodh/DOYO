import React from "react";
import { Form, Row, Col, Button, Card } from "react-bootstrap";
import { FaSearch, FaCheckCircle, FaUserPlus } from "react-icons/fa";
import styled from "styled-components";
import {
  validateEmail,
  validateContact,
  validatePassword,
} from "../../Validation/hotelValidation";

const AdminCard = styled(Card)`
  margin-bottom: 15px;
  border: 2px solid ${(props) => (props.isValid ? "#28a745" : "#dc3545")};
`;

const HotelFormModal = ({
  hotelName,
  admin,
  onHotelNameChange,
  onUpdateAdmin,
  onSearchAdmin,
  onCreateNewAdmin,
  onSubmit,
  onReset,
  submitting,
  searching,
  getAdminValidationStatus,
  adminExists,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Add Hotel with Admin Management</h2>

      <Form onSubmit={handleSubmit}>
        {/* Basic Hotel Information */}
        <Card className="mb-4">
          <Card.Header>
            <h4>Basic Hotel Information</h4>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group controlId="hotelName" className="mb-3">
                  <Form.Label>Hotel Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={hotelName}
                    onChange={(e) => onHotelNameChange(e.target.value)}
                    placeholder="Enter Hotel Name"
                    isInvalid={!hotelName.trim()}
                    isValid={hotelName.trim()}
                    disabled={submitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    Hotel name is required
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Admin Search and Management */}
        <Card className="mb-4">
          <Card.Header>
            <h4>Admin Management</h4>
          </Card.Header>
          <Card.Body>
            {/* Admin Email Search */}
            <Row className="mb-4">
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Search Admin by Email *</Form.Label>
                  <div className="d-flex">
                    <Form.Control
                      type="email"
                      value={admin.email}
                      onChange={(e) =>
                        onUpdateAdmin("email", e.target.value)
                      }
                      placeholder="Enter admin email to search"
                      disabled={submitting}
                      isInvalid={
                        admin.email.trim() && !validateEmail(admin.email)
                      }
                      isValid={
                        admin.email.trim() && validateEmail(admin.email)
                      }
                    />
                    <Button
                      variant="outline-primary"
                      className="ms-2"
                      onClick={onSearchAdmin}
                      disabled={
                        !admin.email.trim() ||
                        !validateEmail(admin.email) ||
                        searching ||
                        submitting
                      }
                    >
                      {searching ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <FaSearch className="me-1" />
                          Search
                        </>
                      )}
                    </Button>
                  </div>
                  <Form.Control.Feedback type="invalid">
                    Valid email is required
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {/* Admin Details */}
            {admin.email.trim() && validateEmail(admin.email) && (
              <AdminCard isValid={getAdminValidationStatus()}>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h6>
                    Admin Details
                    {admin.isExisting && (
                      <span className="badge bg-success ms-2">
                        <FaCheckCircle className="me-1" />
                        Existing Admin Found
                      </span>
                    )}
                    {!admin.isExisting && admin.searched && (
                      <span className="badge bg-warning ms-2">
                        <FaUserPlus className="me-1" />
                        New Admin (Will be created)
                      </span>
                    )}
                  </h6>
                  {!admin.isExisting && admin.searched && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={onCreateNewAdmin}
                      disabled={submitting}
                    >
                      <FaUserPlus className="me-1" />
                      Create New Admin
                    </Button>
                  )}
                </Card.Header>
                <Card.Body>
                  {admin.isExisting && (
                    <div className="alert alert-info mb-3">
                      <FaCheckCircle className="me-2" />
                      This admin already exists and will be assigned to this hotel.
                      {admin.existingHotels && admin.existingHotels.length > 0 && (
                        <div className="mt-2">
                          <small>
                            <strong>Currently managing hotels:</strong>{" "}
                            {admin.existingHotels.join(", ")}
                          </small>
                        </div>
                      )}
                    </div>
                  )}

                  {!admin.isExisting && admin.searched && (
                    <div className="alert alert-warning mb-3">
                      <FaUserPlus className="me-2" />
                      Admin with this email doesn't exist. Please fill in the details below to create a new admin.
                    </div>
                  )}

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Admin Name *</Form.Label>
                        <Form.Control
                          type="text"
                          value={admin.name}
                          onChange={(e) =>
                            onUpdateAdmin("name", e.target.value)
                          }
                          placeholder="Enter admin name"
                          disabled={admin.isExisting || submitting}
                          isInvalid={!admin.name.trim()}
                          isValid={admin.name.trim()}
                        />
                        <Form.Control.Feedback type="invalid">
                          Admin name is required
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Contact Number *</Form.Label>
                        <Form.Control
                          type="tel"
                          value={admin.contact}
                          onChange={(e) =>
                            onUpdateAdmin("contact", e.target.value)
                          }
                          placeholder="Enter 10-digit contact"
                          maxLength="10"
                          disabled={admin.isExisting || submitting}
                          isInvalid={
                            !admin.contact.trim() ||
                            !validateContact(admin.contact)
                          }
                          isValid={
                            admin.contact.trim() &&
                            validateContact(admin.contact)
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          Valid 10-digit contact number is required
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Password{" "}
                          {admin.isExisting
                            ? "(Not Required - Existing Admin)"
                            : "*"}
                        </Form.Label>
                        <Form.Control
                          type="password"
                          value={admin.password}
                          onChange={(e) =>
                            onUpdateAdmin("password", e.target.value)
                          }
                          placeholder="Enter password (min 6 characters)"
                          disabled={admin.isExisting || submitting}
                          isInvalid={
                            !admin.isExisting &&
                            (!admin.password.trim() ||
                              !validatePassword(admin.password))
                          }
                          isValid={
                            admin.isExisting ||
                            (admin.password.trim() &&
                              validatePassword(admin.password))
                          }
                        />
                        {!admin.isExisting && (
                          <Form.Text className="text-muted">
                            Password must be at least 6 characters long
                          </Form.Text>
                        )}
                        <Form.Control.Feedback type="invalid">
                          Password must be at least 6 characters
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </AdminCard>
            )}
          </Card.Body>
        </Card>

        {/* Form Actions */}
        <div className="d-flex gap-3 mb-4">
          <Button
            variant="success"
            type="submit"
            size="lg"
            disabled={submitting || !getAdminValidationStatus() || !hotelName.trim()}
          >
            {submitting ? "Creating..." : "Create Hotel with Admin"}
          </Button>
          <Button
            variant="outline-secondary"
            type="button"
            onClick={onReset}
            size="lg"
            disabled={submitting}
          >
            Reset Form
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default HotelFormModal;