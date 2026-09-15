const db = require('../db');

class AssignmentRepository {
  async createAssignment({ title, description, dueDate, onedriveLink, targetType, createdBy, groupIds = [] }) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const assignmentRes = await client.query(
        `INSERT INTO assignments (title, description, due_date, onedrive_link, target_type, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [title, description, dueDate, onedriveLink, targetType, createdBy]
      );
      const assignment = assignmentRes.rows[0];

      if (targetType === 'GROUPS' && Array.isArray(groupIds) && groupIds.length > 0) {
        for (const groupId of groupIds) {
          await client.query(
            `INSERT INTO assignment_targets (assignment_id, group_id)
             VALUES ($1, $2)
             ON CONFLICT (assignment_id, group_id) DO NOTHING`,
            [assignment.id, groupId]
          );
        }
      }

      await client.query('COMMIT');
      return assignment;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateAssignment(id, { title, description, dueDate, onedriveLink, targetType, groupIds }) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const updateRes = await client.query(
        `UPDATE assignments
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             due_date = COALESCE($3, due_date),
             onedrive_link = COALESCE($4, onedrive_link),
             target_type = COALESCE($5, target_type),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING *`,
        [title, description, dueDate, onedriveLink, targetType, id]
      );

      const updated = updateRes.rows[0];

      if (targetType === 'GROUPS' && Array.isArray(groupIds)) {
        await client.query(`DELETE FROM assignment_targets WHERE assignment_id = $1`, [id]);
        for (const groupId of groupIds) {
          await client.query(
            `INSERT INTO assignment_targets (assignment_id, group_id)
             VALUES ($1, $2)
             ON CONFLICT (assignment_id, group_id) DO NOTHING`,
            [id, groupId]
          );
        }
      } else if (targetType === 'ALL') {
        await client.query(`DELETE FROM assignment_targets WHERE assignment_id = $1`, [id]);
      }

      await client.query('COMMIT');
      return updated;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteAssignment(id) {
    const query = `DELETE FROM assignments WHERE id = $1 RETURNING *`;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  async findById(id) {
    const query = `
      SELECT a.*, u.name AS creator_name
      FROM assignments a
      JOIN users u ON a.created_by = u.id
      WHERE a.id = $1
    `;
    const result = await db.query(query, [id]);
    if (!result.rows[0]) return null;

    const assignment = result.rows[0];
    const targetsRes = await db.query(`
      SELECT g.id, g.name
      FROM assignment_targets at
      JOIN groups g ON at.group_id = g.id
      WHERE at.assignment_id = $1
    `, [id]);

    assignment.target_groups = targetsRes.rows;
    return assignment;
  }

  async findAllForAdmin() {
    const assignmentsRes = await db.query(`
      SELECT a.id, a.title, a.description, a.due_date, a.onedrive_link, a.target_type, a.created_by, a.created_at, a.updated_at,
             u.name AS creator_name
      FROM assignments a
      JOIN users u ON a.created_by = u.id
      ORDER BY a.due_date ASC
    `);

    const targetsRes = await db.query(`
      SELECT at.assignment_id, g.id, g.name
      FROM assignment_targets at
      JOIN groups g ON at.group_id = g.id
    `);

    const submissionsRes = await db.query(`
      SELECT assignment_id, COUNT(*)::int AS count
      FROM submissions
      WHERE status = 'CONFIRMED'
      GROUP BY assignment_id
    `);

    const targetsByAssignment = {};
    targetsRes.rows.forEach((row) => {
      if (!targetsByAssignment[row.assignment_id]) {
        targetsByAssignment[row.assignment_id] = [];
      }
      targetsByAssignment[row.assignment_id].push({ id: row.id, name: row.name });
    });

    const submissionsByAssignment = {};
    submissionsRes.rows.forEach((row) => {
      submissionsByAssignment[row.assignment_id] = row.count;
    });

    return assignmentsRes.rows.map((assignment) => ({
      ...assignment,
      target_groups: targetsByAssignment[assignment.id] || [],
      total_confirmed_submissions: submissionsByAssignment[assignment.id] || 0,
    }));
  }

  async findVisibleForStudent(studentId) {
    const query = `
      SELECT DISTINCT a.*, 
             s.status AS submission_status, 
             s.confirmed_at,
             (s.status = 'CONFIRMED') AS is_submitted
      FROM assignments a
      LEFT JOIN assignment_targets at ON a.id = at.assignment_id
      LEFT JOIN group_members gm ON gm.user_id = $1
      LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = $1
      WHERE a.target_type = 'ALL' 
         OR (a.target_type = 'GROUPS' AND at.group_id = gm.group_id)
      ORDER BY a.due_date ASC
    `;
    const result = await db.query(query, [studentId]);
    return result.rows;
  }

  async getStudentAssignmentDetails(assignmentId, studentId) {
    const query = `
      SELECT a.*, 
             s.status AS submission_status, 
             s.confirmed_at,
             (s.status = 'CONFIRMED') AS is_submitted,
             gm.group_id AS student_group_id,
             g.name AS student_group_name
      FROM assignments a
      LEFT JOIN assignment_targets at ON a.id = at.assignment_id
      LEFT JOIN group_members gm ON gm.user_id = $2
      LEFT JOIN groups g ON gm.group_id = g.id
      LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = $2
      WHERE a.id = $1
        AND (a.target_type = 'ALL' OR at.group_id = gm.group_id)
      LIMIT 1
    `;
    const result = await db.query(query, [assignmentId, studentId]);
    return result.rows[0] || null;
  }
}

module.exports = new AssignmentRepository();
