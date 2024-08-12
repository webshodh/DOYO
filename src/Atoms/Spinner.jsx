// Spinner.js
import React from 'react';
import styled from 'styled-components';

const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh; // Adjust as necessary
`;

const Spinner = () => (
  <SpinnerContainer>
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </SpinnerContainer>
);

export default Spinner;
