const Express = require('express');
const Cors = require('cors');
const Helmet = require('helmet');
const BodyParser = require('body-parser');
const path = require('path');
const Config = require('./server/config');
const {notFound, logError, logRequest, correlate} = require('./server/logger');
const Api = require('./server/api');
const initDb = require('./server/mongo-connection');


const handleError = (err, req, res, next) => {
  delete err.stack;
  if (res.headersSent) {
    // If an error occurs while the response is being sent,
    // we forward the error to the default error handler to
    // close the connection and fail the request
    req.logger.error({res}, 'Forwarding the error to the default error handler...');
    next(err);
  } else {
    res.status(err.httpStatusCode || 500).json({
      correlationId: req.correlationId,
      status: 'error',
      description: err.message
    });
    req.logger.error({res}, 'Error response sent');
  }
};

// Setup the express middleware
const app = Express();
app.set('trust proxy', Config.server.proxy);
app.set('port', Config.server.port);

// in Lambda env, set base path for templates
if (process.env.LAMBDA_TASK_ROOT) {
  app.set('views', path.resolve(process.env.LAMBDA_TASK_ROOT, '_optimize/sb-server/views'));
}

// initDb.initialize();
initDb();

app.use(correlate);
app.use(logRequest);

app.use(Cors({
  origin: '*', // Config.server.cors.origins
  optionsSuccessStatus: 204
}));
app.use(Helmet());
// Parse application/x-www-form-urlencoded
// TODO do we need this?
app.use(BodyParser.urlencoded({
  limit: '10mb',
  extended: false
}));
// Parse application/json
app.use(BodyParser.json({limit: '10mb'}));

// Mount the API
app.use(Config.server.mountDir, Api);
app.use('/favicon.ico', Express.static('favicon.ico'));

// base route
app.use('/favicon.ico', Express.static('favicon.ico'));
app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      description: 'SmartBite API'
    }
  });
});

// Handle errors
app.use(notFound);
app.use(logError);

module.exports = app;
