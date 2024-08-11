import React, { useState } from "react";
import styled from "styled-components";

const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const Card = styled.div`
  width: 100%;
  max-width: 400px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const CardImage = styled.img`
  width: 100%;
  height: 150px;
`;

const CardBody = styled.div`
  padding: 16px;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.5rem;
`;

const CardText = styled.p`
  margin: 8px 0;
  font-size: 1rem;
  color: #555;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: end;
  width: 100%;
  max-width: 400px;
  margin-top: 10px;
`;

const Button = styled.div`
  color: #dc3545 !important;
 
  font-size: 1.5rem;
  cursor: pointer;
  margin-right: 10px;

`;

const CardSlider = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === cards.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? cards.length - 1 : prevIndex - 1
    );
  };

  return (
    <SliderContainer>
      <Card>
        <CardImage
          src={cards[currentIndex].image}
          alt={cards[currentIndex].title}
        />
      </Card>
      <ButtonContainer>
        <Button onClick={handlePrev}>
          <i class="bi bi-arrow-left-circle-fill"></i>
        </Button>
        <Button onClick={handleNext}>
          <i class="bi bi-arrow-right-circle-fill"></i>
        </Button>
      </ButtonContainer>
    </SliderContainer>
  );
};

export default CardSlider;
