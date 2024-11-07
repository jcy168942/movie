import { AppBar, Slide, Toolbar, useScrollTrigger } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import SearchInput from './SearchInput';

const CustomAppBar = styled(AppBar)`
  background-color: #6459e7;
  & div {
    color: white;
    letter-spacing: 2px;
  }
`;

const CustomToolbar = styled(Toolbar)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HomeLink = styled.div`
  display: flex;
  width: 6vw;
  min-width: 50px;
  min-height: 20px;
  align-items: center;

  & img {
    width: 100%;
    height: 100%;
    min-width: 50px;
    min-height: 20px;
    &:hover {
      filter: invert(20%);
    }
  }
`;

function Layout(props) {
  const { window, isNavSearch, isMain, children } = props;

  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  });

  return (
    <>
      <Slide appear={false} direction="down" in={!trigger}>
        <CustomAppBar>
          <CustomToolbar>
            <Link to={'/'}>
              <HomeLink>
                <img src={'/Moviedream.png'} alt="logo" />
              </HomeLink>
            </Link>

            <SearchInput isNavSearch={isNavSearch} isMain={isMain} />
          </CustomToolbar>
        </CustomAppBar>
      </Slide>
      {children}
    </>
  );
}

export default Layout;
