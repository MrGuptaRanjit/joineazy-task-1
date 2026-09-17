const { Submission, Assignment, AssignmentTarget, Group, GroupMember, User } = require('../models');

class SubmissionRepository {
  async confirmSubmission({ assignmentId, studentId, groupId }) {
    const submission = await Submission.findOneAndUpdate(
      {
        assignment_id: assignmentId,
        student_id: studentId,
      },
      {
        assignment_id: assignmentId,
        student_id: studentId,
        group_id: groupId || null,
        status: 'CONFIRMED',
        confirmed_at: new Date(),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return submission.toJSON();
  }

  async findByAssignmentAndStudent(assignmentId, studentId) {
    const submission = await Submission.findOne({
      assignment_id: assignmentId,
      student_id: studentId,
    });
    return submission ? submission.toJSON() : null;
  }

  async getSubmissionsByAssignment(assignmentId) {
    const submissions = await Submission.find({ assignment_id: assignmentId })
      .populate('student_id', 'name email student_id')
      .populate('group_id', 'name')
      .sort({ confirmed_at: -1 });

    return submissions.map((s) => ({
      id: s._id.toString(),
      assignment_id: s.assignment_id.toString(),
      student_id: s.student_id?._id ? s.student_id._id.toString() : s.student_id.toString(),
      student_name: s.student_id?.name || 'Unknown',
      student_email: s.student_id?.email || '',
      roll_number: s.student_id?.student_id || '',
      group_id: s.group_id?._id ? s.group_id._id.toString() : null,
      group_name: s.group_id?.name || null,
      status: s.status,
      confirmed_at: s.confirmed_at,
    }));
  }

  async getAssignmentAudit(assignmentId) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return null;

    // 1. Eligible Groups
    let eligibleGroups = [];
    if (assignment.target_type === 'ALL') {
      eligibleGroups = await Group.find().sort({ name: 1 });
    } else {
      const targets = await AssignmentTarget.find({ assignment_id: assignmentId }).populate('group_id');
      eligibleGroups = targets.filter((t) => t.group_id != null).map((t) => t.group_id);
    }

    // 2. Group Summary Breakdown
    const groupSummary = [];
    for (const group of eligibleGroups) {
      const memberCount = await GroupMember.countDocuments({ group_id: group._id });
      const subCount = await Submission.countDocuments({
        group_id: group._id,
        assignment_id: assignmentId,
        status: 'CONFIRMED',
      });
      const rate = memberCount > 0 ? Number(((subCount / memberCount) * 100).toFixed(2)) : 0;

      groupSummary.push({
        group_id: group._id.toString(),
        group_name: group.name,
        total_members: memberCount,
        confirmed_submissions: subCount,
        completion_percentage: rate,
      });
    }

    // 3. Student Submissions List
    let eligibleStudentIds = [];
    if (assignment.target_type === 'ALL') {
      const allStudents = await User.find({ role: 'STUDENT' });
      eligibleStudentIds = allStudents.map((s) => s._id);
    } else {
      const groupIds = eligibleGroups.map((g) => g._id);
      const members = await GroupMember.find({ group_id: { $in: groupIds } }).select('user_id');
      eligibleStudentIds = members.map((m) => m.user_id);
    }

    const students = await User.find({ _id: { $in: eligibleStudentIds }, role: 'STUDENT' }).sort({ name: 1 });

    const studentSubmissions = await Promise.all(
      students.map(async (u) => {
        const membership = await GroupMember.findOne({ user_id: u._id }).populate('group_id');
        const sub = await Submission.findOne({
          assignment_id: assignmentId,
          student_id: u._id,
        });

        return {
          student_id: u._id.toString(),
          student_name: u.name,
          email: u.email,
          roll_number: u.student_id,
          group_name: membership?.group_id?.name || 'No Group',
          status: sub ? sub.status : 'PENDING',
          confirmed_at: sub ? sub.confirmed_at : null,
        };
      })
    );

    // Sort confirmed first (by confirmed_at desc), then pending by name
    studentSubmissions.sort((a, b) => {
      if (a.status === 'CONFIRMED' && b.status !== 'CONFIRMED') return -1;
      if (a.status !== 'CONFIRMED' && b.status === 'CONFIRMED') return 1;
      if (a.confirmed_at && b.confirmed_at) return new Date(b.confirmed_at) - new Date(a.confirmed_at);
      return a.student_name.localeCompare(b.student_name);
    });

    return {
      groupSummary,
      studentSubmissions,
    };
  }
}

module.exports = new SubmissionRepository();
