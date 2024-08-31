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
  flex: 0 0 80px;
  overflow: hidden;
`;

const Image = styled.img`
  width: 100px;
  height: 80px;
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

  console.log("data", item);
  return (
    <CardWrapper>
      <ImageSection>
        <Image src={item.imageUrl} alt={item.menuName} />
        {/* Discount Badge */}
        {/* {item.discount > 0 && (
          <span
            className="absolute bottom-0 left-0 bg-orange-500 text-white text-xs font-bold py-1 px-2 transform origin-bottom"
            style={{ width: "101px" }}
          >
            {item.discount}% OFF
          </span>
        )} */}
        {/* Orange Strip */}
        {item.mainCategory && (
          <div className="absolute top-0 left-0 bg-orange-500 text-white text-xs font-bold py-1 px-2 transform origin-bottom">
            {item.mainCategory}
          </div>
        )}
      </ImageSection>
      <TextSection>
        <div style={{ marginTop: "10px" }}>
          <InfoText>{truncatedContent}</InfoText>
          {/* <span>
              {item.discount && (
                <span className="line-through mr-1 text-orange-500">
                 ₹ {Math.round(item.menuPrice)}
                </span>
              )}
             ₹ {item.finalPrice}
            </span> */}

          {!onRemoveFromCart && <InfoText>Qty : {item.quantity}</InfoText>}
          {onRemoveQuantity && onAddQuantity && (
            <QuantitySection>
              <i
                className="bi bi-dash-circle text-orange-500 text-xl cursor-pointer"
                onClick={() => onRemoveQuantity(item.uuid)}
              ></i>
              <span style={{ margin: "0 10px" }}>{item.quantity}</span>
              <i
                className="bi bi-plus-circle-fill text-orange-500 text-xl cursor-pointer"
                onClick={() => onAddQuantity(item.uuid)}
              ></i>
            </QuantitySection>
          )}
        </div>

        <div>
          {onRemoveFromCart && (
            <InfoText onClick={() => onRemoveFromCart(item.uuid)}>
              {/* To adjust styling of cross button */}
              <span style={{ color: `${colors.White}` }}>g</span>
              <i
                class="bi bi-x-circle-fill"
                style={{ color: `${colors.Orange}`, fontSize: "24px" }}
              ></i>
            </InfoText>
          )}
          ₹{item.finalPrice}
        </div>
      </TextSection>
    </CardWrapper>
  );
};

export default CartCard;
