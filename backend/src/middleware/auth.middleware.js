const { verifyToken } = require('../utils/jwt.util');
const { errorResponse } = require('../utils/response.util');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication token missing or invalid. Please log in.', 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Session expired. Please log in again.', 401);
      }
      return errorResponse(res, 'Invalid authentication token.', 401);
    }

    // Verify user exists in MongoDB
    const user = await User.findById(decoded.id).select('-password_hash');

    if (!user) {
      return errorResponse(res, 'User associated with this token no longer exists.', 401);
    }

    req.user = user.toJSON();
    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Forbidden: Access restricted to [${allowedRoles.join(', ')}] role(s).`,
        403
      );
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
