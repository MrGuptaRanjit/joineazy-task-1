const { User, Group, GroupMember, Assignment, AssignmentTarget, Submission } = require('../models');

class AnalyticsRepository {
  async getOverviewKPIs() {
    const totalStudents = await User.countDocuments({ role: 'STUDENT' });
    const totalGroups = await Group.countDocuments();
    const totalAssignments = await Assignment.countDocuments();
    const totalConfirmed = await Submission.countDocuments({ status: 'CONFIRMED' });

    const allAssignments = await Assignment.find();
    let totalExpected = 0;

    for (const a of allAssignments) {
      if (a.target_type === 'ALL') {
        totalExpected += totalStudents;
      } else {
        const targetGroupRecords = await AssignmentTarget.find({ assignment_id: a._id }).select('group_id');
        const targetGroupIds = targetGroupRecords.map((t) => t.group_id);
        const targetedStudentCount = await GroupMember.countDocuments({ group_id: { $in: targetGroupIds } });
        totalExpected += targetedStudentCount;
      }
    }

    const pendingSubmissions = Math.max(0, totalExpected - totalConfirmed);
    const overallCompletionRate =
      totalExpected > 0 ? Number(((totalConfirmed / totalExpected) * 100).toFixed(2)) : 0;

    return {
      totalStudents,
      totalGroups,
      totalAssignments,
      totalConfirmedSubmissions: totalConfirmed,
      totalExpectedSubmissions: totalExpected,
      pendingSubmissions,
      overallCompletionRate,
    };
  }

  async getGroupAnalytics() {
    const groups = await Group.find().sort({ name: 1 });
    const results = [];

    for (const group of groups) {
      const memberCount = await GroupMember.countDocuments({ group_id: group._id });

      const submissionCount = await Submission.countDocuments({
        group_id: group._id,
        status: 'CONFIRMED',
      });

      const targetAssignmentRecords = await AssignmentTarget.find({ group_id: group._id }).select('assignment_id');
      const targetAssignmentIds = targetAssignmentRecords.map((t) => t.assignment_id);

      const eligibleCount = await Assignment.countDocuments({
        $or: [{ target_type: 'ALL' }, { _id: { $in: targetAssignmentIds } }],
      });

      const totalPossible = memberCount * eligibleCount;
      const rate = totalPossible > 0 ? Number(((submissionCount / totalPossible) * 100).toFixed(2)) : 0;

      results.push({
        group_id: group._id.toString(),
        group_name: group.name,
        total_members: memberCount,
        total_confirmed_submissions: submissionCount,
        eligible_assignments_count: eligibleCount,
        group_completion_rate: rate,
      });
    }

    return results.sort((a, b) => b.group_completion_rate - a.group_completion_rate);
  }

  async getStudentAnalytics() {
    const students = await User.find({ role: 'STUDENT' }).sort({ name: 1 });
    const results = [];

    for (const student of students) {
      const membership = await GroupMember.findOne({ user_id: student._id }).populate('group_id');
      const groupId = membership?.group_id?._id;

      const confirmedCount = await Submission.countDocuments({
        student_id: student._id,
        status: 'CONFIRMED',
      });

      let eligibleCount = 0;
      if (groupId) {
        const targetRecords = await AssignmentTarget.find({ group_id: groupId }).select('assignment_id');
        const targetIds = targetRecords.map((t) => t.assignment_id);
        eligibleCount = await Assignment.countDocuments({
          $or: [{ target_type: 'ALL' }, { _id: { $in: targetIds } }],
        });
      } else {
        eligibleCount = await Assignment.countDocuments({ target_type: 'ALL' });
      }

      const rate = eligibleCount > 0 ? Number(((confirmedCount / eligibleCount) * 100).toFixed(2)) : 0;

      results.push({
        student_id: student._id.toString(),
        student_name: student.name,
        email: student.email,
        roll_number: student.student_id,
        group_name: membership?.group_id?.name || 'No Group',
        completed_assignments: confirmedCount,
        eligible_assignments: eligibleCount,
        student_completion_rate: rate,
      });
    }

    return results.sort((a, b) => b.student_completion_rate - a.student_completion_rate);
  }
}

module.exports = new AnalyticsRepository();
