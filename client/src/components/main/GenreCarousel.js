import React from 'react';
import styled from 'styled-components';
import Carousel from '../common/Carousel';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  margin: 4rem 0;
  width: 70%;
  z-index: 3;
`;

function GenreCarousel({ movies, isLoading }) {
  return (
    <Wrapper>
      {!isLoading && (
        <>
          {movies.map((movie, index) => (
            <Carousel key={index} title={movie.genre} movies={movie.movies} />
          ))}
        </>
      )}
    </Wrapper>
  );
}

export default GenreCarousel;
