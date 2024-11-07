import React from 'react';
import styled from 'styled-components';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Wrapper = styled.div`
  width: 100%;
  height: 25vh;
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export function GenreChart({ genre }) {
  let labels = [];
  let docCount = [];

  genre.forEach(gen => {
    labels.push(gen.key);
    docCount.push(gen.doc_count);
  });

  const options = {
    responsive: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    maintainAspectRatio: false,
  };
  const data = {
    labels: [...labels],
    datasets: [
      {
        label: '# of Votes',
        data: [...docCount],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(104, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(104, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  return (
    <Wrapper>
      <Doughnut data={data} options={options} />
    </Wrapper>
  );
}

export default GenreChart;
