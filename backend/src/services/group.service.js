const groupRepository = require('../repositories/group.repository');
const userRepository = require('../repositories/user.repository');
const AppError = require('../utils/appError');

class GroupService {
  async createGroup(userId, { name }) {
    // 1. Check if user already belongs to a group
    const existingGroup = await groupRepository.getGroupByUserId(userId);
    if (existingGroup) {
      throw new AppError('You are already a member of a group. You must leave your current group before creating a new one.', 409);
    }

    // 2. Check if group name already taken
    const existingName = await groupRepository.findByName(name);
    if (existingName) {
      throw new AppError('A group with this name already exists. Please choose a different name.', 409);
    }

    // 3. Create group with creator in atomic transaction
    const newGroup = await groupRepository.createGroupWithCreator(name, userId);
    const members = await groupRepository.getGroupMembers(newGroup.id);

    return {
      ...newGroup,
      members,
    };
  }

  async getMyGroup(userId) {
    const group = await groupRepository.getGroupByUserId(userId);
    if (!group) {
      return null;
    }

    const members = await groupRepository.getGroupMembers(group.id);
    return {
      ...group,
      members,
    };
  }

  async getGroupById(groupId) {
    const group = await groupRepository.findById(groupId);
    if (!group) {
      throw new AppError('Group not found.', 404);
    }

    const members = await groupRepository.getGroupMembers(groupId);
    return {
      ...group,
      members,
    };
  }

  async getAllGroups() {
    return await groupRepository.findAll();
  }

  async getGroupAudit(groupId) {
    const audit = await groupRepository.getGroupAudit(groupId);
    if (!audit) {
      throw new AppError('Group not found.', 404);
    }
    return audit;
  }

  async addMember(groupId, requestedByUserId, identifier) {
    // 1. Verify group exists
    const group = await groupRepository.findById(groupId);
    if (!group) {
      throw new AppError('Group not found.', 404);
    }

    // 2. Verify requester is part of this group
    const requesterGroup = await groupRepository.getGroupByUserId(requestedByUserId);
    if (!requesterGroup || requesterGroup.id !== groupId) {
      throw new AppError('Only active members of this group can invite/add students.', 403);
    }

    // 3. Find candidate student by email or student ID
    const student = await userRepository.findByIdentifier(identifier);
    if (!student) {
      throw new AppError(`No student account found with identifier '${identifier}'.`, 404);
    }

    if (student.role !== 'STUDENT') {
      throw new AppError('Only students can be added to a group.', 400);
    }

    // 4. Verify candidate is not already in any group
    const candidateGroup = await groupRepository.getGroupByUserId(student.id);
    if (candidateGroup) {
      throw new AppError(
        candidateGroup.id === groupId
          ? 'This student is already a member of this group.'
          : 'This student is already enrolled in another group.',
        409
      );
    }

    // 5. Add student to group
    await groupRepository.addMember(groupId, student.id);
    const updatedMembers = await groupRepository.getGroupMembers(groupId);

    return {
      message: `Student ${student.name} was successfully added to the group.`,
      members: updatedMembers,
    };
  }

  async removeMember(groupId, requestedByUserId, targetUserId) {
    const group = await groupRepository.findById(groupId);
    if (!group) {
      throw new AppError('Group not found.', 404);
    }

    // Check permissions: group creator can remove any member; members can remove themselves
    const isCreator = group.created_by === requestedByUserId;
    const isSelfRemoval = requestedByUserId === targetUserId;

    if (!isCreator && !isSelfRemoval) {
      throw new AppError('You do not have permission to remove this member from the group.', 403);
    }

    // Check if creator is removing themselves while others are in group
    if (isCreator && isSelfRemoval) {
      const members = await groupRepository.getGroupMembers(groupId);
      if (members.length > 1) {
        throw new AppError('As the group creator, you cannot leave while other members remain. Please remove other members or delete the group.', 400);
      }
    }

    const removed = await groupRepository.removeMember(groupId, targetUserId);
    if (!removed) {
      throw new AppError('Member not found in this group.', 404);
    }

    const updatedMembers = await groupRepository.getGroupMembers(groupId);
    return {
      message: 'Member removed successfully.',
      members: updatedMembers,
    };
  }
}

module.exports = new GroupService();
