import { Container } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../components/common/Layout';
import Carousel from '../components/common/Carousel';
import FloatingButton from '../components/search/FloatingButton';
import FloatingGenre from '../components/search/FloatingGenre';
import Genre from '../components/search/Genre';
import SearchList from '../components/search/SearchList';
import SortBox from '../components/search/SortBox';
import axios from 'axios';
import ShowTime from '../components/search/ShowTime';
import MovieDateFilter from '../components/search/MovieDateFilter';
import { useInView } from 'react-intersection-observer';

const Wrapper = styled(Container)`
  display: flex;
  margin: 5rem auto 0 auto;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

const SearchHead = styled.div`
  display: flex;
  & h1 {
    margin-right: 10px;
    font-size: 2rem;
    font-weight: 700;
    color: #6459e7;
  }
  & p {
    color: gray;
    display: flex;
    align-items: center;
    font-weight: 400;
  }
`;

const FilterContainer = styled(Container)`
  position: fixed;
  z-index: 1000;
  left: 3vw;
  top: 15%;
  width: 13vw;

  @media ${({ theme }) => theme.device.tablet} {
    display: flex;
    justify-content: center;
    height: 15vh;
    min-height: 100px;
    width: 100%;
    align-items: center;
    position: static;
  }

  @media ${({ theme }) => theme.device.mobile} {
    display: flex;
    height: 20vh;
    min-height: 200px;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    align-items: center;
    position: static;
    margin-top: 20px;
  }
`;

const Observer = styled.div`
  height: 10px;
`;

function Search() {
  const [clickedGenre, setClickedGenre] = useState([]);
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [ref, inView] = useInView();
  const [searchData, setSearchData] = useState({
    movieData: {
      movie: [],
      genre: [],
    },
    isLoading: true,
    hasMoreMovies: true,
  });
  const query = searchParams.get('query');
  const sortType = searchParams.get('sort');
  const nationFlag = searchParams.get('nationFlag');
  const genreFilter = searchParams.get('genreFilter');
  const showTimeFilter = searchParams.get('showTimeFilter');
  const openDateFilter = searchParams.get('openDateFilter');

  useEffect(() => {
    axios
      .get(
        `/api/search?query=${query}&page=${page}&nationFlag=${nationFlag}&sort=${sortType}&genreFilter=${genreFilter}&showTimeFilter=${showTimeFilter}&openDateFilter=${openDateFilter}&size=${5}`,
      )
      .then(res => {
        let movies = [...searchData.movieData.movie];
        movies = movies.concat(res.data.movies);

        setSearchData({
          movieData: {
            movie: [...movies],
            genre: [...res.data.genre],
          },
          isLoading: false,
          hasMoreMovies: res.data.movies.length === 5,
        });
      })
      .catch(err => console.error(err));
    if (genreFilter) {
      setClickedGenre(genreFilter.split(',').filter(genre => genre !== 'null'));
    }
  }, [page, sortType, nationFlag, genreFilter, showTimeFilter, openDateFilter]);

  useEffect(() => {
    if (inView && !searchData.isLoading) {
      setPage(prev => prev + 1);
    }
  }, [inView, searchData.isLoading]);

  useEffect(() => {
    setPage(1);
    setSearchData({
      movieData: {
        movie: [],
        genre: [],
      },
      isLoading: true,
      hasMoreMovies: true,
    });

    axios
      .get(
        `/api/search?query=${query}&page=${page}&nationFlag=${nationFlag}&sort=${sortType}&genreFilter=${genreFilter}&showTimeFilter=${showTimeFilter}&openDateFilter=${openDateFilter}&size=${5}`,
      )
      .then(res => {
        localStorage.setItem(
          'openMovie',
          JSON.stringify([...res.data.top_open_movie]),
        );

        localStorage.setItem(
          'scoreMovie',
          JSON.stringify([...res.data.top_score_movie]),
        );

        setSearchData({
          movieData: {
            movie: [...res.data.movies],
            genre: [...res.data.genre],
          },
          isLoading: false,
          hasMoreMovies: res.data.movies.length === 5,
        });
      })
      .catch(err => console.error(err));
  }, [query]);

  return (
    <>
      <Layout isNavSearch={true} isMain={false} setSearchData={setSearchData}>
        <Wrapper>
          <Header>
            <SearchHead>
              <h1>"{query}"</h1>
              <p>검색결과</p>
            </SearchHead>
          </Header>

          <Genre
            genre={searchData.movieData.genre}
            clickedGenre={clickedGenre}
            setClickedGenre={setClickedGenre}
            setSearchData={setSearchData}
            setPage={setPage}
            isLoading={searchData.isLoading}
          />

          <FilterContainer>
            <ShowTime setSearchData={setSearchData} setPage={setPage} />
            <MovieDateFilter setSearchData={setSearchData} setPage={setPage} />
            <FloatingGenre
              genre={searchData.movieData.genre}
              clickedGenre={clickedGenre}
              setClickedGenre={setClickedGenre}
              setSearchData={setSearchData}
              setPage={setPage}
            />
          </FilterContainer>

          {JSON.parse(localStorage.getItem('openMovie')) && (
            <Carousel
              title="New Movies!"
              movies={JSON.parse(localStorage.getItem('openMovie'))}
            />
          )}
          {JSON.parse(localStorage.getItem('scoreMovie')) && (
            <Carousel
              title="Hot Movies!"
              movies={JSON.parse(localStorage.getItem('scoreMovie'))}
            />
          )}
          <SortBox setSearchData={setSearchData} setPage={setPage} />

          <SearchList
            movies={searchData.movieData.movie}
            isLoading={searchData.isLoading}
          />

          <Observer ref={searchData.hasMoreMovies ? ref : undefined} />
          <FloatingButton />
        </Wrapper>
      </Layout>
    </>
  );
}

export default Search;
