import { Button, ButtonGroup } from '@mui/material';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: white;
  @media ${({ theme }) => theme.device.smallTablet} {
    width: 100%;
    margin-top: 1rem;
  }
  & h1 {
    font-size: 1.2rem;
    font-weight: 600;
  }
`;

const CustomButtonGroup = styled(ButtonGroup)`
  display: none;
  @media ${({ theme }) => theme.device.smallTablet} {
    display: flex;
  }
`;

const CustomButton = styled(Button)`
  color: ${props =>
    parseInt(props.isnegative) === parseInt(props.value) ? '#6459e7' : 'gray'};
  border-color: gray;
  font-size: 0.6rem;
  font-family: SUIT;
  font-weight: 600;
  &:hover {
    color: #6459e7;
    border-color: #6459e7;
  }
`;

function ClassifyButton({ isNegative, setIsNegative }) {
  const onClick = e => {
    setIsNegative(parseInt(e.target.value));
  };

  return (
    <Wrapper>
      <h1>리뷰 모아보기</h1>

      <CustomButtonGroup>
        <CustomButton
          isnegative={isNegative}
          onClick={onClick}
          value={0}
          key="positive"
        >
          Positive
        </CustomButton>
        <CustomButton
          isnegative={isNegative}
          onClick={onClick}
          value={1}
          key="negative"
        >
          Negative
        </CustomButton>
      </CustomButtonGroup>
    </Wrapper>
  );
}

export default ClassifyButton;
