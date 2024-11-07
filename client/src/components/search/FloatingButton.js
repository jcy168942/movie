import { Box, Fab } from '@mui/material';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const CustomBox = styled(Box)`
  position: fixed;
  z-index: 1000;
  right: 4%;
  bottom: 6%;
`;

const CustomFab = styled(Fab)`
  background-color: #6459e7;
  opacity: ${props => (props.scroll ? '1' : '0')};
  visibility: ${props => (props.scroll ? '' : 'hidden')};
  transition: ${props =>
    props.scroll
      ? 'all 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
      : 'all 195ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'};

  & svg {
    width: 20px;
    height: 20px;
    fill: white;
  }
  &:hover {
    background-color: #4869d4;
  }
`;

function FloatingButton() {
  const [scroll, setScroll] = useState(false);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleScroll = () => {
    if (window.scrollY >= 200) {
      setScroll(true);
    } else {
      setScroll(false);
    }
  };

  const moveTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <CustomBox>
      <CustomFab scroll={scroll} aria-label="top" onClick={moveTop}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
          <path d="M214.6 57.4L192 34.7 169.4 57.4l-144 144L2.7 224 48 269.2l22.6-22.6L160 157.2V448v32h64V448 157.2l89.4 89.4L336 269.2 381.3 224l-22.6-22.6-144-144z" />
        </svg>
      </CustomFab>
    </CustomBox>
  );
}

export default FloatingButton;
