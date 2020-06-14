const userController = require('../../../controllers/user.controller');

async function checkCreds(httpRequest) {
  const body = httpRequest.body;

  if (!body.username) {
    throw new Error('username required.');
  }
  if (!body.password) {
    throw new Error('password required.');
  }
  return await userController.checkUser(httpRequest);
}

module.exports = {
  checkCreds,
};
