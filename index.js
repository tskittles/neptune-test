const express = require('express');
const app = express();
const path = require('path');
const ourLibrary = require('./ourLibrary-server');

app.use(express.static(path.resolve(__dirname, 'build')));

const server = app.listen(process.env.PORT || 3000, () => console.log("Server Connected"));

const db = {
  name: 'qxqigbwr',
  user: 'qxqigbwr',
  password: 'IU0b6NPNVmAwn6gVB6IK5W7mcXZ79IxX',
  dialect: 'postgres',
  host: 'baasu.db.elephantsql.com',
  port: 5432
};

const queries = {
  messages: {
    query: 'INSERT INTO posts (chatmessage, user_id) VALUES (?, ?)',
    response: 'SELECT posts.chatmessage, posts.date, users.username FROM posts INNER JOIN users ON (posts.user_id = users._id)'
  },
  getMessages: {
    query: 'SELECT posts.chatmessage, posts.date, users.username FROM posts INNER JOIN users ON (posts.user_id = users._id)'
  },
  register: {
    query: 'INSERT INTO users (username, password) VALUES (?, ?)',
    errorMessage: 'yikes'
  },
  login: {
    query: 'SELECT username, _id FROM users WHERE username = ? AND password = ?',
    // in documentation recommend to console.log response to see db results
    callback: response => ({ username: response[0].username, id: response[0]._id }),
    errorMessage: 'oh no'
  }
};

ourLibrary(server, db, queries);
