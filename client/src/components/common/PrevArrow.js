import React from 'react';
import styled from 'styled-components';

const CustomArror = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: black;
  opacity: 0.1;
  z-index: 30;
  color: grey;
  height: 98.5%;
  width: 3vw;
  cursor: pointer;
  left: 0;
  top: 0;
  &:hover {
    opacity: 0.4;
  }
  & svg {
    position: absolute;
    left: 0;
    z-index: 50;
    fill: white;
    width: 100%;
    height: 15%;
  }
`;

function PrevArrow(props) {
  const { onClick } = props;
  return (
    <CustomArror onClick={onClick}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
        <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 278.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
      </svg>
    </CustomArror>
  );
}

export default PrevArrow;
