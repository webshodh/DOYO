import React, { useState } from "react";
import styled from "styled-components";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export const FormContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin: 20px;
  flex-direction: column;
`;

export const SectionTitle = styled.h2`
  margin-top: 30px;
  font-size: 1.5rem;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
`;

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

export const Label = styled.label`
  margin-bottom: 8px;
  font-weight: bold;
`;

export const Input = styled.input`
  padding: 10px;
  border: 1px solid
    ${(props) => (props.error ? "#dc3545" : props.success ? "#28a745" : "#ccc")};
  border-radius: 4px;
  outline: none;
  box-shadow: ${(props) =>
    props.error ? "0 0 0 1px rgba(220, 53, 69, 0.5)" : "none"};

  &:focus {
    border-color: ${(props) => (props.error ? "#dc3545" : "#80bdff")};
    box-shadow: ${(props) =>
      props.error
        ? "0 0 0 1px rgba(220, 53, 69, 0.5)"
        : "0 0 0 0.2rem rgba(38, 143, 255, 0.25)"};
  }
`;

export const Icon = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: ${(props) => (props.error ? "#dc3545" : "#28a745")};
`;

export const ErrorMessage = styled.p`
  color: #dc3545;
  font-size: 0.875rem;
  margin: 5px 0 0;
`;

export const Button = styled.button`
  width: 200px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  background-color: ${(props) => (props.primary ? "#28a745" : "#dc3545")};
  margin-top: 10px;

  &:hover {
    background-color: ${(props) => (props.primary ? "#218838" : "#c82333")};
  }
`;

