import React from "react";
import styled from "styled-components";
import { Button } from "react-bootstrap";

// Styled Components
const CardWrapper = styled.div`
  display: flex;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  margin: 10px;
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
  padding: 0px 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const InfoText = styled.div`
  margin: 5px 0;
  word-wrap: break-word;
`;

const QuantitySection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
`;

const CartCard = ({
  item,
  onAddQuantity,
  onRemoveQuantity,
  onRemoveFromCart,
}) => {
  return (
    <CardWrapper>
      <ImageSection>
        <Image src={item.imageUrl} alt={item.menuName} />
      </ImageSection>
      <TextSection>
        <div>
          <InfoText>{item.menuName}</InfoText>
          <InfoText>
            <img
              src="/rupee.png"
              alt="Menu Price"
              width="18"
              height="18"
              style={{ marginRight: "5px", marginBottom: "5px" }}
            />
            {item.menuPrice}
          </InfoText>
        </div>
        <QuantitySection>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => onRemoveQuantity(item.uuid)}
          >
            -
          </Button>
          <span style={{ margin: "0 10px" }}>{item.quantity}</span>
          <Button
            variant="outline-success"
            size="sm"
            onClick={() => onAddQuantity(item.uuid)}
          >
            +
          </Button>
        </QuantitySection>
      </TextSection>
    </CardWrapper>
  );
};

export default CartCard;
