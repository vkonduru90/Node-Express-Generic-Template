const Bunyan = require('bunyan');
const Uuid4 = require('uuid').v4;
const Config = require('./config');

/**
 * Init Bunyan
 * @param name Name of the logger
 * @returns {Logger}
 */
const createLogger = (name) => Bunyan.createLogger({
  name,
  serializers: {
    err: Bunyan.stdSerializers.err,
    req: ({method, url, connection}) => ({
      method,
      url,
      remoteAddress: connection.remoteAddress,
      remotePort: connection.remotePort
    }),
    res: ({statusCode}) => ({statusCode})
  }
});

const notFound = (req, res) => {
  req.logger.error({req}, 'Endpoint not found');
  res.status(404).json({
    success: false,
    error: {description: 'Not found'}
  });
};

const correlate = (req, res, next) => {
  req.correlationId = req.get(Config.server.headers.correlationId) || Uuid4();
  next();
};

const logResponse = (req, res) => {
  res.on('close', () => {
    req.logger.error({res}, 'Response unexpectedly terminated');
  });
  res.on('finish', () => {
    if (req.url === '/') return;
    req.logger.info({res}, 'Response sent');
  });
};

const logRequest = (req, res, next) => {
  if (req.url === '/') return next();
  req.logger = createLogger('request');
  req.logger = req.logger.child({correlationId: req.correlationId});
  req.logger.info({req}, 'Request received');
  logResponse(req, res);
  next();
};

const logError = (err, req, res, next) => {
  req.logger.error({
    err,
    httpStatusCode: err.httpStatusCode
  });

  if (req.xhr) {
    res.status(500).send({success: false, error: {error: err}});
  } else next(err);
};

module.exports = {createLogger, notFound, logRequest, logError, correlate}
