import React from 'react';
import styled, { keyframes } from 'styled-components';
import HotelSelector from './HotelSelector';
import { getAuth } from 'firebase/auth';
import { useHotelContext } from '../../Context/HotelContext';
import { useNavigate } from 'react-router-dom';
// Define keyframes for animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
`;

// Styled components
const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f0f0; /* Change as needed */
  text-align: center;
  animation: ${fadeIn} 1s ease-in-out;
`;

const WelcomeTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 20px;
  animation: ${slideIn} 1s ease-in-out;
`;

const WelcomeMessage = styled.p`
  font-size: 1.5rem;
  margin-bottom: 40px;
  animation: ${slideIn} 1s ease-in-out 0.5s; /* Delay for staggered effect */
`;

const AnimationContainer = styled.div`
  animation: ${bounce} 2s infinite;
`;

const WelcomeLogo = styled.img`
  width: 150px; /* Adjust the size as needed */
`;

const WelcomeScreen = () => {
    const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
const navigate = useNavigate()
  const { hotelName, setHotelName } = useHotelContext();

  const handleHotelSelect = (selectedHotelName) => {
    // const formattedHotelName = selectedHotelName.replace(/\s+/g, ''); // Remove spaces
    setHotelName(selectedHotelName); // Update hotelName in context
  };
  const handleNext =()=>{
    navigate(`/${hotelName}/admin/dashboard`)
  }
  return (
    <WelcomeContainer>
      <WelcomeTitle>Welcome to Our App!</WelcomeTitle>
      <WelcomeMessage>We are glad to have you here.</WelcomeMessage>
      <AnimationContainer>
        <WelcomeLogo src="/path/to/your/logo.png" alt="Logo" />
      </AnimationContainer>
      <HotelSelector adminId={currentAdminId} onHotelSelect={handleHotelSelect}/>
      <button onClick={handleNext}>Next</button>
    </WelcomeContainer>
  );
};

export default WelcomeScreen;
