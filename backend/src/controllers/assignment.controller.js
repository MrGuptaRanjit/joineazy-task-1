const assignmentService = require('../services/assignment.service');
const { successResponse } = require('../utils/response.util');

class AssignmentController {
  // Admin Methods
  async createAssignment(req, res, next) {
    try {
      const assignment = await assignmentService.createAssignment(req.user.id, req.body);
      return successResponse(
        res,
        assignment,
        'Assignment created successfully.',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async updateAssignment(req, res, next) {
    try {
      const assignment = await assignmentService.updateAssignment(req.params.id, req.body);
      return successResponse(
        res,
        assignment,
        'Assignment updated successfully.',
        200
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteAssignment(req, res, next) {
    try {
      const result = await assignmentService.deleteAssignment(req.params.id);
      return successResponse(
        res,
        null,
        result.message,
        200
      );
    } catch (error) {
      next(error);
    }
  }

  async getAdminAssignments(req, res, next) {
    try {
      const assignments = await assignmentService.getAdminAssignments();
      return successResponse(
        res,
        assignments,
        'Admin assignments retrieved successfully.',
        200
      );
    } catch (error) {
      next(error);
    }
  }

  async getAssignmentById(req, res, next) {
    try {
      const assignment = await assignmentService.getAssignmentById(req.params.id);
      return successResponse(
        res,
        assignment,
        'Assignment details retrieved successfully.',
        200
      );
    } catch (error) {
      next(error);
    }
  }

  // Student Methods
  async getStudentAssignments(req, res, next) {
    try {
      const assignments = await assignmentService.getStudentAssignments(req.user.id);
      return successResponse(
        res,
        assignments,
        'Assignments retrieved successfully.',
        200
      );
    } catch (error) {
      next(error);
    }
  }

  async getStudentAssignmentDetails(req, res, next) {
    try {
      const assignment = await assignmentService.getStudentAssignmentDetails(
        req.params.id,
        req.user.id
      );
      return successResponse(
        res,
        assignment,
        'Assignment details retrieved successfully.',
        200
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AssignmentController();
