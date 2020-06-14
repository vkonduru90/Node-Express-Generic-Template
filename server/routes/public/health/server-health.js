function ping(req, res) {
  console.log(req);
  return res.status(200).json({ message: 'PONG' });
}

module.exports = {
  ping,
};
