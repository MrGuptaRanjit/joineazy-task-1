const submissionRepository = require('../repositories/submission.repository');
const assignmentRepository = require('../repositories/assignment.repository');
const groupRepository = require('../repositories/group.repository');
const AppError = require('../utils/appError');

class SubmissionService {
  async confirmSubmission(assignmentId, studentId, { is_confirmed }) {
    if (!is_confirmed) {
      throw new AppError('Two-step confirmation required. Please confirm step 1 before proceeding.', 400);
    }

    // 1. Check if assignment exists and is visible to student
    const assignment = await assignmentRepository.getStudentAssignmentDetails(assignmentId, studentId);
    if (!assignment) {
      throw new AppError('Assignment not found or not assigned to you/your group.', 404);
    }

    // 2. Check if already confirmed
    const existingSubmission = await submissionRepository.findByAssignmentAndStudent(assignmentId, studentId);
    if (existingSubmission && existingSubmission.status === 'CONFIRMED') {
      throw new AppError('You have already confirmed submission for this assignment.', 409);
    }

    // 3. Get student's current group (if any)
    const userGroup = await groupRepository.getGroupByUserId(studentId);


    // 3. Record confirmation
    const submission = await submissionRepository.confirmSubmission({
      assignmentId,
      studentId,
      groupId: userGroup ? userGroup.id : null,
    });

    return {
      message: 'Assignment submission confirmed successfully.',
      submission,
    };
  }

  async getAssignmentAudit(assignmentId) {
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new AppError('Assignment not found.', 404);
    }

    const auditData = await submissionRepository.getAssignmentAudit(assignmentId);
    return {
      assignment,
      ...auditData,
    };
  }
}

module.exports = new SubmissionService();
