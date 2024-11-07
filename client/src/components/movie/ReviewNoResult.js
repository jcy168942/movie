import React from 'react';
import styled from 'styled-components';
import NoResult from './NoResult';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 30vh;
  padding: 15px;
  padding-bottom: 40px;

  & div {
    min-width: 200px;
    min-height: 200px;
  }
`;

function ReviewNoResult() {
  return (
    <Wrapper>
      <NoResult />
    </Wrapper>
  );
}

export default ReviewNoResult;
