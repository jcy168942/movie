import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import RadioControlItem from './RadioControlItem';
import moment from 'moment';
import { Grid } from '@mui/material';

const Wrapper = styled.div`
  border: 1px solid lightgray;
  box-shadow: 2px 2px 5px lightgray;
  border-radius: 10px;
  min-width: 200px;
  min-height: 80px;
  width: 100%;
  font-size: 0.9rem;
  padding: 1rem;
  margin: 1rem 0;
  & h1 {
    font-size: 1rem;
    font-weight: 600;
    color: gray;
    margin-bottom: 1rem;
  }
  @media ${({ theme }) => theme.device.tablet} {
    height: 100%;
    width: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem 1.5rem;
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 50%;
    margin-bottom: 1rem;
    padding: 1rem 1.5rem;
  }
`;

const Header = styled.h1`
  @media ${({ theme }) => theme.device.tablet} {
    width: 100%;
    margin-bottom: 1rem;
  }

  @media ${({ theme }) => theme.device.mobile} {
    display: none;
  }
`;

function MovieDateFilter({ setSearchData, setPage }) {
  const [selected, setSelected] = useState('0');
  const [date, setDate] = useState('');
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');
  const sortType = searchParams.get('sort');
  const nationFlag = searchParams.get('nationFlag');
  const showTimeFilter = searchParams.get('showTimeFilter');
  const genreFilter = searchParams.get('genreFilter');
  const navigation = useNavigate();
  const handleChange = useCallback(
    value => {
      if (value === '0') {
        setSelected(value);
        setDate('');
        setSearchData({
          movieData: {
            movie: [],
            genre: [],
          },
          isLoading: true,
          hasMoreMovies: true,
        });
        setPage(1);
      } else {
        const today = moment().format('YYYY.MM.DD');
        const calculatedDate = moment()
          .subtract(value, 'M')
          .format('YYYY.MM.DD');
        setSelected(value);
        setDate(`${calculatedDate},${today}`);
        setSearchData({
          movieData: {
            movie: [],
            genre: [],
          },
          isLoading: true,
          hasMoreMovies: true,
        });
        setPage(1);
      }
    },
    [setSearchData, setPage],
  );

  useEffect(() => {
    navigation(
      `/search?query=${query}&nationFlag=${nationFlag}&sort=${sortType}&genreFilter=${genreFilter}&showTimeFilter=${showTimeFilter}&openDateFilter=${date}&size=${5}`,
    );
  }, [
    navigation,
    query,
    nationFlag,
    sortType,
    genreFilter,
    showTimeFilter,
    date,
  ]);

  return (
    <Wrapper>
      <Header>개봉 날짜</Header>

      <Grid container>
        <Grid item xl={6} md={3} xs={6}>
          <RadioControlItem
            label="전체 영화"
            id="0"
            value="0"
            selected={selected}
            handleChange={handleChange}
          />
        </Grid>
        <Grid item xl={6} md={3} xs={6}>
          <RadioControlItem
            label="1개월 이내"
            id="1"
            value="1"
            selected={selected}
            handleChange={handleChange}
          />
        </Grid>

        <Grid item xl={6} md={3} xs={6}>
          <RadioControlItem
            label="3개월 이내"
            id="2"
            value="3"
            selected={selected}
            handleChange={handleChange}
          />
        </Grid>
        <Grid item xl={6} md={3} xs={6}>
          <RadioControlItem
            label="5개월 이내"
            id="3"
            value="5"
            selected={selected}
            handleChange={handleChange}
          />
        </Grid>
      </Grid>
    </Wrapper>
  );
}

export default MovieDateFilter;