function AddStaff() {
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    aadharNumber: "",
  });

  const [contactInfo, setContactInfo] = useState({
    mobileNumber: "",
    email: "",
    residentialAddress: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
  });

  const [employmentDetails, setEmploymentDetails] = useState({
    role: "",
    employeeId: "",
    joiningDate: "",
    shiftTiming: "",
    department: "",
    workLocation: "",
  });

  const [additionalInfo, setAdditionalInfo] = useState({
    bankAccountDetails: "",
    panCardNumber: "",
    previousEmploymentHistory: "",
    skills: "",
    photograph: "",
  });

  const [formErrors, setFormErrors] = useState({
    firstName: false,
    lastName: false,
    dob: false,
    gender: false,
    aadharNumber: false,
    mobileNumber: false,
    email: false,
    residentialAddress: false,
    emergencyContactName: false,
    emergencyContactNumber: false,
    role: false,
    employeeId: false,
    joiningDate: false,
    shiftTiming: false,
    department: false,
    workLocation: false,
    bankAccountDetails: false,
    panCardNumber: false,
  });

  const handleInputChange = (section, field, value) => {
    switch (section) {
      case "personalInfo":
        setPersonalInfo({ ...personalInfo, [field]: value });
        break;
      case "contactInfo":
        setContactInfo({ ...contactInfo, [field]: value });
        break;
      case "employmentDetails":
        setEmploymentDetails({ ...employmentDetails, [field]: value });
        break;
      case "additionalInfo":
        setAdditionalInfo({ ...additionalInfo, [field]: value });
        break;
      default:
        break;
    }
  };

  const handleSubmit = () => {
    // Reset errors
    const newErrors = {
      firstName: !personalInfo.firstName,
      lastName: !personalInfo.lastName,
      dob: !personalInfo.dob,
      gender: !personalInfo.gender,
      aadharNumber: !personalInfo.aadharNumber,
      mobileNumber: !contactInfo.mobileNumber,
      email: !contactInfo.email,
      residentialAddress: !contactInfo.residentialAddress,
      emergencyContactName: !contactInfo.emergencyContactName,
      emergencyContactNumber: !contactInfo.emergencyContactNumber,
      role: !employmentDetails.role,
      employeeId: !employmentDetails.employeeId,
      joiningDate: !employmentDetails.joiningDate,
      shiftTiming: !employmentDetails.shiftTiming,
      department: !employmentDetails.department,
      workLocation: !employmentDetails.workLocation,
      bankAccountDetails: !additionalInfo.bankAccountDetails,
      panCardNumber: !additionalInfo.panCardNumber,
    };
    setFormErrors(newErrors);

    // Check if there are any errors
    if (Object.values(newErrors).some((error) => error)) {
      return; // Stop submission if there are errors
    }
  };

  

  return (
    <FormContainer>
      <div className="background-card p-3">
        <SectionTitle>Personal Information</SectionTitle>
        <div className="row g-3">
          <div className="col-md-6">
            <InputWrapper>
              <Label>First Name</Label>
              <Input
                type="text"
                value={personalInfo.firstName}
                onChange={(e) =>
                  handleInputChange("personalInfo", "firstName", e.target.value)
                }
                placeholder="Enter First Name"
                className={`form-control ${
                  formErrors.firstName ? "is-invalid" : ""
                }`}
              />
              {formErrors.firstName && (
                <ErrorMessage>First Name is required.</ErrorMessage>
              )}
            </InputWrapper>
          </div>
          <div className="col-md-6">
            <InputWrapper>
              <Label>Last Name</Label>
              <Input
                type="text"
                value={personalInfo.lastName}
                onChange={(e) =>
                  handleInputChange("personalInfo", "lastName", e.target.value)
                }
                placeholder="Enter Last Name"
                className={`form-control ${
                  formErrors.lastName ? "is-invalid" : ""
                }`}
              />
              {formErrors.lastName && (
                <ErrorMessage>Last Name is required.</ErrorMessage>
              )}
            </InputWrapper>
          </div>
          <div className="col-md-6">
            <InputWrapper>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={personalInfo.dob}
                onChange={(e) =>
                  handleInputChange("personalInfo", "dob", e.target.value)
                }
                className={`form-control ${formErrors.dob ? "is-invalid" : ""}`}
              />
              {formErrors.dob && (
                <ErrorMessage>Date of Birth is required.</ErrorMessage>
              )}
            </InputWrapper>
          </div>
          <div className="col-md-6">
            <InputWrapper>
              <Label>Gender</Label>
              <Input
                type="text"
                value={personalInfo.gender}
                onChange={(e) =>
                  handleInputChange("personalInfo", "gender", e.target.value)
                }
                placeholder="Enter Gender"
                className={`form-control ${
                  formErrors.gender ? "is-invalid" : ""
                }`}
              />
              {formErrors.gender && (
                <ErrorMessage>Gender is required.</ErrorMessage>
              )}
            </InputWrapper>
          </div>
          <div className="col-md-6">
            <InputWrapper>
              <Label>Aadhar Number</Label>
              <Input
                type="text"
                value={personalInfo.aadharNumber}
                onChange={(e) =>
                  handleInputChange(
                    "personalInfo",
                    "aadharNumber",
                    e.target.value
                  )
                }
                placeholder="Enter Aadhar Number"
                className={`form-control ${
                  formErrors.aadharNumber ? "is-invalid" : ""
                }`}
              />
              {formErrors.aadharNumber && (
                <ErrorMessage>Aadhar Number is required.</ErrorMessage>
              )}
            </InputWrapper>
          </div>
        </div>
      </div>

      <div className="background-card p-3">
        <SectionTitle>Contact Information</SectionTitle>
        <div className="row g-3">
          <div className="col-md-6">
            <InputWrapper>
              <Label>Mobile Number</Label>
              <Input
                type="text"
                value={contactInfo.mobileNumber}
                onChange={(e) =>
                  handleInputChange(
                    "contactInfo",
                    "mobileNumber",
                    e.target.value
                  )
                }
                placeholder="Enter Mobile Number"
                className={`form-control ${
                  formErrors.mobileNumber ? "is-invalid" : ""
                }`}
              />
              {formErrors.mobileNumber && (
                <ErrorMessage>Mobile Number is required.</ErrorMessage>
              )}
            </InputWrapper>
          </div>
          <div className="col-md-6">
            <InputWrapper>
              <Label>Email Address</Label>
              <Input
                type="email"
                value={contactInfo.email}
                onChange={(e) =>
                  handleInputChange("contactInfo", "email", e.target.value)
                }
                placeholder="Enter Email Address"
                className={`form-control ${
                  formErrors.email ? "is-invalid" : ""
                }`}
              />
              {formErrors.email && (
                <ErrorMessage>Email Address is required.</ErrorMessage>
              )}
            </InputWrapper>
          </div>
          <div className="col-md-12">
            <InputWrapper>
              <Label>Residential Address</Label>
              <Input
                type="text"
                value={contactInfo.residentialAddress}
                onChange={(e) =>
                  handleInputChange(
                    "contactInfo",
                    "residentialAddress",
                    e.target.value
                  )
                }
                placeholder="Enter Residential Address"
                className={`form-control ${
                  formErrors.residentialAddress ? "is-invalid" : ""
                }`}
              />
              {formErrors.residentialAddress && (
                <ErrorMessage>Residential Address is required.</ErrorMessage>
              )}
            </InputWrapper>
          </div>
          <div className="col-md-6">
            <InputWrapper>
              <Label>Emergency Contact Name</Label>
              <Input
                type="text"
                value={contactInfo.emergencyContactName}
                onChange={(e) =>
                  handleInputChange(
                    "contactInfo",
                    "emergencyContactName",
                    e.target.value
                  )
                }
                placeholder="Enter Emergency Contact Name"
                className={`form-control ${
                  formErrors.emergencyContactName ? "is-invalid" : ""
                }`}
              />
              {formErrors.emergencyContactName && (
                <ErrorMessage>Emergency Contact Name is required.</ErrorMessage>
              )}
            </InputWrapper>
          </div>
          <div className="col-md-6">
            <InputWrapper>
              <Label>Emergency Contact Number</Label>
              <Input
                type="text"
                value={contactInfo.emergencyContactNumber}
                onChange={(e) =>
                  handleInputChange(
                    "contactInfo",
                    "emergencyContactNumber",
                    e.target.value
                  )
                }
                placeholder="Enter Emergency Contact Number"
                className={`form-control ${
                  formErrors.emergencyContactNumber ? "is-invalid" : ""
                }`}
              />
              {formErrors.emergencyContactNumber && (
                <ErrorMessage>
                  Emergency Contact Number is required.
                </ErrorMessage>
              )}
            </InputWrapper>
          </div>
        </div>
      </div>

      <div className="background-card p-3">
        <SectionTitle>Employment Details</SectionTitle>
        <div className="row g-3">
          <div className="col-md-6">
            <InputWrapper>
              <Label>Role/Position</Label>
              <Input
                type="text"
                value={employmentDetails.role}
                onChange={(e) =>
                  handleInputChange("employmentDetails", "role", e.target.value)
                }
                placeholder="Enter Role/Position"
                className={`form-control ${
                  formErrors.role ? "is-invalid" : ""
                }`}
              />
              {formErrors.role && (
                <ErrorMessage>Role/Position is required.</ErrorMessage>
              )}
            </InputWrapper>
          </div>
          <div className="col-md-6">
            <InputWrapper>
              <Label>Employee ID</Label>
              <Input
                type="text"
                value={employmentDetails.employeeId}
                onChange={(e) =>
                  handleInputChange(
                    "employmentDetails",
                    "employeeId",
                    e.target.value
                  )
                }
                placeholder="Enter Employee ID"
                className={`form-control ${
                  formErrors.employeeId ? "is-invalid" : ""
                }`}
              />
              {formErrors.employeeId && (
                <ErrorMessage>Employee ID is required.</ErrorMessage>
              )}
            </InputWrapper>
          </div>
          <div className="col-md-6">
            <InputWrapper>
              <Label>Joining Date</Label>
              <Input
                type="date"
                value={employmentDetails.joiningDate}
                onChange={(e) =>
                  handleInputChange(
                    "employmentDetails",
                    "joiningDate",
                    e.target.value
                  )
                }
                className={`form-control ${
                  formErrors.joiningDate ? "is-invalid" : ""
                }`}
              />
              {formErrors.joiningDate && (
                <ErrorMessage>Joining Date is required.</ErrorMessage>
              )}
            </InputWrapper>
          </div>
          <div className="col-md-6">
            <InputWrapper>
              <Label>Shift Timing</Label>
              <Input
                type="text"
                value={employmentDetails.shiftTiming}
                onChange={(e) =>
                  handleInputChange(
                    "employmentDetails",
                    "shiftTiming",
                    e.target.value
                  )
                }
                placeholder="Enter Shift Timing"
                className={`form-control ${
                  formErrors.shiftTiming ? "is-invalid" : ""
                }`}
              />
              {formErrors.shiftTiming && (
                <ErrorMessage>Shift Timing is required.</ErrorMessage>
              )}
            </InputWrapper>
          </div>
          <div className="col-md-6">
            <InputWrapper>
              <Label>Department</Label>
              <Input
                type="text"
                value={employmentDetails.department}
                onChange={(e) =>
                  handleInputChange(
                    "employmentDetails",
                    "department",
                    e.target.value
                  )
                }
                placeholder="Enter Department"
                className={`form-control ${
                  formErrors.department ? "is-invalid" : ""
                }`}
              />
              {formErrors.department && (
                <ErrorMessage>Department is required.</ErrorMessage>
              )}
            </InputWrapper>
          </div>
          <div className="col-md-6">
            <InputWrapper>
              <Label>Work Location</Label>
              <Input
                type="text"
                value={employmentDetails.workLocation}
                onChange={(e) =>
                  handleInputChange(
                    "employmentDetails",
                    "workLocation",
                    e.target.value
                  )
                }
                placeholder="Enter Work Location"
                className={`form-control ${
                  formErrors.workLocation ? "is-invalid" : ""
                }`}
              />
              {formErrors.workLocation && (
                <ErrorMessage>Work Location is required.</ErrorMessage>
              )}
            </InputWrapper>
          </div>
        </div>
      </div>

      <div className="background-card p-3">
        <SectionTitle>Additional Information</SectionTitle>
        <div className="row g-3">
          <div className="col-md-6">
            <InputWrapper>
              <Label>Bank Account Details</Label>
              <Input
                type="text"
                value={additionalInfo.bankAccountDetails}
                onChange={(e) =>
                  handleInputChange(
                    "additionalInfo",
                    "bankAccountDetails",
                    e.target.value
                  )
                }
                placeholder="Enter Bank Account Details"
                className={`form-control ${
                  formErrors.bankAccountDetails ? "is-invalid" : ""
                }`}
              />
              {formErrors.bankAccountDetails && (
                <ErrorMessage>Bank Account Details are required.</ErrorMessage>
              )}
            </InputWrapper>
          </div>
          <div className="col-md-6">
            <InputWrapper>
              <Label>PAN Card Number</Label>
              <Input
                type="text"
                value={additionalInfo.panCardNumber}
                onChange={(e) =>
                  handleInputChange(
                    "additionalInfo",
                    "panCardNumber",
                    e.target.value
                  )
                }
                placeholder="Enter PAN Card Number"
                className={`form-control ${
                  formErrors.panCardNumber ? "is-invalid" : ""
                }`}
              />
              {formErrors.panCardNumber && (
                <ErrorMessage>PAN Card Number is required.</ErrorMessage>
              )}
            </InputWrapper>
          </div>
          <div className="col-md-6">
            <InputWrapper>
              <Label>Previous Employment History</Label>
              <Input
                type="text"
                value={additionalInfo.previousEmploymentHistory}
                onChange={(e) =>
                  handleInputChange(
                    "additionalInfo",
                    "previousEmploymentHistory",
                    e.target.value
                  )
                }
                placeholder="Enter Previous Employment History"
                className={`form-control ${
                  formErrors.previousEmploymentHistory ? "is-invalid" : ""
                }`}
              />
              {formErrors.previousEmploymentHistory && (
                <ErrorMessage>
                  Previous Employment History is required.
                </ErrorMessage>
              )}
            </InputWrapper>
          </div>
          <div className="col-md-6">
            <InputWrapper>
              <Label>Skills/Certifications</Label>
              <Input
                type="text"
                value={additionalInfo.skills}
                onChange={(e) =>
                  handleInputChange("additionalInfo", "skills", e.target.value)
                }
                placeholder="Enter Skills/Certifications"
                className={`form-control ${
                  formErrors.skills ? "is-invalid" : ""
                }`}
              />
              {formErrors.skills && (
                <ErrorMessage>Skills/Certifications are required.</ErrorMessage>
              )}
            </InputWrapper>
          </div>
          <div className="col-md-6">
            <InputWrapper>
              <Label>Photograph</Label>
              <Input
                type="file"
                onChange={(e) =>
                  handleInputChange(
                    "additionalInfo",
                    "photograph",
                    e.target.files[0]
                  )
                }
                className={`form-control ${
                  formErrors.photograph ? "is-invalid" : ""
                }`}
              />
              {formErrors.photograph && (
                <ErrorMessage>Photograph is required.</ErrorMessage>
              )}
            </InputWrapper>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        onClick={handleSubmit}
        className="mt-3 btn btn-primary"
      >
        Submit
      </Button>
    </FormContainer>
  );
}

export default AddStaff;
