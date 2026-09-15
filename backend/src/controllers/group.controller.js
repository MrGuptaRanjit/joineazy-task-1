const groupService = require('../services/group.service');
const { successResponse } = require('../utils/response.util');

class GroupController {
  async createGroup(req, res, next) {
    try {
      const group = await groupService.createGroup(req.user.id, {
        name: req.body.name,
      });

      return successResponse(
        res,
        group,
        'Group created successfully.',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async getMyGroup(req, res, next) {
    try {
      const group = await groupService.getMyGroup(req.user.id);
      return successResponse(
        res,
        group,
        group ? 'Group retrieved successfully.' : 'You are not currently in any group.',
        200
      );
    } catch (error) {
      next(error);
    }
  }

  async getGroupById(req, res, next) {
    try {
      const group = await groupService.getGroupById(req.params.id);
      return successResponse(
        res,
        group,
        'Group details retrieved successfully.',
        200
      );
    } catch (error) {
      next(error);
    }
  }

  async getAllGroups(req, res, next) {
    try {
      const groups = await groupService.getAllGroups();
      return successResponse(
        res,
        groups,
        'Groups retrieved successfully.',
        200
      );
    } catch (error) {
      next(error);
    }
  }

  async getGroupAudit(req, res, next) {
    try {
      const audit = await groupService.getGroupAudit(req.params.id);
      return successResponse(
        res,
        audit,
        'Group audit retrieved successfully.',
        200
      );
    } catch (error) {
      next(error);
    }
  }

  async addMember(req, res, next) {
    try {
      const result = await groupService.addMember(
        req.params.id,
        req.user.id,
        req.body.identifier
      );

      return successResponse(
        res,
        result.members,
        result.message,
        200
      );
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req, res, next) {
    try {
      const result = await groupService.removeMember(
        req.params.id,
        req.user.id,
        req.params.userId
      );

      return successResponse(
        res,
        result.members,
        result.message,
        200
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GroupController();
