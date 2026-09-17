const { User, Group, GroupMember } = require('../models');

class UserRepository {
  async findById(id) {
    const user = await User.findById(id).select('-password_hash');
    return user ? user.toJSON() : null;
  }

  async findByEmail(email) {
    if (!email) return null;
    const user = await User.findOne({ email: email.toLowerCase() });
    return user ? user.toJSON() : null;
  }

  async findByStudentId(studentId) {
    if (!studentId) return null;
    const user = await User.findOne({
      student_id: { $regex: new RegExp(`^${studentId.trim()}$`, 'i') },
    }).select('-password_hash');
    return user ? user.toJSON() : null;
  }

  async findByIdentifier(identifier) {
    if (!identifier) return null;
    const trimmed = identifier.trim();
    const user = await User.findOne({
      $or: [
        { email: trimmed.toLowerCase() },
        { student_id: { $regex: new RegExp(`^${trimmed}$`, 'i') } },
      ],
    }).select('-password_hash');
    return user ? user.toJSON() : null;
  }

  async createStudent({ name, email, passwordHash, studentId }) {
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role: 'STUDENT',
      student_id: studentId.toUpperCase(),
    });

    const userObj = user.toJSON();
    delete userObj.password_hash;
    return userObj;
  }

  async getUserWithGroup(userId) {
    const user = await User.findById(userId);
    if (!user) return null;

    const membership = await GroupMember.findOne({ user_id: user._id }).populate('group_id');
    const group = membership?.group_id;

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      student_id: user.student_id,
      group_id: group ? group._id.toString() : null,
      group_name: group ? group.name : null,
      group_joined_at: membership ? membership.joined_at : null,
      is_group_creator: group ? group.created_by.toString() === user._id.toString() : false,
    };
  }
}

module.exports = new UserRepository();
