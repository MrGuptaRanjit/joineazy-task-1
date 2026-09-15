const { newDb } = require('pg-mem');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { hashPassword } = require('../src/utils/password.util');

const setupTestDb = async () => {
  const mem = newDb();

  // Register uuid & string functions as impure (non-deterministic)
  mem.public.registerFunction({
    name: 'gen_random_uuid',
    impure: true,
    implementation: () => crypto.randomUUID(),
  });

  mem.public.registerFunction({
    name: 'trim',
    args: ['text'],
    returns: 'text',
    implementation: (str) => (str ? str.trim() : ''),
  });

  mem.public.registerFunction({
    name: 'length',
    args: ['text'],
    returns: 'integer',
    implementation: (str) => (str ? str.length : 0),
  });

  mem.public.registerFunction({
    name: 'round',
    args: ['numeric', 'integer'],
    returns: 'numeric',
    implementation: (num, dec) => Number(Number(num).toFixed(dec || 0)),
  });

  // Load and modify schema for in-memory compatibility
  let schema = fs.readFileSync(path.join(__dirname, '../src/db/schema.sql'), 'utf-8');
  schema = schema.replace(/CREATE EXTENSION IF NOT EXISTS "pgcrypto";/g, '');
  schema = schema.replace(/CREATE EXTENSION IF NOT EXISTS "uuid-ossp";/g, '');
  schema = schema.replace(/CONSTRAINT chk_student_id_format [^,;]+,/g, '');
  schema = schema.replace(/CONSTRAINT chk_assignments_onedrive_link [^,;]+,/g, '');
  
  // Apply schema
  mem.public.none(schema);

  // Seed test users
  const adminHash = await hashPassword('Admin123!');
  const studentHash = await hashPassword('Password123!');

  mem.public.none(`
    INSERT INTO users (id, name, email, password_hash, role, student_id)
    VALUES 
      ('a0000000-0000-0000-0000-000000000001', 'Prof. Alan Turing', 'admin@university.edu', '${adminHash}', 'ADMIN', NULL),
      ('a0000000-0000-0000-0000-000000000002', 'Alex Johnson', 'alex@student.edu', '${studentHash}', 'STUDENT', 'STU1001'),
      ('a0000000-0000-0000-0000-000000000003', 'Brianna Smith', 'brianna@student.edu', '${studentHash}', 'STUDENT', 'STU1002'),
      ('a0000000-0000-0000-0000-000000000004', 'Carlos Mendez', 'carlos@student.edu', '${studentHash}', 'STUDENT', 'STU1003'),
      ('a0000000-0000-0000-0000-000000000005', 'Diana Prince', 'diana@student.edu', '${studentHash}', 'STUDENT', 'STU1004'),
      ('a0000000-0000-0000-0000-000000000006', 'Ethan Hunt', 'ethan@student.edu', '${studentHash}', 'STUDENT', 'STU1005');

    INSERT INTO groups (id, name, created_by)
    VALUES 
      ('b0000000-0000-0000-0000-000000000001', 'Cloud Architects Alpha', 'a0000000-0000-0000-0000-000000000002'),
      ('b0000000-0000-0000-0000-000000000002', 'Distributed Systems Beta', 'a0000000-0000-0000-0000-000000000004');

    INSERT INTO group_members (id, group_id, user_id)
    VALUES 
      ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002'),
      ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003'),
      ('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004'),
      ('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005');

    INSERT INTO assignments (id, title, description, due_date, onedrive_link, target_type, created_by)
    VALUES 
      ('c0000000-0000-0000-0000-000000000001', 'Assignment 1: Microservices Architecture Blueprint', 'System architecture specification', NOW() + INTERVAL '7 days', 'https://onedrive.live.com/demo-assignment-1', 'ALL', 'a0000000-0000-0000-0000-000000000001'),
      ('c0000000-0000-0000-0000-000000000002', 'Assignment 2: Distributed Consensus & Raft Protocol', 'Raft implementation reports', NOW() + INTERVAL '14 days', 'https://onedrive.live.com/demo-assignment-2', 'GROUPS', 'a0000000-0000-0000-0000-000000000001'),
      ('c0000000-0000-0000-0000-000000000003', 'Assignment 3: PostgreSQL Query Optimization & Indexing', 'PostgreSQL indexing analysis', NOW() + INTERVAL '21 days', 'https://onedrive.live.com/demo-assignment-3', 'ALL', 'a0000000-0000-0000-0000-000000000001');

    INSERT INTO assignment_targets (id, assignment_id, group_id)
    VALUES 
      ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001');

    INSERT INTO submissions (id, assignment_id, student_id, group_id, status, confirmed_at)
    VALUES 
      ('f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'CONFIRMED', NOW());
  `);

  const pgAdapter = mem.adapters.createPg();
  const pool = new pgAdapter.Pool();

  return pool;
};

module.exports = { setupTestDb };
