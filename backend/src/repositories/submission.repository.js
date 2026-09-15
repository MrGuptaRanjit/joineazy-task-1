const db = require('../db');

class SubmissionRepository {
  async confirmSubmission({ assignmentId, studentId, groupId }) {
    const query = `
      INSERT INTO submissions (assignment_id, student_id, group_id, status, confirmed_at)
      VALUES ($1, $2, $3, 'CONFIRMED', CURRENT_TIMESTAMP)
      ON CONFLICT (assignment_id, student_id)
      DO UPDATE SET status = 'CONFIRMED', confirmed_at = CURRENT_TIMESTAMP, group_id = EXCLUDED.group_id
      RETURNING *
    `;
    const result = await db.query(query, [assignmentId, studentId, groupId]);
    return result.rows[0];
  }

  async findByAssignmentAndStudent(assignmentId, studentId) {
    const query = `
      SELECT * FROM submissions
      WHERE assignment_id = $1 AND student_id = $2
    `;
    const result = await db.query(query, [assignmentId, studentId]);
    return result.rows[0] || null;
  }

  async getSubmissionsByAssignment(assignmentId) {
    const query = `
      SELECT s.*, 
             u.name AS student_name, 
             u.email AS student_email, 
             u.student_id AS roll_number,
             g.name AS group_name
      FROM submissions s
      JOIN users u ON s.student_id = u.id
      LEFT JOIN groups g ON s.group_id = g.id
      WHERE s.assignment_id = $1
      ORDER BY s.confirmed_at DESC
    `;
    const result = await db.query(query, [assignmentId]);
    return result.rows;
  }

  async getAssignmentAudit(assignmentId) {
    const assignmentRes = await db.query('SELECT * FROM assignments WHERE id = $1', [assignmentId]);
    if (!assignmentRes.rows[0]) return null;
    const assignment = assignmentRes.rows[0];

    // 1. Groups to audit
    let eligibleGroups = [];
    if (assignment.target_type === 'ALL') {
      const groupsRes = await db.query('SELECT id, name FROM groups ORDER BY name ASC');
      eligibleGroups = groupsRes.rows;
    } else {
      const groupsRes = await db.query(`
        SELECT g.id, g.name
        FROM assignment_targets at
        JOIN groups g ON at.group_id = g.id
        WHERE at.assignment_id = $1
        ORDER BY g.name ASC
      `, [assignmentId]);
      eligibleGroups = groupsRes.rows;
    }

    // 2. Compute group breakdown
    const groupSummary = [];
    for (const group of eligibleGroups) {
      const membersRes = await db.query(
        'SELECT COUNT(DISTINCT user_id)::int AS count FROM group_members WHERE group_id = $1',
        [group.id]
      );
      const memberCount = membersRes.rows[0]?.count || 0;

      const subRes = await db.query(
        "SELECT COUNT(DISTINCT student_id)::int AS count FROM submissions WHERE group_id = $1 AND assignment_id = $2 AND status = 'CONFIRMED'",
        [group.id, assignmentId]
      );
      const subCount = subRes.rows[0]?.count || 0;
      const rate = memberCount > 0 ? Number(((subCount / memberCount) * 100).toFixed(2)) : 0;

      groupSummary.push({
        group_id: group.id,
        group_name: group.name,
        total_members: memberCount,
        confirmed_submissions: subCount,
        completion_percentage: rate,
      });
    }

    // 3. Student submissions list
    let studentsRes;
    if (assignment.target_type === 'ALL') {
      studentsRes = await db.query(`
        SELECT u.id AS student_id, u.name AS student_name, u.email, u.student_id AS roll_number,
               g.name AS group_name,
               COALESCE(s.status, 'PENDING') AS status,
               s.confirmed_at
        FROM users u
        LEFT JOIN group_members gm ON u.id = gm.user_id
        LEFT JOIN groups g ON gm.group_id = g.id
        LEFT JOIN submissions s ON s.assignment_id = $1 AND s.student_id = u.id
        WHERE u.role = 'STUDENT'
        ORDER BY s.confirmed_at DESC NULLS LAST, u.name ASC
      `, [assignmentId]);
    } else {
      studentsRes = await db.query(`
        SELECT u.id AS student_id, u.name AS student_name, u.email, u.student_id AS roll_number,
               g.name AS group_name,
               COALESCE(s.status, 'PENDING') AS status,
               s.confirmed_at
        FROM users u
        JOIN group_members gm ON u.id = gm.user_id
        JOIN groups g ON gm.group_id = g.id
        JOIN assignment_targets at ON at.group_id = g.id AND at.assignment_id = $1
        LEFT JOIN submissions s ON s.assignment_id = $1 AND s.student_id = u.id
        WHERE u.role = 'STUDENT'
        ORDER BY s.confirmed_at DESC NULLS LAST, u.name ASC
      `, [assignmentId]);
    }

    return {
      groupSummary,
      studentSubmissions: studentsRes.rows,
    };
  }
}

module.exports = new SubmissionRepository();
