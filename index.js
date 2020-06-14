const http = require('http');
const Logger = require('./server/logger');
const app = require('./app');

// log module status
const logger = Logger.createLogger('server.js');

// setup and start the HTTP server
const server = http.createServer(app);
server.on('listening', () => {
  const {port, address} = server.address();
  logger.info({host: address.host, port}, 'Server listening');
});

server.on('error', (error) => {
  logger.error({err: error}, 'HTTP server error');
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection at:', reason.stack || reason);
});

server.listen(app.get('port'));
