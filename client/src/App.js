import Router from './router';
import axios from 'axios';
import React from 'react';
import GlobalFont from './fonts/fonts';
import { ThemeProvider } from 'styled-components';
import theme from './styles/theme';

axios.defaults.baseURL = process.env.REACT_APP_SERVER_URL;

function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <GlobalFont />
        <Router />
      </ThemeProvider>
    </>
  );
}

export default App;
