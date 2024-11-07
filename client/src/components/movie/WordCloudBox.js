import { Container } from '@mui/material';
import styled from 'styled-components';
import WordCloudCanvas from './WordCloudCanvas';

const Wrapper = styled(Container)`
  width: 100%;
  min-height: 100px;
  background-color: white;
  margin-top: 2rem;
  @media ${({ theme }) => theme.device.smallTablet} {
  }
`;
function WordCloudBox({ wordCloud }) {
  return (
    <Wrapper>
      <WordCloudCanvas wordCloud={wordCloud} />
    </Wrapper>
  );
}

export default WordCloudBox;
