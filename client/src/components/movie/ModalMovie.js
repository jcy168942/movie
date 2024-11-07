import { Box, Modal, Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import GenreChart from './GenreChart';
import NoResult from './NoResult';
import LoadingSpinner from '../common/LoadingSpinner';

const Image = styled.img`
  height: 90%;
  width: 100%;
  min-width: max-content;
  min-height: max-content;
  background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
    url(${props => props.url});
  border-radius: 10px;
  object-fit: contain;
  image-rendering: auto;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  & h1 {
    color: #6459e7;
  }
  & div {
    margin-left: 5px;
    color: gray;
  }
`;

const CustomBox = styled(Box)`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
  width: 50vw;
  height: 80vh;
  background-color: lightgray;
  padding: 1rem;
  border-radius: 15px;
  min-height: 500px;
  min-width: 400px;
  &:focus {
    outline: none;
  }
  & h1 {
    font-weight: 600;
    font-size: 1.2rem;
  }
  @media ${({ theme }) => theme.device.tablet} {
    height: 70vh;
  }
`;

const CustomGridContainer = styled(Grid)`
  width: 100%;
  height: 90%;
  margin-top: 0.8rem;
  overflow-y: auto;
  ::-webkit-scrollbar {
    display: none;
  }
`;

const CustomGridItem = styled(Grid)`
  height: 20vh;
  border-radius: 10px;

  & div {
    text-align: center;

    height: 100%;
    position: relative;
    & p {
      font-size: 0.9rem;
      border-radius: 10px;
      height: 90%;
      width: 100%;
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
      top: 0;
      color: white;
      background-color: black;
      opacity: 0;
      transition: all 0.4s ease-in-out;
      &:hover {
        opacity: 1;
        transition: all 0.4s ease-in-out;
      }
    }
  }
  @media ${({ theme }) => theme.device.tablet} {
    height: 15vh;
  }
`;

function ModalMovie({ handleClose, open, clickedData }) {
  const params = useParams();
  const [modalData, setModalData] = useState({
    genre: [],
    movie: [],
    isLoading: true,
  });
  useEffect(() => {
    if (open) {
      axios
        .post('/api/search/group', {
          group: clickedData.group,
          name: clickedData.name,
          movie_id: params.id,
        })
        .then(res => {
          const movies = res.data.movie.filter(
            movie => movie.movie_id !== params.id,
          );

          setModalData({
            genre: [...res.data.genre],
            movie: [...movies],
            isLoading: false,
          });
        });
    } else {
      setModalData({
        genre: [],
        movie: [],
        isLoading: true,
      });
    }
  }, [clickedData, open]);

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <CustomBox>
          <Title>
            <h1>{clickedData.name}</h1>
            <div>의 다른 영화</div>
          </Title>
          {!modalData.isLoading ? (
            <>
              {modalData.movie.length > 0 ? (
                <CustomGridContainer container spacing={1}>
                  {modalData.movie.map(item => (
                    <CustomGridItem key={item.movie_id} item xs={6} md={4}>
                      <Link to={`/movie/${item.movie_id}`}>
                        <div>
                          <Image
                            src={item.movie_poster}
                            url={item.movie_poster}
                          />
                          <p>{item.h_movie}</p>
                        </div>
                      </Link>
                    </CustomGridItem>
                  ))}
                </CustomGridContainer>
              ) : (
                <NoResult />
              )}
              {modalData.movie.length > 0 ? (
                <GenreChart genre={modalData.genre} />
              ) : null}
            </>
          ) : (
            <LoadingSpinner />
          )}
        </CustomBox>
      </Modal>
    </>
  );
}

export default ModalMovie;
