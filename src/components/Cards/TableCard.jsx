import React from "react";
import styled from "styled-components";
import { colors } from "../../theme/theme";
import { CardHeader } from "react-bootstrap";
const CardCounter = styled.div`
  box-shadow: 2px 2px 10px #dadada;
  margin: 5px;
  padding: 20px 10px;
  height: 100px;
  border-radius: 5px;
  transition: 0.3s linear all;
  position: relative;
  width: 200px;
  color: ${colors.Black};
  background: ${(props) => props.bgColor || `${colors.White}`};
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

const TableNumbers = styled.span`
  position: absolute;
  right: 90px;
  top: 20px;
  font-style: italic;
  text-transform: capitalize;
  opacity: 0.5;
  display: block;
  font-size: 18px;
  font-weight: bold;
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

const TableName = styled.span`
  position: absolute;
  font-style: italic;
  text-transform: capitalize;
  opacity: 0.5;
  display: block;
  font-size: 18px;
  font-weight: bold;
`;

const CountCardContainer = styled.div`
  .col-lg-2,
  .col-md-4,
  .col-sm-6 {
    margin-bottom: 4rem;
  }
`;

const TableCard = ({ count, type, iconColor, bgColor, order, orderCount }) => {
  return (
    <CountCardContainer className="col-lg-2 col-md-4 col-sm-6 mb-4">
      <CardCounter className={type} color={iconColor} bgColor={bgColor}>
        <CardHeader>
          <div className="d-flex">
            <TableName className="count-name">{"Table No"}: </TableName>
            <TableNumbers className="count-numbers">{count}</TableNumbers>
          </div>
        </CardHeader>
        <div className="text-container">
          <div className="d-flex">
            <CountName className="count-name">{order}:</CountName>
            <CountNumbers className="count-numbers">{orderCount}</CountNumbers>
          </div>
        </div>
      </CardCounter>
    </CountCardContainer>
  );
};

export default TableCard;
