import styled from 'styled-components';
import InfoSkeleton from './InfoSkeleton';
import InfoTable from './InfoTable';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  min-height: 290px;
  max-height: 290px;
  border-radius: 10px;
  border: 1px solid lightgray;
  box-shadow: 2px 2px 2px lightgray;
  margin-left: 1rem;
  background-color: white;
  @media ${({ theme }) => theme.device.smallTablet} {
    width: 100%;
    margin: 0;
    margin-top: 1rem;
  }
`;

function InfoBox({ movie, isLoading }) {
  return (
    <Wrapper>
      {!isLoading ? <InfoTable movie={movie} /> : <InfoSkeleton />}
    </Wrapper>
  );
}

export default InfoBox;
