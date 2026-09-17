const { Group, GroupMember, User, Assignment, AssignmentTarget, Submission } = require('../models');

class GroupRepository {
  async createGroupWithCreator(name, creatorId) {
    const group = await Group.create({
      name: name.trim(),
      created_by: creatorId,
    });

    await GroupMember.create({
      group_id: group._id,
      user_id: creatorId,
      joined_at: new Date(),
    });

    return group.toJSON();
  }

  async findByName(name) {
    if (!name) return null;
    const group = await Group.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });
    return group ? group.toJSON() : null;
  }

  async findById(id) {
    const group = await Group.findById(id).populate('created_by', 'name email');
    if (!group) return null;

    return {
      id: group._id.toString(),
      name: group.name,
      created_by: group.created_by?._id ? group.created_by._id.toString() : group.created_by.toString(),
      creator_name: group.created_by?.name || 'Unknown',
      creator_email: group.created_by?.email || '',
      created_at: group.created_at,
      updated_at: group.updated_at,
    };
  }

  async getGroupByUserId(userId) {
    const membership = await GroupMember.findOne({ user_id: userId }).populate('group_id');
    if (!membership || !membership.group_id) return null;

    const group = membership.group_id;
    return {
      id: group._id.toString(),
      name: group.name,
      created_by: group.created_by.toString(),
      created_at: group.created_at,
      updated_at: group.updated_at,
      is_creator: group.created_by.toString() === userId.toString(),
    };
  }

  async getGroupMembers(groupId) {
    const group = await Group.findById(groupId);
    if (!group) return [];

    const memberships = await GroupMember.find({ group_id: groupId })
      .populate('user_id', 'name email student_id')
      .sort({ joined_at: 1 });

    const members = memberships
      .filter((m) => m.user_id != null)
      .map((m) => {
        const u = m.user_id;
        const isCreator = group.created_by.toString() === u._id.toString();
        return {
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          student_id: u.student_id,
          joined_at: m.joined_at,
          is_creator: isCreator,
        };
      });

    // Sort creators first, then by joined_at
    return members.sort((a, b) => (b.is_creator ? 1 : 0) - (a.is_creator ? 1 : 0));
  }

  async addMember(groupId, userId) {
    const membership = await GroupMember.create({
      group_id: groupId,
      user_id: userId,
      joined_at: new Date(),
    });
    return membership.toJSON();
  }

  async removeMember(groupId, userId) {
    const deleted = await GroupMember.findOneAndDelete({
      group_id: groupId,
      user_id: userId,
    });
    return deleted ? deleted.toJSON() : null;
  }

  async findAll() {
    const groups = await Group.find()
      .populate('created_by', 'name email')
      .sort({ created_at: -1 });

    const results = await Promise.all(
      groups.map(async (g) => {
        const memberCount = await GroupMember.countDocuments({ group_id: g._id });
        return {
          id: g._id.toString(),
          name: g.name,
          created_by: g.created_by?._id ? g.created_by._id.toString() : g.created_by.toString(),
          creator_name: g.created_by?.name || 'Unknown',
          created_at: g.created_at,
          member_count: memberCount,
        };
      })
    );

    return results;
  }

  async getGroupAudit(groupId) {
    const group = await this.findById(groupId);
    if (!group) return null;

    const members = await this.getGroupMembers(groupId);

    // Find assignments targeted to ALL or targeted to this group
    const targetedRecords = await AssignmentTarget.find({ group_id: groupId }).select('assignment_id');
    const targetedAssignmentIds = targetedRecords.map((t) => t.assignment_id);

    const assignments = await Assignment.find({
      $or: [{ target_type: 'ALL' }, { _id: { $in: targetedAssignmentIds } }],
    }).sort({ due_date: 1 });

    const assignmentsWithSubmissions = [];
    let totalConfirmedOverall = 0;

    for (const a of assignments) {
      const memberStatuses = [];
      let confirmedCount = 0;

      for (const m of members) {
        const submission = await Submission.findOne({
          assignment_id: a._id,
          student_id: m.id,
          status: 'CONFIRMED',
        });

        const isConfirmed = !!submission;
        if (isConfirmed) confirmedCount++;

        memberStatuses.push({
          student_id: m.id,
          student_name: m.name,
          email: m.email,
          roll_number: m.student_id,
          status: isConfirmed ? 'CONFIRMED' : 'PENDING',
          confirmed_at: submission ? submission.confirmed_at : null,
        });
      }

      totalConfirmedOverall += confirmedCount;
      const totalMembers = members.length;
      const rate = totalMembers > 0 ? Number(((confirmedCount / totalMembers) * 100).toFixed(2)) : 0;

      assignmentsWithSubmissions.push({
        id: a._id.toString(),
        title: a.title,
        due_date: a.due_date,
        target_type: a.target_type,
        onedrive_link: a.onedrive_link,
        total_members: totalMembers,
        confirmed_count: confirmedCount,
        pending_count: totalMembers - confirmedCount,
        completion_percentage: rate,
        member_statuses: memberStatuses,
      });
    }

    const totalPossibleSubmissions = members.length * assignments.length;
    const overallCompletionRate =
      totalPossibleSubmissions > 0
        ? Number(((totalConfirmedOverall / totalPossibleSubmissions) * 100).toFixed(2))
        : 0;

    return {
      group,
      members,
      overall_completion_rate: overallCompletionRate,
      assignments: assignmentsWithSubmissions,
    };
  }
}

module.exports = new GroupRepository();
