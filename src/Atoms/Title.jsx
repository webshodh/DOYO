import React from 'react';
import styled from 'styled-components';
import { colors } from '../theme/theme';
const StyledTitle = styled.h3`
  background-color: #007bff;
  color: ${colors.White};
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const Title = ({ title }) => {
  return <StyledTitle>{title}</StyledTitle>;
};

export default Title;
