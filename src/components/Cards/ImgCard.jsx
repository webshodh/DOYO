import React from "react";
import styled from "styled-components";
import { colors } from "../../theme/theme";
const CardCounter = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
  border-radius: 10px;
  background-color: ${colors.White}; /* Adjust as needed */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ImageContainer = styled.div`
  margin-bottom: 1px;
`;

const Img = styled.img`
  max-width: 100%;
  height: 100px;
  weight: 100px;
  border-radius: 5px;
`;

const TextContainer = styled.div`
  margin-bottom: 1px;
`;

const CountName = styled.span`
  font-size: 1rem;
  color: #666; /* Adjust as needed */
`;

const CountBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  background-color: ${(props) => props.bgColor || "#00C000"}; /* Adjust color as needed */
  color: ${colors.White};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1rem;
  font-weight: bold;
`;

const ImgCard = ({ count, label, type, src }) => {
  // Define the badge color based on the type prop
  const badgeColor = '#00C000'; 

  return (
    <div className="col-lg-12 col-md-4 col-sm-6 mb-4">
      <CardCounter className={type}>
        {src && (
          <ImageContainer>
            <Img src={src} alt={label} />
          </ImageContainer>
        )}
        <TextContainer>
          <CountName>{label}</CountName>
        </TextContainer>
        <CountBadge bgColor={badgeColor}>
          {count}
        </CountBadge>
      </CardCounter>
    </div>
  );
};

export default ImgCard;
