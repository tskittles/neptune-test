const express = require('express');
const app = express();
const path = require('path');
const ourLibrary = require('./ourLibrary-server');

app.use(express.static(path.resolve(__dirname, 'build')));

const server = app.listen(3000, () => console.log("Server Connected"));

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
    response: 'SELECT * at COMMENTS'
  },
  register: 'INSERT INTO users (username, password) VALUES (?, ?)',
  login: 'SELECT username FROM users WHERE username = ? AND password = ?'
};

ourLibrary(server, db, queries);