const { Assignment, AssignmentTarget, Submission, Group, GroupMember, User } = require('../models');

class AssignmentRepository {
  async createAssignment({ title, description, dueDate, onedriveLink, targetType, createdBy, groupIds = [] }) {
    const assignment = await Assignment.create({
      title: title.trim(),
      description: description.trim(),
      due_date: new Date(dueDate),
      onedrive_link: onedriveLink.trim(),
      target_type: targetType || 'ALL',
      created_by: createdBy,
    });

    if (targetType === 'GROUPS' && Array.isArray(groupIds) && groupIds.length > 0) {
      const targetDocs = groupIds.map((groupId) => ({
        assignment_id: assignment._id,
        group_id: groupId,
      }));
      await AssignmentTarget.insertMany(targetDocs, { ordered: false }).catch(() => {});
    }

    return assignment.toJSON();
  }

  async updateAssignment(id, { title, description, dueDate, onedriveLink, targetType, groupIds }) {
    const updateFields = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (dueDate !== undefined) updateFields.due_date = new Date(dueDate);
    if (onedriveLink !== undefined) updateFields.onedrive_link = onedriveLink.trim();
    if (targetType !== undefined) updateFields.target_type = targetType;

    const updated = await Assignment.findByIdAndUpdate(id, updateFields, { new: true });
    if (!updated) return null;

    if (targetType === 'GROUPS' && Array.isArray(groupIds)) {
      await AssignmentTarget.deleteMany({ assignment_id: id });
      if (groupIds.length > 0) {
        const targetDocs = groupIds.map((groupId) => ({
          assignment_id: id,
          group_id: groupId,
        }));
        await AssignmentTarget.insertMany(targetDocs, { ordered: false }).catch(() => {});
      }
    } else if (targetType === 'ALL') {
      await AssignmentTarget.deleteMany({ assignment_id: id });
    }

    return updated.toJSON();
  }

  async deleteAssignment(id) {
    const deleted = await Assignment.findByIdAndDelete(id);
    if (!deleted) return null;

    await Promise.all([
      AssignmentTarget.deleteMany({ assignment_id: id }),
      Submission.deleteMany({ assignment_id: id }),
    ]);

    return deleted.toJSON();
  }

  async findById(id) {
    const assignment = await Assignment.findById(id).populate('created_by', 'name email');
    if (!assignment) return null;

    const targets = await AssignmentTarget.find({ assignment_id: id }).populate('group_id', 'name');
    const target_groups = targets
      .filter((t) => t.group_id != null)
      .map((t) => ({
        id: t.group_id._id.toString(),
        name: t.group_id.name,
      }));

    return {
      id: assignment._id.toString(),
      title: assignment.title,
      description: assignment.description,
      due_date: assignment.due_date,
      onedrive_link: assignment.onedrive_link,
      target_type: assignment.target_type,
      created_by: assignment.created_by?._id ? assignment.created_by._id.toString() : assignment.created_by.toString(),
      creator_name: assignment.created_by?.name || 'Admin',
      created_at: assignment.created_at,
      updated_at: assignment.updated_at,
      target_groups,
    };
  }

  async findAllForAdmin() {
    const assignments = await Assignment.find()
      .populate('created_by', 'name email')
      .sort({ due_date: 1 });

    const results = await Promise.all(
      assignments.map(async (a) => {
        const targets = await AssignmentTarget.find({ assignment_id: a._id }).populate('group_id', 'name');
        const target_groups = targets
          .filter((t) => t.group_id != null)
          .map((t) => ({
            id: t.group_id._id.toString(),
            name: t.group_id.name,
          }));

        const total_confirmed_submissions = await Submission.countDocuments({
          assignment_id: a._id,
          status: 'CONFIRMED',
        });

        return {
          id: a._id.toString(),
          title: a.title,
          description: a.description,
          due_date: a.due_date,
          onedrive_link: a.onedrive_link,
          target_type: a.target_type,
          created_by: a.created_by?._id ? a.created_by._id.toString() : a.created_by.toString(),
          creator_name: a.created_by?.name || 'Admin',
          created_at: a.created_at,
          updated_at: a.updated_at,
          target_groups,
          total_confirmed_submissions,
        };
      })
    );

    return results;
  }

  async findVisibleForStudent(studentId) {
    const membership = await GroupMember.findOne({ user_id: studentId });
    const studentGroupId = membership ? membership.group_id : null;

    let targetedAssignmentIds = [];
    if (studentGroupId) {
      const targets = await AssignmentTarget.find({ group_id: studentGroupId }).select('assignment_id');
      targetedAssignmentIds = targets.map((t) => t.assignment_id);
    }

    const assignments = await Assignment.find({
      $or: [{ target_type: 'ALL' }, { _id: { $in: targetedAssignmentIds } }],
    }).sort({ due_date: 1 });

    const results = await Promise.all(
      assignments.map(async (a) => {
        const sub = await Submission.findOne({
          assignment_id: a._id,
          student_id: studentId,
        });

        return {
          id: a._id.toString(),
          title: a.title,
          description: a.description,
          due_date: a.due_date,
          onedrive_link: a.onedrive_link,
          target_type: a.target_type,
          created_by: a.created_by.toString(),
          created_at: a.created_at,
          updated_at: a.updated_at,
          submission_status: sub ? sub.status : 'PENDING',
          confirmed_at: sub ? sub.confirmed_at : null,
          is_submitted: sub?.status === 'CONFIRMED',
        };
      })
    );

    return results;
  }

  async getStudentAssignmentDetails(assignmentId, studentId) {
    const membership = await GroupMember.findOne({ user_id: studentId }).populate('group_id');
    const studentGroup = membership?.group_id;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return null;

    if (assignment.target_type === 'GROUPS') {
      if (!studentGroup) return null;
      const isTargeted = await AssignmentTarget.findOne({
        assignment_id: assignmentId,
        group_id: studentGroup._id,
      });
      if (!isTargeted) return null;
    }

    const sub = await Submission.findOne({
      assignment_id: assignmentId,
      student_id: studentId,
    });

    return {
      id: assignment._id.toString(),
      title: assignment.title,
      description: assignment.description,
      due_date: assignment.due_date,
      onedrive_link: assignment.onedrive_link,
      target_type: assignment.target_type,
      created_by: assignment.created_by.toString(),
      created_at: assignment.created_at,
      updated_at: assignment.updated_at,
      submission_status: sub ? sub.status : 'PENDING',
      confirmed_at: sub ? sub.confirmed_at : null,
      is_submitted: sub?.status === 'CONFIRMED',
      student_group_id: studentGroup ? studentGroup._id.toString() : null,
      student_group_name: studentGroup ? studentGroup.name : null,
    };
  }
}

module.exports = new AssignmentRepository();
