import { Container, Skeleton } from '@mui/material';
import React from 'react';
import styled from 'styled-components';

const CustomContainer = styled(Container)`
  display: flex;
  margin: 1rem 0;
  height: 20vh;
  align-items: center;
`;

const CustomRoundedSkeleton = styled(Skeleton)`
  width: 100px;
  height: 100%;
  margin-right: 10px;
  border-radius: 10px;
  background-color: lightgray;
`;

const MiddleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  height: 60%;
`;

const CustomSkeleton = styled(Skeleton)`
  width: 50%;
  height: 20%;
  background-color: lightgray;
  margin-bottom: 5px;
  &:first-child {
    width: 30%;
  }
  &:last-child {
    width: 70%;
  }
`;

function SearchSkeleton() {
  return (
    <CustomContainer>
      <CustomRoundedSkeleton />
      <MiddleContainer>
        <CustomSkeleton />
        <CustomSkeleton />
        <CustomSkeleton />
      </MiddleContainer>
    </CustomContainer>
  );
}

export default SearchSkeleton;
