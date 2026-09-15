-- ============================================================================
-- DEVELOPMENT SEED DATA (Joineazy Task 1)
-- ============================================================================
-- Credentials:
-- Admin:    admin@university.edu  / Admin123!
-- Students: alex@student.edu      / Password123!
--           brianna@student.edu   / Password123!
--           carlos@student.edu    / Password123!
--           diana@student.edu     / Password123!
--           ethan@student.edu     / Password123!

-- 1. Reset Tables
TRUNCATE TABLE submissions, assignment_targets, assignments, group_members, groups, users CASCADE;

-- 2. Insert Users
INSERT INTO users (id, name, email, password_hash, role, student_id)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'Prof. Alan Turing', 'admin@university.edu', '$2a$10$1rfGJhp.Mm5AhOqR38ATyOasQz4MQyzQYFv/.CP47P4acwDQpsb8C', 'ADMIN', NULL),
  ('a0000000-0000-0000-0000-000000000002', 'Alex Johnson', 'alex@student.edu', '$2a$10$OLdRAV9HFpQ/Fpt3YPe.SenI0qAGJuoCn0iahNR4X09BBdbWsQu6e', 'STUDENT', 'STU1001'),
  ('a0000000-0000-0000-0000-000000000003', 'Brianna Smith', 'brianna@student.edu', '$2a$10$OLdRAV9HFpQ/Fpt3YPe.SenI0qAGJuoCn0iahNR4X09BBdbWsQu6e', 'STUDENT', 'STU1002'),
  ('a0000000-0000-0000-0000-000000000004', 'Carlos Mendez', 'carlos@student.edu', '$2a$10$OLdRAV9HFpQ/Fpt3YPe.SenI0qAGJuoCn0iahNR4X09BBdbWsQu6e', 'STUDENT', 'STU1003'),
  ('a0000000-0000-0000-0000-000000000005', 'Diana Prince', 'diana@student.edu', '$2a$10$OLdRAV9HFpQ/Fpt3YPe.SenI0qAGJuoCn0iahNR4X09BBdbWsQu6e', 'STUDENT', 'STU1004'),
  ('a0000000-0000-0000-0000-000000000006', 'Ethan Hunt', 'ethan@student.edu', '$2a$10$OLdRAV9HFpQ/Fpt3YPe.SenI0qAGJuoCn0iahNR4X09BBdbWsQu6e', 'STUDENT', 'STU1005');

-- 3. Insert Groups
INSERT INTO groups (id, name, created_by)
VALUES 
  ('b0000000-0000-0000-0000-000000000001', 'Cloud Architects Alpha', 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000002', 'Distributed Systems Beta', 'a0000000-0000-0000-0000-000000000004');

-- 4. Insert Group Members
INSERT INTO group_members (group_id, user_id)
VALUES 
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005');

-- 5. Insert Assignments
INSERT INTO assignments (id, title, description, due_date, onedrive_link, target_type, created_by)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'Assignment 1: Microservices Architecture Blueprint', 'Design a scalable e-commerce microservices architecture using Docker and Kubernetes. Submit your final system diagram and specification document to OneDrive.', NOW() + INTERVAL '7 days', 'https://onedrive.live.com/demo-assignment-1', 'ALL', 'a0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000002', 'Assignment 2: Distributed Consensus & Raft Protocol', 'Deep dive into Raft consensus implementation. Provide benchmark graphs and cluster node recovery reports in the OneDrive folder.', NOW() + INTERVAL '14 days', 'https://onedrive.live.com/demo-assignment-2', 'GROUPS', 'a0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000003', 'Assignment 3: PostgreSQL Query Optimization & Indexing', 'Analyze EXPLAIN ANALYZE query plans on multi-million row datasets and document B-Tree / GIN index tradeoffs.', NOW() + INTERVAL '21 days', 'https://onedrive.live.com/demo-assignment-3', 'ALL', 'a0000000-0000-0000-0000-000000000001');

-- 6. Insert Assignment Targets
INSERT INTO assignment_targets (assignment_id, group_id)
VALUES 
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001');

-- 7. Insert Submissions
INSERT INTO submissions (assignment_id, student_id, group_id, status, confirmed_at)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'CONFIRMED', NOW() - INTERVAL '2 days'),
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'CONFIRMED', NOW() - INTERVAL '1 days'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'CONFIRMED', NOW() - INTERVAL '6 hours');
