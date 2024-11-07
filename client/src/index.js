import { StyledEngineProvider } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import GlobalStyle from './styles/globalStyle';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <StyledEngineProvider injectFirst>
      <GlobalStyle />
      <App />
    </StyledEngineProvider>
  </>,
);
