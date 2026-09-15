-- Enable cryptographic extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    student_id VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT uq_users_student_id UNIQUE (student_id),
    CONSTRAINT chk_users_role CHECK (role IN ('STUDENT', 'ADMIN')),
    CONSTRAINT chk_student_id_format CHECK (
        (role = 'ADMIN' AND student_id IS NULL) OR
        (role = 'STUDENT' AND student_id IS NOT NULL AND length(trim(student_id)) > 0)
    )
);

-- ============================================================================
-- 2. GROUPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints & Foreign Keys
    CONSTRAINT uq_groups_name UNIQUE (name),
    CONSTRAINT fk_groups_created_by FOREIGN KEY (created_by) 
        REFERENCES users(id) ON DELETE RESTRICT
);

-- ============================================================================
-- 3. GROUP MEMBERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL,
    user_id UUID NOT NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints & Foreign Keys
    -- Enforces one active group membership per student
    CONSTRAINT uq_group_members_user UNIQUE (user_id),
    CONSTRAINT fk_group_members_group FOREIGN KEY (group_id) 
        REFERENCES groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_group_members_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- 4. ASSIGNMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    onedrive_link TEXT NOT NULL,
    target_type VARCHAR(20) NOT NULL DEFAULT 'ALL',
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints & Foreign Keys
    CONSTRAINT chk_assignments_target_type CHECK (target_type IN ('ALL', 'GROUPS')),
    CONSTRAINT chk_assignments_onedrive_link CHECK (onedrive_link ~* '^https?://.+'),
    CONSTRAINT fk_assignments_created_by FOREIGN KEY (created_by) 
        REFERENCES users(id) ON DELETE RESTRICT
);

-- ============================================================================
-- 5. ASSIGNMENT TARGETS TABLE (For Group-Targeted Assignments)
-- ============================================================================
CREATE TABLE IF NOT EXISTS assignment_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL,
    group_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints & Foreign Keys
    CONSTRAINT uq_assignment_target UNIQUE (assignment_id, group_id),
    CONSTRAINT fk_assignment_targets_assignment FOREIGN KEY (assignment_id) 
        REFERENCES assignments(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_targets_group FOREIGN KEY (group_id) 
        REFERENCES groups(id) ON DELETE CASCADE
);

-- ============================================================================
-- 6. SUBMISSIONS (CONFIRMATIONS) TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL,
    student_id UUID NOT NULL,
    group_id UUID,
    status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
    confirmed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints & Foreign Keys
    -- One confirmed submission per student per assignment
    CONSTRAINT uq_submissions_assignment_student UNIQUE (assignment_id, student_id),
    CONSTRAINT chk_submissions_status CHECK (status IN ('CONFIRMED', 'PENDING')),
    CONSTRAINT fk_submissions_assignment FOREIGN KEY (assignment_id) 
        REFERENCES assignments(id) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_student FOREIGN KEY (student_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_group FOREIGN KEY (group_id) 
        REFERENCES groups(id) ON DELETE SET NULL
);

-- ============================================================================
-- 7. INDEXES FOR QUERY OPTIMIZATION
-- ============================================================================
-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Group Members
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);

-- Assignments
CREATE INDEX IF NOT EXISTS idx_assignments_created_by ON assignments(created_by);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_target_type ON assignments(target_type);

-- Assignment Targets
CREATE INDEX IF NOT EXISTS idx_assignment_targets_assignment ON assignment_targets(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_targets_group ON assignment_targets(group_id);

-- Submissions
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_group ON submissions(group_id);
CREATE INDEX IF NOT EXISTS idx_submissions_confirmed_at ON submissions(confirmed_at);
