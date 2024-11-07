import React from 'react';
import styled from 'styled-components';

const CustomArror = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: grey;
  opacity: 0.1;
  z-index: 50;
  color: black;
  height: 98.5%;
  width: 3vw;
  cursor: pointer;
  right: 0;
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

function NextArrow(props) {
  const { onClick } = props;
  return (
    <CustomArror onClick={onClick}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
        <path d="M342.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L274.7 256 105.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
      </svg>
    </CustomArror>
  );
}

export default NextArrow;
