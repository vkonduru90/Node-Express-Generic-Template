module.exports = function makeExpressCallback(controller) {
  return (req, res) => {

    const httpRequest = {
      body: req.body,
      query: req.query,
      params: req.params,
      ip: req.ip,
      method: req.method,
      path: req.path,
      // principal: req.principal,
      logger: req.logger,
      user: req.user,
      headers: {
        'Content-Type': req.get('Content-Type'),
        'Referer': req.get('referer'),
        'User-Agent': req.get('User-Agent')
      }
    };

    controller(httpRequest)
      .then(httpResponse => {
        if (httpResponse && httpResponse.contentType === 'application/octet-stream') {
          res.setHeader('content-disposition', `attachment; filename=${httpResponse.fileName}`);
          res.set('Content-Type', 'application/octet-stream');
          res.attachment(httpResponse.fileName);
          res.status(200).send({success: true});
        }
        res.set('Content-Type', 'application/json');
        res.type('json');
        const body = {
          success: true,
          data: httpResponse
        };
        res.status(200).send(body);
      })
      .catch(e => {
        console.log(e);
        const statusCode = e.statusCode || 400;
        res.status(statusCode).send({
          success: false,
          error: {
            code: statusCode,
            description: e.message || e
          }
        });
      });
  };
};
