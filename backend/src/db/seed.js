const { hashPassword } = require('../utils/password.util');
const db = require('./index');

const runSeed = async () => {
  try {
    console.log(' Starting database seeding...');

    // 1. Generate password hashes
    const defaultPasswordHash = await hashPassword('Password123!');
    const adminPasswordHash = await hashPassword('Admin123!');

    // 2. Clean existing tables
    await db.query(`
      TRUNCATE TABLE submissions, assignment_targets, assignments, group_members, groups, users CASCADE;
    `);

    // 3. Seed Users
    const usersQuery = `
      INSERT INTO users (id, name, email, password_hash, role, student_id)
      VALUES 
        ('a0000000-0000-0000-0000-000000000001', 'Prof. Alan Turing', 'admin@university.edu', $1, 'ADMIN', NULL),
        ('a0000000-0000-0000-0000-000000000002', 'Alex Johnson', 'alex@student.edu', $2, 'STUDENT', 'STU1001'),
        ('a0000000-0000-0000-0000-000000000003', 'Brianna Smith', 'brianna@student.edu', $2, 'STUDENT', 'STU1002'),
        ('a0000000-0000-0000-0000-000000000004', 'Carlos Mendez', 'carlos@student.edu', $2, 'STUDENT', 'STU1003'),
        ('a0000000-0000-0000-0000-000000000005', 'Diana Prince', 'diana@student.edu', $2, 'STUDENT', 'STU1004'),
        ('a0000000-0000-0000-0000-000000000006', 'Ethan Hunt', 'ethan@student.edu', $2, 'STUDENT', 'STU1005')
      RETURNING id, name, email, role, student_id;
    `;
    await db.query(usersQuery, [adminPasswordHash, defaultPasswordHash]);
    console.log(' Users seeded (1 Admin, 5 Students).');

    // 4. Seed Groups
    const groupsQuery = `
      INSERT INTO groups (id, name, created_by)
      VALUES 
        ('b0000000-0000-0000-0000-000000000001', 'Cloud Architects Alpha', 'a0000000-0000-0000-0000-000000000002'),
        ('b0000000-0000-0000-0000-000000000002', 'Distributed Systems Beta', 'a0000000-0000-0000-0000-000000000004')
      RETURNING id, name;
    `;
    await db.query(groupsQuery);
    console.log(' Groups seeded (2 Groups).');

    // 5. Seed Group Members
    const membersQuery = `
      INSERT INTO group_members (group_id, user_id)
      VALUES 
        ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002'),
        ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003'),
        ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004'),
        ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005');
    `;
    await db.query(membersQuery);
    console.log(' Group members seeded.');

    // 6. Seed Assignments
    const assignmentsQuery = `
      INSERT INTO assignments (id, title, description, due_date, onedrive_link, target_type, created_by)
      VALUES 
        ('c0000000-0000-0000-0000-000000000001', 'Assignment 1: Microservices Architecture Blueprint', 'Design a scalable e-commerce microservices architecture using Docker and Kubernetes. Submit your final system diagram and specification document to OneDrive.', NOW() + INTERVAL '7 days', 'https://onedrive.live.com/demo-assignment-1', 'ALL', 'a0000000-0000-0000-0000-000000000001'),
        ('c0000000-0000-0000-0000-000000000002', 'Assignment 2: Distributed Consensus & Raft Protocol', 'Deep dive into Raft consensus implementation. Provide benchmark graphs and cluster node recovery reports in the OneDrive folder.', NOW() + INTERVAL '14 days', 'https://onedrive.live.com/demo-assignment-2', 'GROUPS', 'a0000000-0000-0000-0000-000000000001'),
        ('c0000000-0000-0000-0000-000000000003', 'Assignment 3: PostgreSQL Query Optimization & Indexing', 'Analyze EXPLAIN ANALYZE query plans on multi-million row datasets and document B-Tree / GIN index tradeoffs.', NOW() + INTERVAL '21 days', 'https://onedrive.live.com/demo-assignment-3', 'ALL', 'a0000000-0000-0000-0000-000000000001');
    `;
    await db.query(assignmentsQuery);
    console.log(' Assignments seeded (3 Assignments).');

    // 7. Seed Assignment Targets (Assignment 2 -> Cloud Architects Alpha)
    const targetsQuery = `
      INSERT INTO assignment_targets (assignment_id, group_id)
      VALUES 
        ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001');
    `;
    await db.query(targetsQuery);
    console.log(' Assignment targets seeded.');

    // 8. Seed Submissions (Confirmed & Pending statuses)
    const submissionsQuery = `
      INSERT INTO submissions (assignment_id, student_id, group_id, status, confirmed_at)
      VALUES 
        ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'CONFIRMED', NOW() - INTERVAL '2 days'),
        ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'CONFIRMED', NOW() - INTERVAL '1 days'),
        ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'CONFIRMED', NOW() - INTERVAL '6 hours');
    `;
    await db.query(submissionsQuery);
    console.log(' Submissions seeded.');

    console.log('\n Seed Data Summary:');
    console.log('======================================================');
    console.log('Admin Account:   admin@university.edu  / Admin123!');
    console.log('Student 1:       alex@student.edu      / Password123! (ID: STU1001, Group Alpha)');
    console.log('Student 2:       brianna@student.edu   / Password123! (ID: STU1002, Group Alpha)');
    console.log('Student 3:       carlos@student.edu    / Password123! (ID: STU1003, Group Beta)');
    console.log('Student 4:       diana@student.edu     / Password123! (ID: STU1004, Group Beta)');
    console.log('Student 5 (No Group): ethan@student.edu / Password123! (ID: STU1005)');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error(' Seeding failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  runSeed();
}

module.exports = runSeed;
