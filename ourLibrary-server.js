module.exports = function ourLibrary(server, db, queries) {
  const socket = require('socket.io');
  const io = socket(server);
  const Sequelize = require('sequelize');
  const chalk = require('chalk');

  const sequelize = new Sequelize(db.name, db.user, db.password, {
    dialect: db.dialect,
    host: db.host,
    port: db.port,
  });

  const subscribedSockets = {};

  const handleSet = (key, value, socket) => {
    sequelize.query(queries[key].query,
      { replacements: value }
    ).then(response => {
      if (queries[key].response) {
        sequelize.query(queries[key].response,
          { replacements: [response] }
        ).then(secondResponse => {
          subscribedSockets[key].forEach(subscribedSocket => {
            if (queries[key].callback) {
              subscribedSocket.emit('response', { response: queries[key].callback(secondResponse[1].rows), key });
            } else {
              subscribedSocket.emit('response', { response: secondResponse[1].rows, key });
            }
          });
        })
      }
    }).catch(error => {
      console.log(chalk.red('Error with database: '), chalk.yellow(error));
      if (queries[key].errorMessage) {
        socket.emit('queryResponse', { error: queries[key].errorMessage });
      } else {
        socket.emit('queryResponse', { error: 'Error with database' });
      }
    });
  };

  const handleQuery = (key, values, socket) => {
    sequelize.query(queries[key].query,
      { replacements: values }
    ).then(response => {
      if (queries[key].callback) {
        socket.emit('queryResponse', { response: queries[key].callback(response[1].rows), key });
      } else {
        socket.emit('queryResponse', { response: response[1].rows, key });
      }
    }).catch(error => {
<<<<<<< HEAD
      socket.emit('queryResponse', { error });
      // **are we confident that this is an error object--perhaps new Error(error) ???
=======
      console.log(chalk.red('Error with database: '), chalk.yellow(error));
      if (queries[key].errorMessage) {
        socket.emit('queryResponse', { error: queries[key].errorMessage });
      } else {
        socket.emit('queryResponse', { error: 'Error with database' });
      }
>>>>>>> 42a4b7074390a6f7e1878c7d37be767b76fbd99c
    });
  };

  io.on('connection', socket => {
    socket.on('set', data => {
      if (queries[data.key]) {
        if (subscribedSockets[data.key]) {
          if (!subscribedSockets[data.key].includes(socket)) {
            subscribedSockets[data.key].push(socket);
          }
        } else {
          subscribedSockets[data.key] = [socket];
        }
<<<<<<< HEAD
      }
      handleSet(data.key, data.value);
=======
        if (data.runQueries) {
          handleSet(data.key, data.value, socket);
        }
      }
>>>>>>> 42a4b7074390a6f7e1878c7d37be767b76fbd99c
    });

    socket.on('query', data => {
      handleQuery(data.key, data.values, socket);
    });
  });
};
