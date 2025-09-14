import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { colors } from "../../theme/theme";
// Styled components
const BackToTopButton = styled.a`
  position: fixed;
  visibility: hidden;
  opacity: 0;
  right: 15px;
  bottom: 15px;
  z-index: 99999;
  background: #4154f1;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  transition: all 0.4s;
  display: flex;
  align-items: center;
  justify-content: center;

  i {
    font-size: 24px;
    color: ${colors.White};
    line-height: 0;
  }

  &:hover {
    background: #6776f4;
    color: ${colors.White};
  }

  &.active {
    visibility: visible;
    opacity: 1;
  }
`;

function BackToTop() {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const backToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <BackToTopButton
      onClick={backToTop}
      className={scroll > 100 ? "active" : undefined}
    >
      <i className="bi bi-arrow-up-short"></i>
    </BackToTopButton>
  );
}

export default BackToTop;
