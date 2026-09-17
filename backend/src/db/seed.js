const mongoose = require('mongoose');
const { hashPassword } = require('../utils/password.util');
const { connectDB, disconnectDB } = require('./index');
const {
  User,
  Group,
  GroupMember,
  Assignment,
  AssignmentTarget,
  Submission,
} = require('../models');

const runSeed = async () => {
  try {
    console.log('\n==================================================');
    console.log(' Starting MongoDB Demo Database Seeding...');
    console.log('==================================================\n');

    await connectDB();

    // 1. Clean existing collections
    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Group.deleteMany({}),
      GroupMember.deleteMany({}),
      Assignment.deleteMany({}),
      AssignmentTarget.deleteMany({}),
      Submission.deleteMany({}),
    ]);
    console.log(' Collections cleared.');

    // 2. Generate password hashes
    const defaultPasswordHash = await hashPassword('Password123!');
    const adminPasswordHash = await hashPassword('Admin123!');

    // 3. Seed Users
    console.log(' Seeding users...');
    const adminUser = await User.create({
      name: 'Prof. Alan Turing',
      email: 'admin@university.edu',
      password_hash: adminPasswordHash,
      role: 'ADMIN',
      student_id: null,
    });

    const students = await User.create([
      {
        name: 'Alex Johnson',
        email: 'alex@student.edu',
        password_hash: defaultPasswordHash,
        role: 'STUDENT',
        student_id: 'STU1001',
      },
      {
        name: 'Brianna Smith',
        email: 'brianna@student.edu',
        password_hash: defaultPasswordHash,
        role: 'STUDENT',
        student_id: 'STU1002',
      },
      {
        name: 'Carlos Mendez',
        email: 'carlos@student.edu',
        password_hash: defaultPasswordHash,
        role: 'STUDENT',
        student_id: 'STU1003',
      },
      {
        name: 'Diana Prince',
        email: 'diana@student.edu',
        password_hash: defaultPasswordHash,
        role: 'STUDENT',
        student_id: 'STU1004',
      },
      {
        name: 'Ethan Hunt',
        email: 'ethan@student.edu',
        password_hash: defaultPasswordHash,
        role: 'STUDENT',
        student_id: 'STU1005',
      },
    ]);

    const [alex, brianna, carlos, diana, ethan] = students;
    console.log(` Users seeded: 1 Admin, ${students.length} Students.`);

    // 4. Seed Groups
    console.log('👥 Seeding groups...');
    const groupAlpha = await Group.create({
      name: 'Cloud Architects Alpha',
      created_by: alex._id,
    });

    const groupBeta = await Group.create({
      name: 'Distributed Systems Beta',
      created_by: carlos._id,
    });

    // 5. Seed Group Members
    console.log(' Seeding group members...');
    await GroupMember.create([
      // Group Alpha members
      { group_id: groupAlpha._id, user_id: alex._id, joined_at: new Date(Date.now() - 5 * 86400000) },
      { group_id: groupAlpha._id, user_id: brianna._id, joined_at: new Date(Date.now() - 4 * 86400000) },
      { group_id: groupAlpha._id, user_id: diana._id, joined_at: new Date(Date.now() - 3 * 86400000) },
      // Group Beta members
      { group_id: groupBeta._id, user_id: carlos._id, joined_at: new Date(Date.now() - 4 * 86400000) },
      { group_id: groupBeta._id, user_id: ethan._id, joined_at: new Date(Date.now() - 2 * 86400000) },
    ]);
    console.log(' Group memberships established.');

    // 6. Seed Assignments
    console.log('📚 Seeding coursework assignments...');
    const now = new Date();
    const assignment1 = await Assignment.create({
      title: 'Assignment 1: Distributed Systems & Microservices Project',
      description:
        'Architect and deploy a resilient microservices application with inter-service communication, circuit breaking, and load balancing across Docker containers.',
      due_date: new Date(now.getTime() + 7 * 86400000), // +7 days
      onedrive_link: 'https://onedrive.live.com/view.aspx?resid=Joineazy-Microservices-Lab-Folder',
      target_type: 'ALL',
      created_by: adminUser._id,
    });

    const assignment2 = await Assignment.create({
      title: 'Assignment 2: Cloud Infrastructure & Docker Deployment',
      description:
        'Configure multi-container orchestration using Docker Compose, reverse proxy routing with NGINX, and zero-downtime deployment pipelines.',
      due_date: new Date(now.getTime() + 14 * 86400000), // +14 days
      onedrive_link: 'https://onedrive.live.com/view.aspx?resid=Joineazy-Cloud-Infra-Lab-Folder',
      target_type: 'GROUPS',
      created_by: adminUser._id,
    });

    const assignment3 = await Assignment.create({
      title: 'Assignment 3: Advanced Full-Stack Security & Auth Hardening',
      description:
        'Implement role-based access control, cryptographic password hashing, stateless JWT session verification, and OWASP Top 10 mitigation strategies.',
      due_date: new Date(now.getTime() + 21 * 86400000), // +21 days
      onedrive_link: 'https://onedrive.live.com/view.aspx?resid=Joineazy-Security-Hardening-Folder',
      target_type: 'ALL',
      created_by: adminUser._id,
    });

    // Target Assignment 2 specifically to Group Alpha
    await AssignmentTarget.create({
      assignment_id: assignment2._id,
      group_id: groupAlpha._id,
    });
    console.log(' Assignments and targets created.');

    // 7. Seed Submissions (Confirmations)
    console.log(' Submitting initial confirmations...');
    await Submission.create([
      {
        assignment_id: assignment1._id,
        student_id: alex._id,
        group_id: groupAlpha._id,
        status: 'CONFIRMED',
        confirmed_at: new Date(Date.now() - 1 * 86400000),
      },
      {
        assignment_id: assignment1._id,
        student_id: brianna._id,
        group_id: groupAlpha._id,
        status: 'CONFIRMED',
        confirmed_at: new Date(Date.now() - 12 * 3600000),
      },
      {
        assignment_id: assignment1._id,
        student_id: carlos._id,
        group_id: groupBeta._id,
        status: 'CONFIRMED',
        confirmed_at: new Date(Date.now() - 6 * 3600000),
      },
    ]);
    console.log(' Submissions recorded.');

    console.log('\n==================================================');
    console.log(' MongoDB database successfully seeded with demo data!');
    console.log('==================================================');
    console.log(' Accounts for testing:');
    console.log('   Admin:   admin@university.edu / Admin123!');
    console.log('   Student: alex@student.edu    / Password123!');
    console.log('   Student: carlos@student.edu  / Password123!');
    console.log('==================================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ MongoDB Seeding failed:', error);
    await disconnectDB();
    process.exit(1);
  }
};

if (require.main === module) {
  runSeed();
}

module.exports = runSeed;
