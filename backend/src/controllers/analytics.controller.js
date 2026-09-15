const analyticsService = require('../services/analytics.service');
const { successResponse } = require('../utils/response.util');

class AnalyticsController {
  async getOverview(req, res, next) {
    try {
      const overview = await analyticsService.getOverview();
      return successResponse(
        res,
        overview,
        'Analytics overview retrieved successfully.',
        200
      );
    } catch (error) {
      next(error);
    }
  }

  async getGroupAnalytics(req, res, next) {
    try {
      const groupAnalytics = await analyticsService.getGroupAnalytics();
      return successResponse(
        res,
        groupAnalytics,
        'Group analytics retrieved successfully.',
        200
      );
    } catch (error) {
      next(error);
    }
  }

  async getStudentAnalytics(req, res, next) {
    try {
      const studentAnalytics = await analyticsService.getStudentAnalytics();
      return successResponse(
        res,
        studentAnalytics,
        'Student analytics retrieved successfully.',
        200
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
