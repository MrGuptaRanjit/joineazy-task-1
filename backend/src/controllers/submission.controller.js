const submissionService = require('../services/submission.service');
const { successResponse } = require('../utils/response.util');

class SubmissionController {
  async confirmSubmission(req, res, next) {
    try {
      const result = await submissionService.confirmSubmission(
        req.params.id,
        req.user.id,
        req.body
      );

      return successResponse(
        res,
        result.submission,
        result.message,
        200
      );
    } catch (error) {
      next(error);
    }
  }

  async getAssignmentAudit(req, res, next) {
    try {
      const result = await submissionService.getAssignmentAudit(req.params.id);
      return successResponse(
        res,
        result,
        'Submission audit retrieved successfully.',
        200
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SubmissionController();
