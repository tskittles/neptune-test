import React, { Component, cloneElement } from 'react';
import io from 'socket.io-client';

class Controller extends Component {
  constructor(props) {
    super(props);
    this.state = {
      first: 'ok!!!!!',
      _agent_cache: {},
      _counter_: 0,
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
// let currentCallback;
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
  const counter = store.state._counter_ + 1;
  socket.emit('set', {
    key, value, runQueries, counter,
  });

  store.setState((prevState) => {
    const addedState = {
      counter: {
        method: set,
        arguments: {
          key, value, runQueries, callback,
        },
      },
    };
    const newCache = Object.assign({}, prevState._agent_cache, addedState);
    return { _agent_cache: { newCache } };
  });
};


export const query = (key, callback, value) => {
  // currentCallback = callback;

  const counter = store.state._counter_ + 1;
  socket.emit('query', { key, value, counter, callback });

  store.setState((prevState) => {
    const addedState = { counter: { method: query, arguments: { key, value, callback } } };
    const newCache = Object.assign({}, prevState._agent_cache, addedState);
    return { _agent_cache: { newCache } };
  });
};

socket.on('local', () => {
  const obj = store.state._agent_cache;
  Object.values(obj).forEach((value) => {
    if (value !== 0) {
      socket.emit(value.method, value.arguments);
    }
  });
});

socket.on('response', (data) => {
  set(data.key, data.response, false);

  store.setState((prevState) => {
    prevState._agent_cache[data.counter] = 0;
    const newCache = prevState._agent_cache;
    return { _agent_cache: { newCache } };
  });
});

socket.on('queryResponse', (data) => {
  // currentCallback(data);

  console.log("DATA", data.response);
  if (data.callback) {
    data.callback(data.response);
  }

  store.setState((prevState) => {
    prevState._agent_cache[data.counter] = 0;
    const newCache = prevState._agent_cache;
    return { _agent_cache: { newCache } };
  });
});
