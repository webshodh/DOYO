import React, { useState } from "react";
import { ref, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';
import { db } from "../../data/firebase/firebaseConfig";


// Styled-components
const Container = styled.div`
  max-width: 400px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
`;

const Form = styled.form``;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;

  &:disabled {
    background-color: #ddd;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 14px;
`;

const UserLogin = () => {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const validateMobile = (mobile) => /^[0-9]{10}$/.test(mobile);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateEmail(email)) {
      setError("Invalid email address.");
      setLoading(false);
      return;
    }

    if (!validateMobile(mobile)) {
      setError("Invalid mobile number. It should be 10 digits.");
      setLoading(false);
      return;
    }

    try {
      // Create a unique user ID based on the email
      const userId = email.replace(/[^a-zA-Z0-9]/g, '_');

      // Store user data in Firebase Realtime Database
      await set(ref(db, 'users/' + userId), {
        firstName,
        email,
        mobile,
        role : 'user',
      });
     
      // Redirect to the home page
      navigate("/home");
    } catch (error) {
      console.error("Error storing user data:", error);
      setError("Failed to store user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="first-name">First Name:</Label>
          <Input
            id="first-name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
            required
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="email">Email:</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="mobile">Mobile Number:</Label>
          <Input
            id="mobile"
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Enter your mobile number"
            required
          />
        </FormGroup>
        <Button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Login'}
        </Button>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Form>
    </Container>
  );
};

export default UserLogin;
