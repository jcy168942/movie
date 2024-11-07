import styled from 'styled-components';
import ReviewTable from './ReviewTable';
import ReviewLoading from './ReviewLoading';

const Wrapper = styled.div`
  min-height: 290px;
  border-radius: 10px;
  border: 1px solid lightgray;
  box-shadow: 2px 2px 2px lightgray;
  background-color: white;
  padding: 10px;
  margin-top: 1rem;
`;

function ReviewBox({ positive, negative, isLoading, isNegative, isMobile }) {
  return (
    <Wrapper>
      {isLoading ? (
        <ReviewLoading />
      ) : (
        <ReviewTable
          positive={positive}
          negative={negative}
          isNegative={isNegative}
          isMobile={isMobile}
        />
      )}
    </Wrapper>
  );
}

export default ReviewBox;
