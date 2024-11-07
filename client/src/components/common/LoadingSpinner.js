import { CircularProgress } from '@mui/material';
import React from 'react';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

function LoadingSpinner() {
  return (
    <LoadingContainer>
      <CircularProgress color="inherit" />
    </LoadingContainer>
  );
}

export default LoadingSpinner;
