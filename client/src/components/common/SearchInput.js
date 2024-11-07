import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { TextField } from '@mui/material';
import axios from 'axios';
import AutoItem from './AutoItem';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60%;
`;

const HomeLink = styled.div`
  display: flex;
  width: 6vw;
  align-items: center;
  min-width: 60px;
  min-height: 20px;
  margin-right: 10px;
  & img {
    width: 100%;
    filter: invert();
  }
`;

const Input = styled(TextField)`
  width: 100%;
  & label {
    color: lightgray;
  }
  & div {
    border-radius: 15px;
  }
`;

const SearchForm = styled.form`
  width: 100%;
  position: relative;
`;

const LayoutSearch = styled.form`
  border-radius: 10px;
  border: 1px solid lightgray;
  padding: 5px;
`;

const LayoutSearchInput = styled.input`
  color: white;
  background-color: transparent;
  border: none;
  font-size: 0.8rem;
  &:focus {
    outline: none;
  }
`;

const DropDownList = styled.ul`
  position: absolute;
  background-color: white;
  z-index: 4;
  right: ${props => (props.isNavSearch ? '15px' : '0')};
  margin: ${props => (props.isNavSearch ? '15px 0' : '5px 0')};
  min-width: ${props => (props.isNavSearch ? '400px' : null)};
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid lightgray;
  box-shadow: 2px 2px 2px solid lightgray;
  border-radius: 10px;
  width: ${props => (props.isNavSearch ? '30%' : '100%')};
`;

const DropDownItem = styled.li`
  width: 100%;
  padding: 13px 10px;
  cursor: pointer;

  &:first-child {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }
  &:last-child {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }
  &:hover {
    background-color: lightgray;
  }
  background-color: ${props => props.selected && 'lightgray'};
`;

function SearchInput({ isNavSearch, isMain }) {
  const autoRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [autoContent, setAutoContent] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [searchContent, setSearchContent] = useState('');

  const navigation = useNavigate();
  const onChange = event => {
    const searchInput = [];
    searchInput.push(event.target.value);
    setSearchContent(event.target.value);
    axios
      .get(`/api/auto?query=${event.target.value}&size=${6}`)
      .then(res => {
        searchInput.push(...res.data);
        setAutoContent([...searchInput]);
      })
      .catch(err => console.error(err));
    setCursor(0);
    setIsOpen(true);
    setAutoContent([]);
  };

  const onClickAutoItem = useCallback((item, index) => {
    setCursor(index);
    const content = item.movie_id ? item.movie_id : item;
    setContent(content);
  }, []);

  const ArrowDown = 'ArrowDown';
  const ArrowUp = 'ArrowUp';
  const Escape = 'Escape';
  const Enter = 'Enter';
  const handleKeyArrow = e => {
    if (autoContent.length > 0) {
      switch (e.key) {
        case ArrowDown:
          setCursor(cursor + 1);
          if (autoRef.current?.childElementCount === cursor + 1) setCursor(0);
          break;
        case ArrowUp:
          setCursor(cursor - 1);
          if (cursor <= 0) {
            setCursor(autoContent.length - 1);
          }
          break;
        case Escape:
          setIsOpen(false);

          break;
        case Enter:
          const enterContent = autoContent[cursor].movie_id
            ? autoContent[cursor].movie_id
            : autoContent[cursor];
          setContent(enterContent);

          break;
        default:
          break;
      }
    }
  };

  const onSubmit = e => {
    e.preventDefault();
    setSearchContent('');
  };

  const onClickInput = useCallback(e => {
    e.stopPropagation();
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (content) {
      if (content === searchContent) {
        navigation(
          `/search?query=${content}&page=${1}&nationFlag=${null}&sort=${'opening_date'}&genreFilter=${null}&showTimeFilter=${'0,180'}&openDateFilter=${''}&size=${5}`,
        );
      } else {
        navigation(`/movie/${content}`);
        setSearchContent('');
        setContent('');
      }
      setAutoContent([]);
      setCursor(0);
    }
  }, [content, navigation]);

  useEffect(() => {
    const handleCloseSearch = e => {
      if (autoRef.current && !autoRef.current.contains(e.target)) {
        setIsOpen(false);
        setCursor(0);
      }
    };

    window.addEventListener('click', handleCloseSearch);
    return () => {
      window.addEventListener('click', handleCloseSearch);
    };
  }, [autoRef, isOpen]);

  return (
    <>
      {isMain ? null : (
        <>
          {isNavSearch ? (
            <LayoutSearch onSubmit={onSubmit} autoComplete="off">
              <LayoutSearchInput
                placeholder="Search"
                onChange={onChange}
                onKeyDown={handleKeyArrow}
                value={
                  cursor !== 0 ? autoContent[cursor].h_movie : searchContent
                }
              />
              {isOpen && autoContent.length > 1 ? (
                <DropDownList isNavSearch={true} ref={autoRef}>
                  {autoContent.map((item, index) => (
                    <DropDownItem
                      key={index}
                      selected={cursor === index}
                      onClick={() => onClickAutoItem(item, index)}
                    >
                      <AutoItem
                        autoItem={item}
                        index={index}
                        searchContent={searchContent}
                      />
                    </DropDownItem>
                  ))}
                </DropDownList>
              ) : null}
            </LayoutSearch>
          ) : (
            <>
              <HomeLink>
                <img src={'/Moviedream.png'} alt="logo" />
              </HomeLink>
              <Wrapper>
                <SearchForm onSubmit={onSubmit} autoComplete="off">
                  <Input
                    id="outlined-basic"
                    label="영화 검색하기"
                    onChange={onChange}
                    onKeyDown={handleKeyArrow}
                    onClick={onClickInput}
                    value={
                      cursor !== 0 ? autoContent[cursor].h_movie : searchContent
                    }
                  />
                  {isOpen && autoContent.length > 1 ? (
                    <DropDownList ref={autoRef}>
                      {autoContent.map((item, index) => (
                        <DropDownItem
                          key={index}
                          selected={cursor === index}
                          onClick={() => onClickAutoItem(item, index)}
                        >
                          <AutoItem
                            autoItem={item}
                            index={index}
                            searchContent={searchContent}
                          />
                        </DropDownItem>
                      ))}
                    </DropDownList>
                  ) : null}
                </SearchForm>
              </Wrapper>
            </>
          )}
        </>
      )}
    </>
  );
}

export default SearchInput;
