const express = require('express');
const TelcoMiddleware = require('./telco-middleware')
const user = require('./private/user/create-user');


const router = express.Router();

router.post('/user/create', TelcoMiddleware(user.createUser));

module.exports = router;