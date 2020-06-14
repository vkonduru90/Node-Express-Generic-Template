const express = require('express');
const TelcoMiddleware = require('./telco-middleware');
const serverHealth = require('./public/health/server-health');
const login = require('./public/login/loing');

const router = express.Router();

router.get('/ping', serverHealth.ping);
router.post('/login', TelcoMiddleware(login.checkCreds));

module.exports = router;