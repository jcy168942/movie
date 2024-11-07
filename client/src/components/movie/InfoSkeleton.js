import { Container, Skeleton } from '@mui/material';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled(Container)`
  margin: 1rem 0;
`;

const CustomTitleSkeleton = styled(Skeleton)`
  width: 20%;
  max-width: 100px;
  height: 20px;
  background-color: lightgray;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  & span:last-child {
    max-width: 500px;
  }
`;

const CustomInfoSkeleton = styled(Skeleton)`
  width: 100%;
  max-width: 300px;
  height: 20px;
  background-color: lightgray;
`;

const CustomMainSkeleton = styled(Skeleton)`
  width: 100%;
  background-color: lightgray;
  height: 220px;
`;

function InfoSkeleton() {
  return (
    <Wrapper>
      <CustomTitleSkeleton />
      <Info>
        <CustomInfoSkeleton />
        <CustomInfoSkeleton />
      </Info>
      <CustomMainSkeleton />
    </Wrapper>
  );
}

export default InfoSkeleton;
