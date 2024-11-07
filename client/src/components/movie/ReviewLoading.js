import React from 'react';
import styled from 'styled-components';
import LoadingSpinner from '../common/LoadingSpinner';

const Wrapper = styled.div`
  height: 290px;
  display: flex;
  justify-content: center;
`;

function ReviewLoading() {
  return (
    <Wrapper>
      <LoadingSpinner />
    </Wrapper>
  );
}

export default ReviewLoading;
