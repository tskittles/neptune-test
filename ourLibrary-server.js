module.exports = function ourLibrary(server, db, queries) {
  const socket = require('socket.io');
  const io = socket(server);
  const Sequelize = require('sequelize');

  const sequelize = new Sequelize(db.name, db.user, db.password, {
    dialect: db.dialect,
    host: db.host,
    port: db.port,
  });

  const subscribedSockets = {};

  const commentsData = ['1', '2', '3', '4'];

  const handleSet = (key, value) => {
    // return queries[key].query.replace('$1', value);
    commentsData.push(value);
    if (queries[key].response) {
      //RUN SEQUALIZE METHOD
      subscribedSockets[key].forEach(socket => {
        // ****ideally the socket to make the set would get the response first!!!
        // probably best to send the changes. not all the data
        socket.emit('response', { data: commentsData, key });
      });
    }
  };

  const handleQuery = (key, values, socket) => {
    sequelize.query(queries[key],
      { replacements: values }
    ).then(response => {
      socket.emit('queryResponse', { response: response[1].rows, key });
    }).catch(error => {
      socket.emit('queryResponse', { error });
      // **are we confident that this is an error object--perhaps new Error(error) ???
    });
  };

  io.on('connection', socket => {
    socket.on('set', data => {
      if (data.subscribe) {
        if (subscribedSockets[data.key]) {
          if (!subscribedSockets[data.key].includes(socket)) {
            subscribedSockets[data.key].push(socket);
          }
        } else {
          subscribedSockets[data.key] = [socket];
        }
      }
      handleSet(data.key, data.value);
    });

    socket.on('query', data => {
      handleQuery(data.key, data.values, socket);
    });
  });
};
