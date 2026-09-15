const authService = require('../services/auth.service');
const { successResponse } = require('../utils/response.util');

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password, student_id } = req.body;
      const result = await authService.registerStudent({
        name,
        email,
        password,
        student_id,
      });

      return successResponse(
        res,
        result,
        'Student registered successfully.',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      return successResponse(
        res,
        result,
        'Login successful.',
        200
      );
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const result = await authService.getCurrentUserProfile(req.user.id);
      return successResponse(
        res,
        result,
        'User profile retrieved successfully.',
        200
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
