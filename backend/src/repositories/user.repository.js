const db = require('../db');

class UserRepository {
  async findById(id) {
    const query = `
      SELECT id, name, email, role, student_id, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByEmail(email) {
    const query = `
      SELECT id, name, email, password_hash, role, student_id, created_at, updated_at
      FROM users
      WHERE LOWER(email) = LOWER($1)
    `;
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
  }

  async findByStudentId(studentId) {
    const query = `
      SELECT id, name, email, role, student_id, created_at, updated_at
      FROM users
      WHERE UPPER(student_id) = UPPER($1)
    `;
    const result = await db.query(query, [studentId]);
    return result.rows[0] || null;
  }

  async findByIdentifier(identifier) {
    const query = `
      SELECT id, name, email, role, student_id, created_at
      FROM users
      WHERE LOWER(email) = LOWER($1) OR UPPER(student_id) = UPPER($1)
    `;
    const result = await db.query(query, [identifier]);
    return result.rows[0] || null;
  }

  async createStudent({ name, email, passwordHash, studentId }) {
    const query = `
      INSERT INTO users (name, email, password_hash, role, student_id)
      VALUES ($1, LOWER($2), $3, 'STUDENT', UPPER($4))
      RETURNING id, name, email, role, student_id, created_at
    `;
    const result = await db.query(query, [name, email, passwordHash, studentId]);
    return result.rows[0];
  }

  async getUserWithGroup(userId) {
    const query = `
      SELECT u.id, u.name, u.email, u.role, u.student_id,
             g.id AS group_id, g.name AS group_name,
             gm.joined_at AS group_joined_at,
             (g.created_by = u.id) AS is_group_creator
      FROM users u
      LEFT JOIN group_members gm ON u.id = gm.user_id
      LEFT JOIN groups g ON gm.group_id = g.id
      WHERE u.id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0] || null;
  }
}

module.exports = new UserRepository();
