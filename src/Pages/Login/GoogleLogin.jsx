import React, { useState, useEffect } from "react";
import {
  auth,
  googleProvider,
  signInWithPopup,
  OAuthProvider,
} from "../../data/firebase/firebaseConfig";
import { Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { colors } from "../../theme/theme";
import { ToastContainer, toast } from "react-toastify";
const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: ${colors.Orange};
  padding: 20px;
  text-align: center;

  h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    color: ${colors.White};
  }

  p {
    font-size: 1.5rem;
    margin-bottom: 30px;
    color: ${colors.White};
  }

  .login-button-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    justify-content: center;
    align-items: center;
  }

  .login-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
    font-size: 1.2rem;
    background-color: #ffffff;
    color: #343a40;
    border: none;
    border-radius: 10px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.2s ease-in-out;

    &:hover {
      transform: translateY(-3px);
    }

    .icon {
      margin-right: 10px;
    }
  }

  .apple-button {
    background-color: #000000;
    color: #ffffff;

    &:hover {
      background-color: #333333;
    }
  }
`;

const GoogleLogin = () => {
  const [hotelName, setHotelName] = useState("");

  useEffect(() => {
    const path = window.location.pathname;
    const pathSegments = path.split("/");
    const hotelNameFromPath = pathSegments[pathSegments.length - 1];
    setHotelName(hotelNameFromPath);
  }, []);

  const navigate = useNavigate();

  const handleLoginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Successfully logged in with Google!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      navigate(`/viewMenu/${hotelName}/home`);
    } catch (error) {
      console.error("Error during signInWithPopup", error);
    }
  };

  const handleLoginWithApple = async () => {
    try {
      const appleProvider = new OAuthProvider("apple.com");
      const result = await signInWithPopup(auth, appleProvider);
      toast.success("Successfully logged in with Apple!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      navigate(`/viewMenu/${hotelName}/home`);
    } catch (error) {
      console.error("Error during signInWithApple", error);
    }
  };

  return (
    <LoginContainer>
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={6}>
            <h1>Welcome to {hotelName}!</h1>
            <p>Your favorite dishes are just a click away</p>
            <div className="login-button-container">
              <div className="login-button" onClick={handleLoginWithGoogle}>
                <FcGoogle className="icon" size={24} />
                Sign in with Google
              </div>
              <div
                className="login-button apple-button"
                onClick={handleLoginWithApple}
              >
                <FaApple className="icon" size={24} />
                Sign in with Apple
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      {/* Toast Notification */}
      <ToastContainer />
    </LoginContainer>
  );
};

export default GoogleLogin;
