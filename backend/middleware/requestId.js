const crypto = require('crypto');

const requestId = (req, res, next) => {
  const existingId = req.headers['x-request-id'];
  const id = existingId && typeof existingId === 'string' ? existingId : crypto.randomUUID();

  req.id = id;
  req.requestId = id;
  res.setHeader('x-request-id', id);

  next();
};

module.exports = requestId;
