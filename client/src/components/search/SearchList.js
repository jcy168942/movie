import { Container, Grid } from '@mui/material';
import React from 'react';
import styled from 'styled-components';
import SearchItem from './SearchItem';
import SearchSkeleton from './SearchSkeleton';

const Wrapper = styled(Container)`
  display: flex;
  justify-content: center;
  margin: 2rem 0;
`;

const CustomGridContainer = styled(Grid)`
  width: 100%;
`;

function SearchList({ movies, isLoading }) {
  return (
    <Wrapper>
      {isLoading ? (
        <CustomGridContainer container spacing={{ xs: 0, sm: 2 }}>
          {new Array(5).fill(1).map((_, index) => (
            <SearchSkeleton key={index} />
          ))}
        </CustomGridContainer>
      ) : (
        <CustomGridContainer container spacing={{ xs: 0, sm: 2 }}>
          {movies.map(movie => (
            <SearchItem key={movie.movie_id} movie={movie} />
          ))}
        </CustomGridContainer>
      )}
    </Wrapper>
  );
}

export default SearchList;
