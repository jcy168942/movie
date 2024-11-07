import {
  Avatar,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const CustomList = styled(List)`
  margin: 1rem 0;
`;

const CustomAvatarItem = styled(ListItemAvatar)`
  margin: 0;
  margin-right: 10px;
  & div {
    width: 100%;
    height: 12vh;
    min-height: 100px;
  }
`;

const CustomListItem = styled(ListItem)`
  padding: 10px 0;
  &:hover {
    background-color: #cdcfd4;
  }
`;

const CustomAvatar = styled(Avatar)`
  & img {
    max-width: 80px;
  }
`;

const CustomDivider = styled(Divider)`
  border-color: lightgray;
`;

const ListGenre = styled.span`
  font-size: 0.8rem;
  display: flex;
  justify-content: flex-start;
  & span {
    margin: 0 2px;
    color: gray;
  }
`;

function SearchItem({ movie }) {
  return (
    <Grid item xl={12} md={6} xs={12}>
      <CustomList>
        <Link to={`/movie/${movie.movie_id}`}>
          <CustomListItem alignItems="flex-start">
            <CustomAvatarItem>
              <CustomAvatar
                src={`${movie.movie_poster}`}
                variant="rounded"
                alt="movie_poster"
              />
            </CustomAvatarItem>
            <ListItemText
              primary={movie.h_movie}
              secondary={
                <>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.primary"
                  ></Typography>
                  <ListGenre>
                    장르 -
                    {movie.genre.map((genre, index) => (
                      <span key={index}>{genre}</span>
                    ))}
                  </ListGenre>
                </>
              }
            />
          </CustomListItem>
        </Link>

        <CustomDivider component="div" />
      </CustomList>
    </Grid>
  );
}

export default SearchItem;
