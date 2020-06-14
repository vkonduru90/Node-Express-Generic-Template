const UserModel = require('../models/user');

const Authentication = require('../authentication');

async function saveUser(userInfo) {
  const userDetails = await UserModel.findOne({ email: userInfo.email });

  if (userDetails) {
    throw new Error('User Already Exists.');
  }
  const newUser = await new UserModel(userInfo).save();
  return newUser;
}

async function checkUser(httpRequest) {
  const userDetails = httpRequest.body;
  const userDoc = await UserModel.findOne({ email: userDetails.username });
  if (!userDoc) {
    throw new Error('User not exists.');
  }
  // const match = await userDoc.comparePassword(userDetails.password);
  const match = userDetails.password == userDoc.password;
  if (!match) {
    httpRequest.logger.error('Wrong username or password');
    throw new Error('Wrong username or password');
  }
  const tokenData = (({ email, _id, name, roles }) => ({ email, _id, name, roles }))(
    userDoc.toJSON(),
  );

  const authToken = await Authentication.createToken(tokenData);
  return { token : authToken};
}

module.exports = {
  saveUser,
  checkUser,
};
