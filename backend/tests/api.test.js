const request = require('supertest');
const { setupTestDb, closeTestDb } = require('./testDb');
const app = require('../src/app');

describe('Joineazy Task 1 - Comprehensive MERN Backend API Verification', () => {
  let studentToken = '';
  let adminToken = '';
  let unassignedStudentToken = '';
  let createdGroupId = '';
  let createdAssignmentId = '';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test_jwt_secret_key_32_characters_long_min';
    await setupTestDb();

    // Obtain student token (Alex - STU1001, in Group Alpha)
    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alex@student.edu', password: 'Password123!' });
    studentToken = studentLogin.body.data.token;

    // Obtain admin token (Prof. Alan Turing)
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@university.edu', password: 'Admin123!' });
    adminToken = adminLogin.body.data.token;

    // Obtain unassigned student token (Diana - STU1004, no group in test seed)
    const unassignedLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'diana@student.edu', password: 'Password123!' });
    unassignedStudentToken = unassignedLogin.body.data.token;
  });

  afterAll(async () => {
    await closeTestDb();
  });

  describe('1. Health Check Endpoint', () => {
    it('GET /api/health returns 200 OK and database: connected', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Joineazy API is running');
      expect(res.body.database).toBe('connected');
    });
  });

  describe('2. Student Registration & Validation', () => {
    it('POST /api/auth/register registers student and enforces role=STUDENT', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Grace Hopper',
          email: 'grace@student.edu',
          password: 'Password123!',
          student_id: 'STU1007',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('STUDENT');
      expect(res.body.data.user.email).toBe('grace@student.edu');
      expect(res.body.data.token).toBeDefined();
    });

    it('POST /api/auth/register rejects missing required fields with 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: '', email: 'not-an-email', password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('POST /api/auth/register rejects duplicate email with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Alex',
          email: 'alex@student.edu',
          password: 'Password123!',
          student_id: 'STU9999',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('POST /api/auth/register rejects duplicate student_id with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another Alex',
          email: 'unique_student@student.edu',
          password: 'Password123!',
          student_id: 'STU1001',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Student ID is already registered');
    });
  });

  describe('3. Login Flow & Credentials Handling', () => {
    it('POST /api/auth/login with valid student credentials returns 200 and token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alex@student.edu', password: 'Password123!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('STUDENT');
    });

    it('POST /api/auth/login with valid admin credentials returns 200 and token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@university.edu', password: 'Admin123!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('ADMIN');
    });

    it('POST /api/auth/login with invalid password returns 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alex@student.edu', password: 'WrongPassword!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login with nonexistent email returns 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'unknown@student.edu', password: 'Password123!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('4. JWT Authentication & Role-Based Authorization (RBAC)', () => {
    it('GET /api/auth/me without token returns 401 Unauthorized', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me with student token returns 200 OK and student profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('alex@student.edu');
      expect(res.body.data.role).toBe('STUDENT');
      expect(res.body.data.group).toBeDefined();
    });

    it('STUDENT accessing ADMIN-only route is blocked with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/admin/assignments')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Forbidden');
    });

    it('ADMIN accessing ADMIN-only route is granted access with 200 OK', async () => {
      const res = await request(app)
        .get('/api/admin/assignments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('5. Group Management & Single-Group Constraint', () => {
    it('Student already enrolled in a group cannot create another group (409 Conflict)', async () => {
      const res = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ name: 'Another Alpha Group' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already a member of a group');
    });

    it('Unassigned student can successfully create a new group', async () => {
      const res = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${unassignedStudentToken}`)
        .send({ name: 'Quantum Computing Squad' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Quantum Computing Squad');
      createdGroupId = res.body.data.id;
    });

    it('GET /api/groups/my returns current student group details and members', async () => {
      const res = await request(app)
        .get('/api/groups/my')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Cloud Architects Alpha');
      expect(Array.isArray(res.body.data.members)).toBe(true);
    });

    it('POST /api/groups/:id/members invites/adds student by email or ID', async () => {
      // Add Grace (STU1007) to Quantum Computing Squad
      const res = await request(app)
        .post(`/api/groups/${createdGroupId}/members`)
        .set('Authorization', `Bearer ${unassignedStudentToken}`)
        .send({ identifier: 'STU1007' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('successfully added');
    });

    it('POST /api/groups/:id/members rejects adding student who already belongs to a group (409)', async () => {
      const res = await request(app)
        .post(`/api/groups/${createdGroupId}/members`)
        .set('Authorization', `Bearer ${unassignedStudentToken}`)
        .send({ identifier: 'alex@student.edu' }); // Alex is in Alpha

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already');
    });

    it('Student can leave a group and subsequently join another group', async () => {
      // Login as Grace Hopper
      const graceLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'grace@student.edu', password: 'Password123!' });
      const graceToken = graceLogin.body.data.token;
      const graceUserId = graceLogin.body.data.user.id;

      // Grace removes herself from Quantum Computing Squad
      const leaveRes = await request(app)
        .delete(`/api/groups/${createdGroupId}/members/${graceUserId}`)
        .set('Authorization', `Bearer ${graceToken}`);

      expect(leaveRes.status).toBe(200);

      // Now Alex can invite Grace to Cloud Architects Alpha
      const myGroupRes = await request(app)
        .get('/api/groups/my')
        .set('Authorization', `Bearer ${studentToken}`);
      const alphaGroupId = myGroupRes.body.data.id;

      const joinRes = await request(app)
        .post(`/api/groups/${alphaGroupId}/members`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ identifier: 'STU1007' });

      expect(joinRes.status).toBe(200);
      expect(joinRes.body.message).toContain('successfully added');
    });
  });

  describe('6. Assignment Management & Targeting', () => {
    it('Admin creates an assignment targeted to specific group', async () => {
      const res = await request(app)
        .post('/api/admin/assignments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Assignment 4: Quantum Cryptography Lattice',
          description: 'Explore lattice-based cryptography schemes against Shor algorithm.',
          due_date: new Date(Date.now() + 86400000 * 10).toISOString(),
          onedrive_link: 'https://onedrive.live.com/demo-assignment-4',
          target_type: 'GROUPS',
          group_ids: [createdGroupId],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toContain('Quantum Cryptography');
      createdAssignmentId = res.body.data.id;
    });

    it('Student in targeted group sees the targeted assignment', async () => {
      const res = await request(app)
        .get('/api/assignments')
        .set('Authorization', `Bearer ${unassignedStudentToken}`); // Diana is in Quantum Squad

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const hasTargeted = res.body.data.some((a) => a.id === createdAssignmentId);
      expect(hasTargeted).toBe(true);
    });

    it('Student outside targeted group does not see non-targeted group assignment', async () => {
      const res = await request(app)
        .get('/api/assignments')
        .set('Authorization', `Bearer ${studentToken}`); // Alex is in Alpha

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const hasTargeted = res.body.data.some((a) => a.id === createdAssignmentId);
      expect(hasTargeted).toBe(false);
    });
  });

  describe('7. Two-Step Submission Confirmation Flow', () => {
    it('Student cannot submit without step-1 acknowledgment (is_confirmed: true)', async () => {
      const res = await request(app)
        .post(`/api/assignments/${createdAssignmentId}/submission/confirm`)
        .set('Authorization', `Bearer ${unassignedStudentToken}`)
        .send({ is_confirmed: false });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('Student completes two-step submission confirmation', async () => {
      const res = await request(app)
        .post(`/api/assignments/${createdAssignmentId}/submission/confirm`)
        .set('Authorization', `Bearer ${unassignedStudentToken}`)
        .send({ is_confirmed: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('CONFIRMED');
    });

    it('Duplicate submission confirmation is rejected with 409 Conflict', async () => {
      const res = await request(app)
        .post(`/api/assignments/${createdAssignmentId}/submission/confirm`)
        .set('Authorization', `Bearer ${unassignedStudentToken}`)
        .send({ is_confirmed: true });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already confirmed');
    });

    it('Admin can audit assignment submissions matrix', async () => {
      const res = await request(app)
        .get(`/api/admin/assignments/${createdAssignmentId}/submissions`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.studentSubmissions).toBeDefined();
      expect(res.body.data.groupSummary).toBeDefined();
    });
  });

  describe('8. Admin Analytics Engine', () => {
    it('GET /api/admin/analytics/overview returns KPI cards data', async () => {
      const res = await request(app)
        .get('/api/admin/analytics/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalStudents).toBeGreaterThan(0);
      expect(res.body.data.totalGroups).toBeGreaterThan(0);
      expect(res.body.data.totalAssignments).toBeGreaterThan(0);
      expect(res.body.data.overallCompletionRate).toBeGreaterThanOrEqual(0);
    });

    it('GET /api/admin/analytics/groups returns group performance distribution', async () => {
      const res = await request(app)
        .get('/api/admin/analytics/groups')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0]).toHaveProperty('group_completion_rate');
    });

    it('GET /api/admin/analytics/students returns student completion matrix', async () => {
      const res = await request(app)
        .get('/api/admin/analytics/students')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0]).toHaveProperty('student_completion_rate');
    });
  });

  describe('9. Adversarial Security & Input Validation', () => {
    it('Student attempting to create an assignment is rejected with 403', async () => {
      const res = await request(app)
        .post('/api/admin/assignments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Hacked Assignment',
          due_date: new Date().toISOString(),
          onedrive_link: 'https://onedrive.live.com/hacked',
          target_type: 'ALL',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Tampered JWT token signature is rejected with 401', async () => {
      const tamperedToken = studentToken.slice(0, -5) + 'xxxxx';
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('Invalid ObjectId format is rejected safely with 400', async () => {
      const res = await request(app)
        .get('/api/admin/assignments/invalid-object-id-123')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
