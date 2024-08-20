import React from 'react';
import styled from 'styled-components';
import { colors } from '../theme/theme';
const PageTitleContainer = styled.div`
  margin-bottom: 20px;
`;

const PageTitleHeading = styled.h1`
  font-size: 24px;
  margin-bottom: 0;
  font-weight: 600;
  color: ${colors.Black};
  margin-top: 20px;
`;

function PageTitle({ pageTitle }) {
  return (
    <PageTitleContainer>
      <PageTitleHeading>{pageTitle}</PageTitleHeading>
    </PageTitleContainer>
  );
}

export default PageTitle;
