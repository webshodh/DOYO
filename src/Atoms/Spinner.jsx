// Spinner.js
import React from 'react';
import styled from 'styled-components';

const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh; // Adjust as necessary
`;

const StyledSpinner = styled.div`
  width: 3rem; // Adjust size as needed
  height: 3rem; // Adjust size as needed
  border: 0.25em solid transparent; // To keep the size consistent
  border-top-color: orange; // Spinner color
  border-radius: 50%;
  animation: spin 0.75s linear infinite; // Animation for spinning

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const Spinner = () => (
  <SpinnerContainer>
    <StyledSpinner role="status">
      <span className="visually-hidden">Loading...</span>
    </StyledSpinner>
  </SpinnerContainer>
);

export default Spinner;
