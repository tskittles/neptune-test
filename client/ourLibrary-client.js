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
const socket = io('http://localhost:3000');

export const Wrapper = () => {
  store = new Controller;
  return store;
}

export const get = (key) => {
  return store.state[key];
}

// *****I'm thinking that if you are using our library, it MUST sync with the database.
// Otherwise, you should be using your redux store or component state
// when would be a situation where that wouldn't be the case??
// in which case we wouldn't really need a set AND a query method... hmmm maybe not
export const set = (key, value, sync = false, subscribe = true, callback) => {
  if (callback) {
    const newState = callback(store.state[key]);
    store.addToStore(key, newState);
    if (sync) {
      socket.emit('set', { key, value, subscribe });
    }
  } else {
    store.addToStore(key, value);
    if (sync) {
      socket.emit('set', { key, value, subscribe });
    }
  }
}

export const query = (key, callback, values) => {
  socket.emit('query', { key, values });
  currentCallback = callback; // ****wonder if we need to track this query with a unique id from client
  // to server and back to server so that the correct currentCallback is called
}

socket.on('response', data => {
  set(data.key, data.data);
});

socket.on('queryResponse', data => {
  currentCallback(data);
});
