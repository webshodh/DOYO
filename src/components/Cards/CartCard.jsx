import React from "react";
import styled from "styled-components";
import { Button } from "react-bootstrap";
import { colors } from "../../theme/theme";
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
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
`;

const CartCard = ({
  item,
  onAddQuantity,
  onRemoveQuantity,
  onRemoveFromCart,
}) => {
  // Truncate menuContent if it's longer than 25 characters
  const truncatedContent =
    item.menuName.length > 15
      ? item.menuName.slice(0, 15) + "..."
      : item.menuName;
  return (
    <CardWrapper>
      <ImageSection>
        <Image src={item.imageUrl} alt={item.menuName} />
      </ImageSection>
      <TextSection>
        <div style={{ marginTop: "10px" }}>
          <InfoText>{truncatedContent}</InfoText>

          {onRemoveQuantity && onAddQuantity && (
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
          )}
        </div>

        <div>
          <InfoText onClick={() => onRemoveFromCart(item.uuid)}>
            {/* To adjust styling of cross button */}
            <span style={{ color: `${colors.White}` }}>g</span>
            <i
              class="bi bi-x-circle-fill"
              style={{ color: `${colors.Red}`, fontSize: "24px" }}
            ></i>
          </InfoText>
          <InfoText style={{ marginTop: "25px" }}>
            <b>₹ {item.menuPrice}</b>
          </InfoText>
        </div>
      </TextSection>
    </CardWrapper>
  );
};

export default CartCard;
