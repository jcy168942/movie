import { Skeleton } from '@mui/material';
import React from 'react';
import styled from 'styled-components';

const CustomSkeleton = styled(Skeleton)`
  background-color: lightgray;
  border: 1px solid lightgray;
  border-radius: 20px;
  margin: 10px 5px;
  width: 63px;
  height: 30px;
  padding: 5px 2px;
`;

function GenreSkeleton() {
  return <CustomSkeleton />;
}

export default GenreSkeleton;
