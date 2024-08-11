import React from "react";
import styled from "styled-components";
import { colors } from "../../theme/theme";
const CardCounter = styled.div`
  box-shadow: 2px 2px 10px #dadada;
  margin: 5px;
  padding: 20px 10px;
  background-color: ${colors.White};
  height: 100px;
  border-radius: 5px;
  transition: 0.3s linear all;
  position: relative;
  width: 200px;
  background-color: ${colors.White};
  color: ${colors.Black};

  &:hover {
    box-shadow: 4px 4px 20px #dadada;
    transition: 0.3s linear all;
    color: ${(props) => props.color};
  }
`;

const Icon = styled.i`
  font-size: 2em;
  color: ${(props) => props.color || `${colors.Blue}`};
`;
const CountNumbers = styled.span`
  position: absolute;
  right: 35px;
  top: 20px;
  font-size: 32px;
  display: block;
`;

const CountName = styled.span`
  position: absolute;
  right: 35px;
  top: 65px;
  font-style: italic;
  text-transform: capitalize;
  opacity: 0.5;
  display: block;
  font-size: 18px;
  font-weight: bold;
`;

const Img = styled.img`
  width: ${(props) => props.width || '100px'};
  height: ${(props) => props.height || '100px'};
  margin-top: ${(props) => props.marginTop || '-20px'};
  margin-left: ${(props) => props.marginLeft || '0px'};
`;

const CountCardContainer = styled.div`
  .col-lg-2,
  .col-md-4,
  .col-sm-6 {
    margin-bottom: 4rem;
  }
`;

const CountCard = ({ icon, count, label, type, src, iconColor, height, width, marginTop, marginLeft}) => {
  return (
    <CountCardContainer className="col-lg-2 col-md-4 col-sm-6 mb-4">
      <CardCounter className={type} color={iconColor}>
        {src && (
          <div className={src ? "image-container" : ""}>
            <Img src={src} alt={label} height={height} width={width} marginTop={marginTop} marginLeft={marginLeft}/>
          </div>
        )}
        <div className="text-container">
          {icon && <Icon className={`bi ${icon}`} color={iconColor}/>}
          <CountName className="count-name">{label}</CountName>
          <CountNumbers className="count-numbers">{count}</CountNumbers>
        </div>
      </CardCounter>
    </CountCardContainer>
  );
};

export default CountCard;
