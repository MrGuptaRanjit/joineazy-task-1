const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { hashPassword } = require('../src/utils/password.util');
const {
  User,
  Group,
  GroupMember,
  Assignment,
  AssignmentTarget,
  Submission,
} = require('../src/models');

let mongod = null;

const setupTestDb = async () => {
  if (!mongod) {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }
  }

  // Clear all collections
  await Promise.all([
    User.deleteMany({}),
    Group.deleteMany({}),
    GroupMember.deleteMany({}),
    Assignment.deleteMany({}),
    AssignmentTarget.deleteMany({}),
    Submission.deleteMany({}),
  ]);

  // Seed standard test entities
  const adminHash = await hashPassword('Admin123!');
  const studentHash = await hashPassword('Password123!');

  const admin = await User.create({
    name: 'Prof. Alan Turing',
    email: 'admin@university.edu',
    password_hash: adminHash,
    role: 'ADMIN',
    student_id: null,
  });

  const students = await User.create([
    {
      name: 'Alex Johnson',
      email: 'alex@student.edu',
      password_hash: studentHash,
      role: 'STUDENT',
      student_id: 'STU1001',
    },
    {
      name: 'Brianna Smith',
      email: 'brianna@student.edu',
      password_hash: studentHash,
      role: 'STUDENT',
      student_id: 'STU1002',
    },
    {
      name: 'Carlos Mendez',
      email: 'carlos@student.edu',
      password_hash: studentHash,
      role: 'STUDENT',
      student_id: 'STU1003',
    },
    {
      name: 'Diana Prince',
      email: 'diana@student.edu',
      password_hash: studentHash,
      role: 'STUDENT',
      student_id: 'STU1004',
    },
    {
      name: 'Ethan Hunt',
      email: 'ethan@student.edu',
      password_hash: studentHash,
      role: 'STUDENT',
      student_id: 'STU1005',
    },
  ]);

  const [alex, brianna, carlos, diana, ethan] = students;

  const groupAlpha = await Group.create({
    name: 'Cloud Architects Alpha',
    created_by: alex._id,
  });

  const groupBeta = await Group.create({
    name: 'Distributed Systems Beta',
    created_by: carlos._id,
  });

  await GroupMember.create([
    { group_id: groupAlpha._id, user_id: alex._id, joined_at: new Date(Date.now() - 5000) },
    { group_id: groupAlpha._id, user_id: brianna._id, joined_at: new Date(Date.now() - 4000) },
    { group_id: groupBeta._id, user_id: carlos._id, joined_at: new Date(Date.now() - 3000) },
    { group_id: groupBeta._id, user_id: ethan._id, joined_at: new Date(Date.now() - 2000) },
  ]);

  const assignment1 = await Assignment.create({
    title: 'Assignment 1: Microservices Architecture Blueprint',
    description: 'System architecture specification',
    due_date: new Date(Date.now() + 7 * 86400000),
    onedrive_link: 'https://onedrive.live.com/demo-assignment-1',
    target_type: 'ALL',
    created_by: admin._id,
  });

  const assignment2 = await Assignment.create({
    title: 'Assignment 2: Distributed Consensus & Raft Protocol',
    description: 'Raft implementation reports',
    due_date: new Date(Date.now() + 14 * 86400000),
    onedrive_link: 'https://onedrive.live.com/demo-assignment-2',
    target_type: 'GROUPS',
    created_by: admin._id,
  });

  const assignment3 = await Assignment.create({
    title: 'Assignment 3: MongoDB Aggregation & Performance Tuning',
    description: 'MongoDB indexing and pipeline analysis',
    due_date: new Date(Date.now() + 21 * 86400000),
    onedrive_link: 'https://onedrive.live.com/demo-assignment-3',
    target_type: 'ALL',
    created_by: admin._id,
  });

  await AssignmentTarget.create({
    assignment_id: assignment2._id,
    group_id: groupAlpha._id,
  });

  await Submission.create({
    assignment_id: assignment1._id,
    student_id: alex._id,
    group_id: groupAlpha._id,
    status: 'CONFIRMED',
    confirmed_at: new Date(),
  });

  return {
    admin,
    students: { alex, brianna, carlos, diana, ethan },
    groups: { groupAlpha, groupBeta },
    assignments: { assignment1, assignment2, assignment3 },
  };
};

const closeTestDb = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = { setupTestDb, closeTestDb };
