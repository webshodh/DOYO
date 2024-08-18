import React, { useState, useEffect } from "react";
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { app } from "../../data/firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';

const countryCodes = [
  { code: '+1', country: 'United States' },
  { code: '+91', country: 'India' },
  { code: '+44', country: 'United Kingdom' },
  // Add more country codes as needed
];

const MobileLoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(null);
  const [selectedCode, setSelectedCode] = useState(countryCodes[0].code);
  const [requestDisabled, setRequestDisabled] = useState(false); // Prevent multiple requests
  const [cooldown, setCooldown] = useState(false); // Cooldown to prevent rate limits
  const navigate = useNavigate();
  const auth = getAuth(app);

  useEffect(() => {
    // Initialize reCAPTCHA
    window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        console.log("reCAPTCHA solved");
      },
      'expired-callback': () => {
        // Handle expired reCAPTCHA
        console.log("reCAPTCHA expired");
      }
    }, auth);

    return () => {
      // Cleanup reCAPTCHA instance on unmount
      window.recaptchaVerifier?.clear();
    };
  }, [auth]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/');
      }
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [auth, navigate]);

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleOTPChange = (e) => {
    setOtp(e.target.value);
  };

  const handleCountryCodeChange = (e) => {
    setSelectedCode(e.target.value);
  };

  const handleSentOtp = async () => {
    try {
      if (requestDisabled) return; // Prevent multiple requests
      if (cooldown) {
        setError("Please wait before requesting a new OTP.");
        return;
      }

      const formattedPhoneNumber = `${selectedCode}${phoneNumber.replace(/\D/g, "")}`;
      console.log('formattedPhoneNumber', formattedPhoneNumber);

      // Initialize Firebase Phone Auth with reCAPTCHA
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, window.recaptchaVerifier);

      setOtpSent(true);
      setPhoneNumber("");
      setVerified(confirmationResult);
      setError(""); // Clear previous errors
      alert("OTP has been sent");

      // Disable button and start cooldown period
      setRequestDisabled(true);
      setCooldown(true);
      setTimeout(() => {
        setRequestDisabled(false);
        setCooldown(false);
      }, 60000); // 1-minute cooldown
    } catch (error) {
      console.error("Failed to send OTP:", error);
      if (error.code === 'auth/too-many-requests') {
        setError("You have sent too many requests. Please try again later.");
      } else {
        setError("Failed to send OTP. Please try again later.");
      }
    }
  };

  const handleOTPSubmit = async () => {
    try {
      if (verified) {
        await verified.confirm(otp);
        setOtp("");
        navigate("/home");
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      setError("OTP verification failed. Please check your OTP and try again.");
    }
  };

  return (
    <Container>
      <FormGroup>
        <Label htmlFor="country-code">Country Code:</Label>
        <Select id="country-code" value={selectedCode} onChange={handleCountryCodeChange}>
          {countryCodes.map((code) => (
            <Option key={code.code} value={code.code}>
              {code.country} ({code.code})
            </Option>
          ))}
        </Select>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="phone-number">Phone Number:</Label>
        <Input
          id="phone-number"
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder="Enter your phone number"
        />
      </FormGroup>
      {otpSent && (
        <FormGroup>
          <Label htmlFor="otp">OTP:</Label>
          <Input
            id="otp"
            type="text"
            value={otp}
            onChange={handleOTPChange}
            placeholder="Enter OTP"
          />
        </FormGroup>
      )}
      <Button onClick={otpSent ? handleOTPSubmit : handleSentOtp} disabled={requestDisabled}>
        {otpSent ? 'Submit OTP' : 'Send OTP'}
      </Button>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <div id="recaptcha-container"></div> {/* Add this line to render reCAPTCHA */}
    </Container>
  );
};

export default MobileLoginPage;

// Styled-components
const Container = styled.div`
  max-width: 400px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
`;

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

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Option = styled.option``;

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
