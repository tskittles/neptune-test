import React, { Component, cloneElement } from 'react';
import io from 'socket.io-client';

//ACTUALLY JUST saveit to an object NOT to react storeage and it should work just fine!!!
class Controller extends Component {
  constructor(props) {
    super(props);
    this.state = {
      first: 'ok!!!!!',
    };
  }

  addToStore(key, value) {
    this.setState({ [key]: value });
  }

  render() {
    return cloneElement(this.props.children, this.state);
  }
}

let store;
let counter = 0;
// let currentCallback;
const cache = {};
const socket = io.connect();


export const Wrapper = () => {
  store = new Controller();
  return store;
};

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

  counter += 1;
  socket.emit('set', { key, value, runQueries, counter });

  cache[counter] = {
    method: 'set', arguments: { key, value, runQueries, counter }, callback,
  };
};


export const query = (key, callback, value) => {
  // currentCallback = callback;

  counter += 1;
  socket.emit('query', { key, value, counter });

  cache[counter] = { method: 'query', arguments: { key, value, counter }, callback };
};

socket.on('local', () => {
  Object.values(cache).forEach((value) => {
    socket.emit(value.method, value.arguments);
  });
});

socket.on('response', (data) => {
  set(data.key, data.response, false);

  // delete cache[data.counter];
});

socket.on('queryResponse', (data) => {
  // currentCallback(data);

  if (cache[data.counter].callback) {
    cache[data.counter].callback(data.response);
  }

  // delete cache[data.counter];
});
