import styled from 'styled-components';

const Image = styled.img`
  object-fit: cover;
  border-radius: 10px;
  image-rendering: auto;
  max-width: 173px;
  @media ${({ theme }) => theme.device.smallTablet} {
    object-fit: cover;
    height: 90%;
    max-width: 173px;
  }
`;

const NoPoster = styled.img`
  height: 20vh;
  max-width: 173px;
  min-height: 250px;
  @media ${({ theme }) => theme.device.smallTablet} {
    width: 100%;
  }
`;

function PosterImage({ poster }) {
  return (
    <>
      {poster ? (
        <Image src={poster} alt="poster" />
      ) : (
        <NoPoster src="/Noimage.jpeg" alt="poster" />
      )}
    </>
  );
}

export default PosterImage;
