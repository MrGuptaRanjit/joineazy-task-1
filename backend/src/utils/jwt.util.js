const jwt = require('jsonwebtoken');
const config = require('../config');

const generateToken = (payload) => {
  // Only sign minimal necessary claims (id, role)
  const tokenPayload = {
    id: payload.id,
    role: payload.role,
  };

  return jwt.sign(tokenPayload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

module.exports = {
  generateToken,
  verifyToken,
};
