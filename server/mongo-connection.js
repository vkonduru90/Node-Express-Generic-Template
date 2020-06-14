const mongoose = require('mongoose');
const Config = require('./config');
const Logger = require('./logger');

const logger = Logger.createLogger('database.js');
const {protocol, user, password, host, port, db, prod} = Config.database;
const CONNECTION_STRING = `${protocol}://${user}:${password}@${host}${protocol === 'mongodb+srv' ? '' : `:${port}`}/${db}`
  + `${prod ? '?retryWrites=true&w=majority' : ''}`;

async function initDb() {
  let config = {
    promiseLibrary: Promise, // use native Promise library
    socketTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    autoIndex: false,
    // authSource: prod ? 'admin' : 'dev',
    user,
    pass: password,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true
  };

  // authenticate if to production shard
  if (prod) {
    config = Object.assign(config, {
      ssl: true
    });
  }

  // handle connection events
  const {connection} = mongoose;
  connection.on('error', (error) => {
    logger.info(error, 'DB Error');
  });
  connection.on('open', () => {
    logger.info('Connected to DB');
  });
  connection.on('close', () => {
    logger.info('Disconnected from DB');
  });

  // init connection
  await mongoose.connect(CONNECTION_STRING, config);

  return connection;
}

module.exports = initDb;