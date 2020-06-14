const Jwt = require('jsonwebtoken');
const User = require('./models/user');
const Config = require('./config');

const TOKEN_EXPIRATION = 60 * 60 * 24 * 365 * 10;

function authenticate(req, res, next) {
  const token = req.get(Config.server.headers.authToken);
  if (!token) {
    // can be called w/ or w/o auth, in the latter case proceed anyway
    if (req.proceedIfNotAuth) {
      return next();
    }

    req.logger.error('Authorization token missing in request body');
    return res.status(400).send('Authorization token missing in request body');
  }

  Jwt.verify(token, Config.jwt.secretKey, (err, tokenPayload) => {
    if (err && req.proceedIfNotAuth) {
      return next();
    }

    if (err) {
      req.logger.error({err}, 'Failed to verify the authorization token');
      return res.sendStatus(401);
    }

    req.tokenPayload = tokenPayload;
    req.logger = req.logger.child({userId: tokenPayload._id});
    req.logger.info({userId: tokenPayload._id}, 'Security token verified');
    if (!tokenPayload._id) {
      req.logger.error('Invalid token payload');
      return res.sendStatus(500);
    }

    req.logger.info('Retrieving user data...');
    User.findOne({_id: tokenPayload._id}, async (e, customer) => {
      if (e) {
        req.logger.error({err: e}, 'Failed to retrieve the customer');
        return res.sendStatus(500);
      }

      req.user = tokenPayload;
      req.logger.info({userId: customer._id}, 'Retrieving user data... DONE');
      next();
    });
  });
}

async function createToken(contents) {
  return Jwt.sign(contents, Config.jwt.secretKey, {
    expiresIn: TOKEN_EXPIRATION
  });
}

function isSecure(password) {
  return password.length > 5;
}

async function createForgotPasswordToken(customer) {
  const expiration = 60 * 10;

  return Jwt.sign({
    _id: customer._id,
    username: customer.name,
    verify: '$secure',
  }, Config.jwt.secretKey, {
    expiresIn: expiration
  });
}

module.exports = {
  authenticate, createToken, isSecure, createForgotPasswordToken
};
