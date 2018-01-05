import React, { Component, cloneElement } from 'react';
import io from 'socket.io-client';

class Controller extends Component {
  constructor(props) {
    super(props);
    this.state = {
      first: 'ok!!!!!'
    }
  }

  addToStore(key, value) {
    this.setState({ [key]: value });
  }

  render() {
    return cloneElement(this.props.children, this.state);
  }
}

let store, currentCallback;
const socket = io('https://boiling-cove-32080.herokuapp.com/');

export const Wrapper = () => {
  store = new Controller;
  return store;
}

export const get = (key) => {
  return store.state[key];
}

export const set = (key, value, runQueries = true, callback) => {
  if (callback) {
    const oldState = store.state[key];
    store.addToStore(key, callback(oldState));
  } else {
    store.addToStore(key, value);
  }
  socket.emit('set', { key, value, runQueries });
}

export const query = (key, callback, values) => {
  socket.emit('query', { key, values });
  currentCallback = callback; // ****wonder if we need to track this query with a unique id from client
  // to server and back to server so that the correct currentCallback is called
}

socket.on('response', data => {
  set(data.key, data.response, false);
});

socket.on('queryResponse', data => {
  currentCallback(data);
});
