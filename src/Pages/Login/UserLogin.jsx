// UserLogin.js
import React, { useState } from "react";
import {
  auth,
  googleProvider,
  signInWithPhoneNumber,
  signInWithPopup,
} from "../../data/firebase/firebaseConfig";
import { RecaptchaVerifier } from "firebase/auth";
import { Button, Form, InputGroup, FormControl } from "react-bootstrap"; // Import from react-bootstrap
import { useNavigate } from "react-router-dom";

const UserLogin = () => {
  // const [phoneNumber, setPhoneNumber] = useState("");
  // const [verificationCode, setVerificationCode] = useState("");
  // const [isCodeSent, setIsCodeSent] = useState(false);
  const navigate = useNavigate();
  const hotelName = "Atithi";
  // const setupRecaptcha = () => {
  //   window.recaptchaVerifier = new RecaptchaVerifier(
  //     "recaptcha-container",
  //     {
  //       size: "invisible",
  //       callback: (response) => {
  //         // Recaptcha resolved
  //       },
  //     },
  //     auth
  //   );
  // };

  // const handleLoginWithPhone = async (e) => {
  //   e.preventDefault();
  //   setupRecaptcha();

  //   const appVerifier = window.recaptchaVerifier;

  //   try {
  //     const confirmationResult = await signInWithPhoneNumber(
  //       auth,
  //       phoneNumber,
  //       appVerifier
  //     );
  //     window.confirmationResult = confirmationResult;
  //     setIsCodeSent(true);
  //   } catch (error) {
  //     console.error("Error during signInWithPhoneNumber", error);
  //   }
  // };

  // const handleVerifyCode = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const confirmationResult = window.confirmationResult;
  //     await confirmationResult.confirm(verificationCode);
  //     alert("Successfully logged in!");
  //   } catch (error) {
  //     console.error("Error during verification", error);
  //   }
  // };

  const handleLoginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert("Successfully logged in with Google!");
      navigate(`/viewMenu/${hotelName}`);
    } catch (error) {
      console.error("Error during signInWithPopup", error);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {/* <div id="recaptcha-container"></div>

      {!isCodeSent ? (
        <Form onSubmit={handleLoginWithPhone}>
          <InputGroup className="mb-3">
            <FormControl
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </InputGroup>
          <Button type="submit" variant="primary">
            Send Verification Code
          </Button>
        </Form>
      ) : (
        <Form onSubmit={handleVerifyCode}>
          <InputGroup className="mb-3">
            <FormControl
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter the verification code"
              required
            />
          </InputGroup>
          <Button type="submit" variant="primary">
            Verify Code
          </Button>
        </Form>
      )} */}

      <Button
        onClick={handleLoginWithGoogle}
        variant="secondary"
        className="mt-3"
      >
        Login with Google
      </Button>
    </div>
  );
};

export default UserLogin;
