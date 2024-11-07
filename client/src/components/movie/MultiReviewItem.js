import React from 'react';
import styled from 'styled-components';
import ReviewItem from './ReviewItem';

const Wrapper = styled.div`
  width: 50%;
  margin: 0 5px;
  & span {
    font-weight: 600;
    color: gray;
  }
`;

const ReviewContainer = styled.div`
  height: 25vh;
  min-height: 270px;
  overflow-y: auto;
  ::-webkit-scrollbar {
    display: none;
  }
`;

function MultiReviewItem({ reviewData, title }) {
  return (
    <Wrapper>
      <span>{title}</span>
      <ReviewContainer>
        {reviewData.map((review, index) => (
          <ReviewItem key={index} review={review} />
        ))}
      </ReviewContainer>
    </Wrapper>
  );
}
export default MultiReviewItem;
