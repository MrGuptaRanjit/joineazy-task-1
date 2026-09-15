const { verifyToken } = require('../utils/jwt.util');
const { errorResponse } = require('../utils/response.util');
const db = require('../db');

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

    // Verify user exists in database
    const userResult = await db.query(
      'SELECT id, name, email, role, student_id FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return errorResponse(res, 'User associated with this token no longer exists.', 401);
    }

    req.user = userResult.rows[0];
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
