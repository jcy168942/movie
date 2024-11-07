import React from 'react';
import styled from 'styled-components';
import GenreButton from './GenreButton';
import GenreSkeleton from './GenreSkeleton';

const FilterContainer = styled.div`
  max-width: 100%;
  margin: 0.8rem 0;
  padding: 0 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  & div {
    font-size: 0.7rem;
    color: gray;
    margin: 10px 5px;
    min-width: 4rem;
    text-align: center;
    border: 1px solid gray;
    padding: 5px 10px;
    border-radius: 20px;

    cursor: pointer;
    &:hover {
      background-color: lightgray;
      color: black;
    }
  }
`;

function Genre({
  genre,
  clickedGenre,
  setClickedGenre,
  setSearchData,
  setPage,
  isLoading,
}) {
  return (
    <>
      {isLoading ? (
        <FilterContainer>
          {new Array(5).fill(1).map((_, index) => (
            <GenreSkeleton key={index} />
          ))}
        </FilterContainer>
      ) : (
        <FilterContainer>
          {genre.map((item, index) => (
            <GenreButton
              clickedGenre={clickedGenre}
              setClickedGenre={setClickedGenre}
              key={index}
              item={item.key}
              setSearchData={setSearchData}
              setPage={setPage}
            />
          ))}
        </FilterContainer>
      )}
    </>
  );
}

export default Genre;
