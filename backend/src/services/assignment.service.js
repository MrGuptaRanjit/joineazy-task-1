const assignmentRepository = require('../repositories/assignment.repository');
const groupRepository = require('../repositories/group.repository');
const AppError = require('../utils/appError');

class AssignmentService {
  async createAssignment(adminId, { title, description, due_date, onedrive_link, target_type = 'ALL', group_ids = [] }) {
    if (target_type === 'GROUPS' && (!Array.isArray(group_ids) || group_ids.length === 0)) {
      throw new AppError('At least one group must be selected when target_type is GROUPS.', 400);
    }

    const assignment = await assignmentRepository.createAssignment({
      title,
      description,
      dueDate: due_date,
      onedriveLink: onedrive_link,
      targetType: target_type,
      createdBy: adminId,
      groupIds: group_ids,
    });

    return await assignmentRepository.findById(assignment.id);
  }

  async updateAssignment(id, updateData) {
    const existing = await assignmentRepository.findById(id);
    if (!existing) {
      throw new AppError('Assignment not found.', 404);
    }

    if (updateData.target_type === 'GROUPS' && updateData.group_ids && (!Array.isArray(updateData.group_ids) || updateData.group_ids.length === 0)) {
      throw new AppError('At least one group must be selected when target_type is GROUPS.', 400);
    }

    await assignmentRepository.updateAssignment(id, {
      title: updateData.title,
      description: updateData.description,
      dueDate: updateData.due_date,
      onedriveLink: updateData.onedrive_link,
      targetType: updateData.target_type,
      groupIds: updateData.group_ids,
    });

    return await assignmentRepository.findById(id);
  }

  async deleteAssignment(id) {
    const deleted = await assignmentRepository.deleteAssignment(id);
    if (!deleted) {
      throw new AppError('Assignment not found.', 404);
    }
    return { message: 'Assignment deleted successfully.' };
  }

  async getAdminAssignments() {
    return await assignmentRepository.findAllForAdmin();
  }

  async getAssignmentById(id) {
    const assignment = await assignmentRepository.findById(id);
    if (!assignment) {
      throw new AppError('Assignment not found.', 404);
    }
    return assignment;
  }

  async getStudentAssignments(studentId) {
    return await assignmentRepository.findVisibleForStudent(studentId);
  }

  async getStudentAssignmentDetails(assignmentId, studentId) {
    const assignment = await assignmentRepository.getStudentAssignmentDetails(assignmentId, studentId);
    if (!assignment) {
      throw new AppError('Assignment not found or not accessible to your group.', 404);
    }
    return assignment;
  }
}

module.exports = new AssignmentService();
