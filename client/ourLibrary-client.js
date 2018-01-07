import React, { Component, cloneElement } from 'react';
import io from 'socket.io-client';
import localforage from 'localforage';

class Controller extends Component {
  constructor(props) {
    super(props);
    this.state = {
      first: 'ok!!!!!',
      cache: {},
      counter: 0,
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
const socket = io('https://boiling-cove-32080.herokuapp.com/');
// const socket = io('https://localhost:3000');

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
  const counter = store.state.counter + 1;
  socket.emit('set', { key, value, runQueries, counter });

  store.setState(prevState => {
    const addedState = {counter: { method: set, arguments: {key, value, runQueries, callback }}};
    const newCache = Object.assign({}, prevState.cache, addedState);
    return {cache: { newCache } };
  })
};

  // localforage.getItem('queue', (err, queue) => {
  //   if (queue) {
  //     queue.push({set, key, value, runQueries, callback});
  //     localforage.setItem('queue', queue);
  //   } else {
  //     localforage.setItem('queue', [{set, key, value, runQueries, callback}]);
  //   }
  // });


export const query = (key, callback, value) => {
  // currentCallback = callback;

  const counter = store.state.counter + 1;
  socket.emit('query', { key, value, counter });

  store.setState(prevState => {
    const addedState = {counter: { method: query, arguments: {key, value, callback }}};
    const newCache = Object.assign({}, prevState.cache, addedState);
    return {cache: { newCache } };
  })

  // localforage.getItem('queue', (err, queue) => {
  //   if (queue) {
  //     queue.push({query, key, value, callback});
  //     localforage.setItem('queue', queue);
  //   } else {
  //     localforage.setItem('queue', [{query, key, value, callback}]);
  //   }
  // });
};

socket.on('local', () => {
  console.log('back connecteddddd');

  for (x in this.state.cache) {
    if (x !== 0) {
      socket.emit(x.method, x.arguments);
    }
  }
  // if (localforage.getItem('queue') !== null) {
  //   const list = localforage.getItem('queue');
  //   console.log('list ', list);
  //   list.forEach((x) => {
  //     if (x.set) {
  //       socket.emit('set', { key: x.key, value: x.value, runQueries: x.runQueries });
  //     } else if (x.query) {
  //       socket.emit('query', { key: x.key, value: x.value });
  //     }
  //   });
  // }
});

socket.on('response', (data) => {
  set(data.key, data.response, false);

  store.setState(prevState => {
    prevState.cache[data.counter] = 0;
    const newCache = prevState.cache;
    return {cache: { newCache } };
  })
  // const queue = localforage.getItem('queue');
  // queue.shift();
  // localforage.setItem('queue', queue);
});

socket.on('queryResponse', (data) => {
  // currentCallback(data);

  data.callback(data.data);

  store.setState(prevState => {
    prevState.cache[data.counter] = 0;
    const newCache = prevState.cache;
    return {cache: { newCache } };
  })

  // const queue = localforage.getItem('queue');
  // queue.shift();
  // localforage.setItem('queue', queue);
});
