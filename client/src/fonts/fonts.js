import { createGlobalStyle } from 'styled-components';
import SUITRegularWoff from './SUIT-Regular.woff2';

export default createGlobalStyle`		      
  @font-face {
    font-family: 'SUIT';	
    src: local('SUIT'),    
    url(${SUITRegularWoff}) format('woff');
    font-weight: 300; 		
    font-style: normal;
  }
    `;
