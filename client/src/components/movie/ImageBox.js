import styled from 'styled-components';
import PosterImage from './PosterImage';

const Wrapper = styled.div`
  display: flex;
  border-radius: 10px;
  justify-content: center;
  min-height: 290px;
  min-width: 200px;
  align-items: center;

  background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
    url(${props => props.url});
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;

  @media ${({ theme }) => theme.device.smallTablet} {
    width: 100%;
    height: 30vh;
  }
`;

function ImageBox({ url, isLoading }) {
  return (
    <Wrapper url={url}>
      {!isLoading ? <PosterImage poster={url} /> : null}
    </Wrapper>
  );
}

export default ImageBox;
