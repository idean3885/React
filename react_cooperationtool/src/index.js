import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

const rootElement = document.getElementById('root');
ReactDOM.render(
  /**
   * StricMode : 오류 검출을 위한 일종의 디버그 모드
   *             이 모드일 경우, 렌더링 과정에서 이전 렌더링과 값을 비교하는데, 이 때문인지 render() 가 두번 호출된다고 한다.
   */
  <React.StrictMode>
    <App apiURL="http://localhost:3050"/>
  </React.StrictMode>,
  rootElement
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
