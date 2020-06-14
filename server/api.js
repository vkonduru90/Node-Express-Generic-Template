const Express = require('express');

const privateRoutes = require('./routes/private-routes');
const publicRoutes = require('./routes/public-routes');
const Authentication = require('./authentication');

const router = Express.Router();
const {notFound} = require('./logger');

router.use('/secured', Authentication.authenticate, privateRoutes);
router.use(publicRoutes);

router.all('/*', notFound);

module.exports = router;
