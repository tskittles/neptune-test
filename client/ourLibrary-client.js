import React, { Component, cloneElement } from 'react';
import io from 'socket.io-client';

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

let store,
currentCallback;
const socket = io('https://boiling-cove-32080.herokuapp.com/');

export const Wrapper = () => {
  store = new Controller();
  return store;
};

export const get = (key) => store.state[key];

export const set = (key, value, runQueries = true, callback) => {
  if (callback) {
    const oldState = store.state[key];
    store.addToStore(key, callback(oldState));
  } else {
    store.addToStore(key, value);
  }
  socket.emit('set', { key, value, runQueries });
  if (localStorage.getItem('queue')) {
    const queue = localStorage.getItem('queue');
    queue.push({
 set, key, value, runQueries, callback
});
    localStorage.setItem('queue', queue);
  } else {
    localStorage.setItem('queue', [{
 set, key, value, runQueries, callback
}]);
  }
};

export const query = (key, callback, values) => {
  socket.emit('query', { key, values });
  currentCallback = callback; // ****wonder if we need to track this query with a unique id from client
  // to server and back to server so that the correct currentCallback is called
  if (localStorage.getItem('queue')) {
    const queue = localStorage.getItem('queue');
    queue.push({
 query, key, value, runQueries, callback
});
    localStorage.setItem('queue', queue);
  } else {
    localStorage.setItem('queue', [{
 query, key, value, runQueries, callback
}]);
  }
};

socket.on('local', () => {
  console.log('back connecteddddd');
  const list = localStorage.getItem('queue');
  list.forEach((x) => {
    if (x.set) {
      socket.emit('set', { key: x.key, value: x.value, runQueries: x.runQueries });
    } else if (x.query) {
      socket.emit('query', { key: x.key, value: x.value });
    }
  });
});

socket.on('response', (data) => {
  set(data.key, data.response, false);
  const queue = localStorage.getItem('queue');
  localStorage.setItem(queue, queue.shift());
});

socket.on('queryResponse', (data) => {
  currentCallback(data);
  const queue = localStorage.getItem('queue');
  localStorage.setItem(queue, queue.shift());
});
