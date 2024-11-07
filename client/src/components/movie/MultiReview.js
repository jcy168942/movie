import { Divider } from '@mui/material';
import React from 'react';
import styled from 'styled-components';
import MultiReviewItem from './MultiReviewItem';
import ReviewNoResult from './ReviewNoResult';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const CustomDivider = styled(Divider)`
  border-color: rgba(0, 0, 0, 0.15);
`;

function MultiReview({ negative, positive }) {
  return (
    <Wrapper>
      {positive.length > 0 || negative.length > 0 ? (
        <>
          <MultiReviewItem reviewData={positive} title="Positive" />
          <CustomDivider orientation="vertical" flexItem />
          <MultiReviewItem reviewData={negative} title="Negative" />
        </>
      ) : (
        <ReviewNoResult />
      )}
    </Wrapper>
  );
}

export default MultiReview;
