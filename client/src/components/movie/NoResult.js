import React from 'react';
import Lottie from 'react-lottie-player';
import NoResults from '../../assets/NoResult.json';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  & div {
    width: 25vw;
    min-width: 400px;
  }
  & span {
    font-weight: 600;
    color: gray;
    font-size: 1.5rem;
  }
`;

function NoResult() {
  return (
    <Wrapper>
      <Lottie loop animationData={NoResults} play />
      <span>No Result!</span>
    </Wrapper>
  );
}

export default NoResult;
