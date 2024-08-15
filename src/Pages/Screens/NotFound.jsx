import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

// Styled components
const NotFoundContainer = styled.div`
  text-align: center;
  padding: 50px;
`;

const Heading = styled.h1`
  font-size: 3rem;
`;

const Paragraph = styled.p`
  font-size: 1.2rem;
`;

const StyledLink = styled(Link)`
  color: #007bff;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const NotFound = () => {
  return (
    <NotFoundContainer>
      <Heading>404 - Page Not Found</Heading>
      <Paragraph>Sorry, the page you are looking for does not exist.</Paragraph>
      <StyledLink to="/">Go to Home</StyledLink>
    </NotFoundContainer>
  );
};

export default NotFound;
