const userRepository = require('../repositories/user.repository');
const { hashPassword, comparePassword } = require('../utils/password.util');
const { generateToken } = require('../utils/jwt.util');
const AppError = require('../utils/appError');

class AuthService {
  async registerStudent({ name, email, password, student_id }) {
    // 1. Check if email already registered
    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    // 2. Check if student_id already registered
    const existingStudentId = await userRepository.findByStudentId(student_id);
    if (existingStudentId) {
      throw new AppError('A student with this Student ID is already registered.', 409);
    }

    // 3. Hash password
    const passwordHash = await hashPassword(password);

    // 4. Create STUDENT user record (Enforce role: 'STUDENT')
    const newUser = await userRepository.createStudent({
      name,
      email,
      passwordHash,
      studentId: student_id,
    });

    // 5. Generate JWT token
    const token = generateToken({
      id: newUser.id,
      role: newUser.role,
    });

    return {
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        student_id: newUser.student_id,
      },
    };
  }

  async login({ email, password }) {
    // 1. Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    // 2. Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    // 3. Generate JWT token
    const token = generateToken({
      id: user.id,
      role: user.role,
    });

    // 4. Fetch group details if student
    const userWithGroup = await userRepository.getUserWithGroup(user.id);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        student_id: user.student_id,
        group: userWithGroup?.group_id ? {
          id: userWithGroup.group_id,
          name: userWithGroup.group_name,
          is_creator: userWithGroup.is_group_creator,
        } : null,
      },
    };
  }

  async getCurrentUserProfile(userId) {
    const userProfile = await userRepository.getUserWithGroup(userId);
    if (!userProfile) {
      throw new AppError('User profile not found.', 404);
    }

    return {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      role: userProfile.role,
      student_id: userProfile.student_id,
      group: userProfile.group_id ? {
        id: userProfile.group_id,
        name: userProfile.group_name,
        is_creator: userProfile.is_group_creator,
        joined_at: userProfile.group_joined_at,
      } : null,
    };
  }
}

module.exports = new AuthService();
