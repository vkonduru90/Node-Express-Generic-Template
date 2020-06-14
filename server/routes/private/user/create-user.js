const userController = require('../../../controllers/user.controller');

async function createUser(httpRequest) {
  const body = httpRequest.body;
  if (!body.name) {
    throw new Error('name required.');
  }
  if (!body.email) {
    throw new Error('email required.');
  }
  if (!body.roles) {
    throw new Error('roles required.');
  }

  const result = await userController.saveUser(body);
  return result;
}

module.exports = {
  createUser,
};
