import React, {Component} from 'react';
import { render } from 'react-dom';
import Chat from './components/Chat';
import Login from './components/Login';
import { Wrapper } from './ourLibrary-client';
import { query, get, set } from './ourLibrary-client';
import './style.css';

class App extends Component {
  render() {
    return(
      <div>
        <Login />
        <Chat />
      </div>
    );
  }
}

render(
  <Wrapper>
    <App />
  </Wrapper>
  , document.querySelector('#root'));