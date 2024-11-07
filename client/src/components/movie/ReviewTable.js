import styled from 'styled-components';
import MultiReview from './MultiReview';
import ReviewItem from './ReviewItem';
import ReviewNoResult from './ReviewNoResult';

const Wrapper = styled.div`
  width: 100%;
  max-height: 290px;
`;

const Container = styled.div`
  height: 290px;
  overflow-y: auto;
  ::-webkit-scrollbar {
    display: none;
  }
`;

function ReviewTable({ negative, positive, isNegative, isMobile }) {
  return (
    <Wrapper>
      {isMobile === 1 ? (
        <MultiReview positive={positive} negative={negative} />
      ) : (
        <>
          {isNegative === 0 ? (
            <>
              {positive.length > 0 ? (
                <Container>
                  {positive.map((review, index) => (
                    <ReviewItem key={index} review={review} />
                  ))}
                </Container>
              ) : (
                <ReviewNoResult />
              )}
            </>
          ) : null}

          {isNegative === 1 ? (
            <>
              {negative.length > 0 ? (
                <Container>
                  {negative.map((review, index) => (
                    <ReviewItem key={index} review={review} />
                  ))}
                </Container>
              ) : (
                <ReviewNoResult />
              )}
            </>
          ) : null}
        </>
      )}
    </Wrapper>
  );
}

export default ReviewTable;
