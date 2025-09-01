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
  hotelData = {}, // Default empty object
  admin,
  onHotelNameChange,
  onHotelDataChange = () => {}, // Default empty function
  onUpdateAdmin,
  onSearchAdmin,
  onCreateNewAdmin,
  onSubmit,
  onReset,
  submitting,
  searching,
  getAdminValidationStatus,
  getHotelValidationStatus = () => true, // Default validation function
  adminExists,
}) => {
  const handleHotelDataChange = (field, value) => {
    if (onHotelDataChange && typeof onHotelDataChange === "function") {
      onHotelDataChange(field, value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const categoryOptions = [
    { value: "", label: "Select Category" },
    { value: "restaurant", label: "Restaurant" },
    { value: "cafe", label: "Cafe" },
    { value: "bar", label: "Bar & Pub" },
    { value: "fast_food", label: "Fast Food" },
    { value: "fine_dining", label: "Fine Dining" },
  ];

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Add Restaurant with Admin Management</h2>

      <Form onSubmit={handleSubmit}>
        {/* Basic Restaurant Information */}
        <Card className="mb-4">
          <Card.Header>
            <h4>Basic Restaurant Information</h4>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group controlId="hotelName" className="mb-3">
                  <Form.Label>Restaurant Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={hotelName}
                    onChange={(e) => onHotelNameChange(e.target.value)}
                    placeholder="Enter Restaurant Name"
                    isInvalid={!hotelName.trim()}
                    isValid={hotelName.trim()}
                    disabled={submitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    Restaurant name is required
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="hotelCategory" className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    value={hotelData?.category || ""}
                    onChange={(e) =>
                      handleHotelDataChange("category", e.target.value)
                    }
                    isInvalid={!hotelData?.category}
                    isValid={hotelData?.category}
                    disabled={submitting}
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Please select a category
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group controlId="hotelContact" className="mb-3">
                  <Form.Label>Contact Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    value={hotelData?.contact || ""}
                    onChange={(e) =>
                      handleHotelDataChange("contact", e.target.value)
                    }
                    placeholder="Enter 10-digit contact"
                    maxLength="10"
                    isInvalid={
                      hotelData?.contact && !validateContact(hotelData.contact)
                    }
                    isValid={
                      hotelData?.contact && validateContact(hotelData.contact)
                    }
                    disabled={submitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    Valid 10-digit contact number is required
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group controlId="hotelDescription" className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={hotelData?.description || ""}
                    onChange={(e) =>
                      handleHotelDataChange("description", e.target.value)
                    }
                    placeholder="Enter restaurant description and specialties"
                    disabled={submitting}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Location Information */}
        <Card className="mb-4">
          <Card.Header>
            <h4>Location Information</h4>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={12}>
                <Form.Group controlId="address" className="mb-3">
                  <Form.Label>Address *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={hotelData?.address || ""}
                    onChange={(e) =>
                      handleHotelDataChange("address", e.target.value)
                    }
                    placeholder="Enter complete address"
                    isInvalid={!hotelData?.address?.trim()}
                    isValid={hotelData?.address?.trim()}
                    disabled={submitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    Address is required
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group controlId="city" className="mb-3">
                  <Form.Label>City *</Form.Label>
                  <Form.Control
                    type="text"
                    value={hotelData?.city || ""}
                    onChange={(e) =>
                      handleHotelDataChange("city", e.target.value)
                    }
                    placeholder="Enter city"
                    isInvalid={!hotelData?.city?.trim()}
                    isValid={hotelData?.city?.trim()}
                    disabled={submitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    City is required
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="district" className="mb-3">
                  <Form.Label>District *</Form.Label>
                  <Form.Control
                    type="text"
                    value={hotelData?.district || ""}
                    onChange={(e) =>
                      handleHotelDataChange("district", e.target.value)
                    }
                    placeholder="Enter district"
                    isInvalid={!hotelData?.district?.trim()}
                    isValid={hotelData?.district?.trim()}
                    disabled={submitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    District is required
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group controlId="state" className="mb-3">
                  <Form.Label>State *</Form.Label>
                  <Form.Control
                    type="text"
                    value={hotelData?.state || ""}
                    onChange={(e) =>
                      handleHotelDataChange("state", e.target.value)
                    }
                    placeholder="Enter state"
                    isInvalid={!hotelData?.state?.trim()}
                    isValid={hotelData?.state?.trim()}
                    disabled={submitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    State is required
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="pincode" className="mb-3">
                  <Form.Label>Pincode *</Form.Label>
                  <Form.Control
                    type="text"
                    value={hotelData?.pincode || ""}
                    onChange={(e) =>
                      handleHotelDataChange("pincode", e.target.value)
                    }
                    placeholder="Enter 6-digit pincode"
                    maxLength="6"
                    pattern="[0-9]{6}"
                    isInvalid={
                      hotelData?.pincode &&
                      (hotelData.pincode.length !== 6 ||
                        !/^\d{6}$/.test(hotelData.pincode))
                    }
                    isValid={
                      hotelData?.pincode &&
                      hotelData.pincode.length === 6 &&
                      /^\d{6}$/.test(hotelData.pincode)
                    }
                    disabled={submitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    Valid 6-digit pincode is required
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Business Details */}
        <Card className="mb-4">
          <Card.Header>
            <h4>Business Details</h4>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group controlId="website" className="mb-3">
                  <Form.Label>Website URL</Form.Label>
                  <Form.Control
                    type="url"
                    value={hotelData?.website || ""}
                    onChange={(e) =>
                      handleHotelDataChange("website", e.target.value)
                    }
                    placeholder="https://example.com"
                    disabled={submitting}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="email" className="mb-3">
                  <Form.Label>Restaurant Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={hotelData?.email || ""}
                    onChange={(e) =>
                      handleHotelDataChange("email", e.target.value)
                    }
                    placeholder="restaurant@example.com"
                    isInvalid={
                      hotelData?.email &&
                      hotelData.email.trim() &&
                      !validateEmail(hotelData.email)
                    }
                    isValid={
                      hotelData?.email &&
                      hotelData.email.trim() &&
                      validateEmail(hotelData.email)
                    }
                    disabled={submitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    Valid email format required
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group controlId="avgCostForTwo" className="mb-3">
                  <Form.Label>Average Cost for Two</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={hotelData?.avgCostForTwo || ""}
                    onChange={(e) =>
                      handleHotelDataChange("avgCostForTwo", e.target.value)
                    }
                    placeholder="Enter average cost (₹)"
                    disabled={submitting}
                  />
                  <Form.Text className="text-muted">
                    Approximate cost for two people
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group controlId="gstNumber" className="mb-3">
                  <Form.Label>GST Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={hotelData?.gstNumber || ""}
                    onChange={(e) =>
                      handleHotelDataChange("gstNumber", e.target.value)
                    }
                    placeholder="Enter GST number"
                    maxLength="15"
                    disabled={submitting}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="fssaiNumber" className="mb-3">
                  <Form.Label>FSSAI License Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={hotelData?.fssaiNumber || ""}
                    onChange={(e) =>
                      handleHotelDataChange("fssaiNumber", e.target.value)
                    }
                    placeholder="Enter FSSAI license number"
                    maxLength="14"
                    disabled={submitting}
                  />
                  <Form.Text className="text-muted">
                    Food Safety and Standards Authority license
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row></Row>
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
                      onChange={(e) => onUpdateAdmin("email", e.target.value)}
                      placeholder="Enter admin email to search"
                      disabled={submitting}
                      isInvalid={
                        admin.email.trim() && !validateEmail(admin.email)
                      }
                      isValid={admin.email.trim() && validateEmail(admin.email)}
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
                      This admin already exists and will be assigned to this
                      restaurant.
                      {admin.existingHotels &&
                        admin.existingHotels.length > 0 && (
                          <div className="mt-2">
                            <small>
                              <strong>Currently managing restaurants:</strong>{" "}
                              {admin.existingHotels.join(", ")}
                            </small>
                          </div>
                        )}
                    </div>
                  )}

                  {!admin.isExisting && admin.searched && (
                    <div className="alert alert-warning mb-3">
                      <FaUserPlus className="me-2" />
                      Admin with this email doesn't exist. Please fill in the
                      details below to create a new admin.
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
            disabled={
              submitting ||
              !getAdminValidationStatus() ||
              !hotelName.trim() ||
              (getHotelValidationStatus && !getHotelValidationStatus())
            }
          >
            {submitting ? "Creating..." : "Create Restaurant with Admin"}
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
