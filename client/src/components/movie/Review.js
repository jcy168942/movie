import React, { useEffect, useState } from 'react';
import ClassifyButton from './ClassifyButton';
import { Container } from '@mui/material';
import ReviewBox from './ReviewBox';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function Review() {
  const params = useParams();
  const [reviewData, setReviewData] = useState({
    positive: [],
    negative: [],
    isLoading: true,
  });
  const [isNegative, setIsNegative] = useState(0);
  const [isMobile, setIsMobile] = useState(0);

  useEffect(() => {
    axios
      .get(`/api/search/review?movie_id=${params.id}&sentimentFlag=true`)
      .then(res =>
        setReviewData({
          positive: [...res.data.review.data.positive],
          negative: [...res.data.review.data.negative],
          isLoading: false,
        }),
      )
      .catch(err => console.error(err));
  }, [params.id]);

  const handleResize = () => {
    if (window.innerWidth > '900') {
      setIsMobile(1);
    } else {
      setIsMobile(0);
    }
  };

  useEffect(() => {
    window.innerWidth > '900' ? setIsMobile(1) : setIsMobile(0);
    window.addEventListener('resize', handleResize);
    return () => {
      window.addEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Container>
      <ClassifyButton isNegative={isNegative} setIsNegative={setIsNegative} />
      <ReviewBox
        positive={reviewData.positive}
        negative={reviewData.negative}
        isLoading={reviewData.isLoading}
        isNegative={isNegative}
        isMobile={isMobile}
      />
    </Container>
  );
}

export default Review;
