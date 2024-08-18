import React, { useState } from "react";
import styled from "styled-components";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { colors } from "../../theme/theme";

// Styled Components (reused from your existing code)
const CardWrapper = styled.div`
  display: flex;
  background: ${(props) => `${colors.White}`};
  color: black;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  margin: 10px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s; // Smooth transition for background and text color

  &:hover {
    background-color: ${(props) => `${colors.Orange}`};
    color: ${(props) => `${colors.White}`};
  }

  &:active {
    background-color: ${(props) => `${colors.Orange}`};
    color: ${(props) => `${colors.White}`};
  }
`;

const ImageSection = styled.div`
  flex: 0 0 100px;
  overflow: hidden;
`;

const Image = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 10px 0 0 10px;
`;

const TextSection = styled.div`
  flex: 1;
  padding: 5px 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 300px;
`;

const InfoText = styled.div`
  margin: 5px 10px 5px 0px;
  word-wrap: break-word;
`;

const CaptainCard = ({
  fullName,
  imageUrl,
  upiId,
  selectedCaptain,
  setSelectedCaptain,
  isSelected,
}) => {
  const handleSelect = () => {
    setSelectedCaptain(fullName, imageUrl, upiId);
  };

  return (
    <CardWrapper
      onClick={handleSelect}
      isSelected={isSelected}
      className={selectedCaptain?.fullName === fullName ? "border-primary" : ""}
    >
      <ImageSection>
        <Image
          src={imageUrl || "/captain.png"} // Placeholder image for captain
        />
      </ImageSection>
      <TextSection>
        <InfoText>{fullName}</InfoText>
        <div className="d-flex">
          {/* You can add more captain details if needed */}
          <InfoText>{upiId}</InfoText>
        </div>
      </TextSection>
    </CardWrapper>
  );
};

export default CaptainCard;
