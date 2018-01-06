import React, { Component, cloneElement } from 'react';
import io from 'socket.io-client';
import localforage from 'localforage';

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
// const socket = io('https://boiling-cove-32080.herokuapp.com/');
const socket = io('https://localhost:3000');

export const Wrapper = () => {
  store = new Controller();
  return store;
};

export const get = key => store.state[key];

export const set = (key, value, runQueries = true, callback) => {
  if (callback) {
    const oldState = store.state[key];
    store.addToStore(key, callback(oldState));
  } else {
    store.addToStore(key, value);
  }
  socket.emit('set', { key, value, runQueries });
  localforage.getItem('queue', (err, queue) => {
    if (queue) {
      queue.push({set, key, value, runQueries, callback});
      localforage.setItem('queue', queue);
    } else {
      localforage.setItem('queue', [{set, key, value, runQueries, callback}]);
    }
  });
};

export const query = (key, callback, value) => {
  socket.emit('query', { key, value });
  currentCallback = callback;
  localforage.getItem('queue', (err, queue) => {
    if (queue) {
      queue.push({query, key, value, callback});
      localforage.setItem('queue', queue);
    } else {
      localforage.setItem('queue', [{query, key, value, callback}]);
    }
  });
};

socket.on('local', () => {
  console.log('back connecteddddd');
  if (localforage.getItem('queue') !== null) {
    const list = localforage.getItem('queue');
    console.log('list ', list);
    list.forEach((x) => {
      if (x.set) {
        socket.emit('set', { key: x.key, value: x.value, runQueries: x.runQueries });
      } else if (x.query) {
        socket.emit('query', { key: x.key, value: x.value });
      }
    });
  }
});

socket.on('response', (data) => {
  set(data.key, data.response, false);
  const queue = localforage.getItem('queue');
  queue.shift();
  localforage.setItem('queue', queue);
});

socket.on('queryResponse', (data) => {
  currentCallback(data);
  const queue = localforage.getItem('queue');
  queue.shift();
  localforage.setItem('queue', queue);
});
