import React from 'react';
import styled from 'styled-components';
import Layout from '../components/common/Layout';
import SearchInput from '../components/common/SearchInput';
import { useState, useEffect } from 'react';
import axios from 'axios';
import randomNum from '../hooks/randomNum';
import GenreCarousel from '../components/main/GenreCarousel';

const Wrapper = styled.div`
  display: flex;
  margin-top: 10rem;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
`;

function Home() {
  const [movieDatas, setMovieDatas] = useState({
    movieData: [],
    isLoading: true,
  });

  useEffect(() => {
    const nums = randomNum();

    axios.get('api/search/genre').then(res => {
      const movies = [];
      nums.map(num => movies.push(res.data[num]));
      setMovieDatas({
        movieData: [...movies],
        isLoading: false,
      });
    });
  }, []);

  return (
    <>
      <Layout isNavSearch={true} isMain={true}>
        <Wrapper>
          <Header>
            <SearchInput />
          </Header>

          <GenreCarousel
            movies={movieDatas.movieData}
            isLoading={movieDatas.isLoading}
          />
        </Wrapper>
      </Layout>
    </>
  );
}

export default Home;
