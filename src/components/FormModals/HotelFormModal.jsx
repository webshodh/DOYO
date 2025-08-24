import React from "react";
import { Form, Row, Col, Button, Card } from "react-bootstrap";
import { FaPlus, FaTrash, FaCheckCircle } from "react-icons/fa";
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
  admins,
  onHotelNameChange,
  onAddAdmin,
  onRemoveAdmin,
  onUpdateAdmin,
  onCheckExistingAdmin,
  onSubmit,
  onReset,
  canAddMoreAdmins,
  canRemoveAdmin,
  submitting,
  getAdminValidationStatus,
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

        {/* Admin Management */}
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h4>Admin Management</h4>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={onAddAdmin}
              disabled={!canAddMoreAdmins || submitting}
            >
              <FaPlus /> Add Admin
            </Button>
          </Card.Header>
          <Card.Body>
            {admins.map((admin, index) => (
              <AdminCard
                key={admin.id}
                isValid={getAdminValidationStatus(admin)}
              >
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h6>
                    Admin {index + 1}
                    {admin.isExisting && (
                      <span className="badge bg-info ms-2">Existing</span>
                    )}
                  </h6>
                  {canRemoveAdmin && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onRemoveAdmin(admin.id)}
                      disabled={submitting}
                    >
                      <FaTrash />
                    </Button>
                  )}
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Admin Name *</Form.Label>
                        <Form.Control
                          type="text"
                          value={admin.name}
                          onChange={(e) =>
                            onUpdateAdmin(admin.id, "name", e.target.value)
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
                        <Form.Label>Admin Email *</Form.Label>
                        <Form.Control
                          type="email"
                          value={admin.email}
                          onChange={(e) =>
                            onUpdateAdmin(admin.id, "email", e.target.value)
                          }
                          onBlur={() =>
                            onCheckExistingAdmin(admin.email, admin.id)
                          }
                          placeholder="Enter admin email"
                          disabled={submitting}
                          isInvalid={
                            !admin.email.trim() || !validateEmail(admin.email)
                          }
                          isValid={
                            admin.email.trim() && validateEmail(admin.email)
                          }
                        />
                        {admin.isExisting && (
                          <Form.Text className="text-info">
                            <FaCheckCircle className="me-1" />
                            Existing admin found - will be linked to this hotel
                          </Form.Text>
                        )}
                        <Form.Control.Feedback type="invalid">
                          Valid email is required
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Contact Number *</Form.Label>
                        <Form.Control
                          type="tel"
                          value={admin.contact}
                          onChange={(e) =>
                            onUpdateAdmin(admin.id, "contact", e.target.value)
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
                            onUpdateAdmin(admin.id, "password", e.target.value)
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
            ))}
          </Card.Body>
        </Card>

        {/* Form Actions */}
        <div className="d-flex gap-3 mb-4">
          <Button
            variant="success"
            type="submit"
            size="lg"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Hotel with Admin(s)"}
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
