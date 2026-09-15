const db = require('../db');

class AnalyticsRepository {
  async getOverviewKPIs() {
    const studentsRes = await db.query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'STUDENT'`);
    const groupsRes = await db.query(`SELECT COUNT(*)::int AS count FROM groups`);
    const assignmentsRes = await db.query(`SELECT COUNT(*)::int AS count FROM assignments`);
    const submissionsRes = await db.query(`SELECT COUNT(*)::int AS count FROM submissions WHERE status = 'CONFIRMED'`);

    const totalStudents = studentsRes.rows[0]?.count || 0;
    const totalGroups = groupsRes.rows[0]?.count || 0;
    const totalAssignments = assignmentsRes.rows[0]?.count || 0;
    const totalConfirmed = submissionsRes.rows[0]?.count || 0;

    // Calculate expected submissions across all assignments
    const allAssignments = await db.query(`SELECT id, target_type FROM assignments`);
    let totalExpected = 0;

    for (const a of allAssignments.rows) {
      if (a.target_type === 'ALL') {
        totalExpected += totalStudents;
      } else {
        const targetCountRes = await db.query(`
          SELECT COUNT(DISTINCT gm.user_id)::int AS count
          FROM assignment_targets at
          JOIN group_members gm ON at.group_id = gm.group_id
          WHERE at.assignment_id = $1
        `, [a.id]);
        totalExpected += (targetCountRes.rows[0]?.count || 0);
      }
    }

    const pendingSubmissions = Math.max(0, totalExpected - totalConfirmed);
    const overallCompletionRate = totalExpected > 0
      ? Number(((totalConfirmed / totalExpected) * 100).toFixed(2))
      : 0;

    return {
      totalStudents,
      totalGroups,
      totalAssignments,
      totalConfirmedSubmissions: totalConfirmed,
      totalExpectedSubmissions: totalExpected,
      pendingSubmissions,
      overallCompletionRate,
    };
  }

  async getGroupAnalytics() {
    const groupsRes = await db.query(`
      SELECT g.id AS group_id, g.name AS group_name
      FROM groups g
      ORDER BY g.name ASC
    `);

    const results = [];
    for (const group of groupsRes.rows) {
      const membersRes = await db.query(`
        SELECT COUNT(DISTINCT user_id)::int AS count 
        FROM group_members 
        WHERE group_id = $1
      `, [group.group_id]);
      const memberCount = membersRes.rows[0]?.count || 0;

      const submissionsRes = await db.query(`
        SELECT COUNT(DISTINCT id)::int AS count 
        FROM submissions 
        WHERE group_id = $1 AND status = 'CONFIRMED'
      `, [group.group_id]);
      const submissionCount = submissionsRes.rows[0]?.count || 0;

      const eligibleAssignmentsRes = await db.query(`
        SELECT COUNT(DISTINCT a.id)::int AS count
        FROM assignments a
        LEFT JOIN assignment_targets at ON a.id = at.assignment_id AND at.group_id = $1
        WHERE a.target_type = 'ALL' OR at.group_id IS NOT NULL
      `, [group.group_id]);
      const eligibleCount = eligibleAssignmentsRes.rows[0]?.count || 0;

      const totalPossible = memberCount * eligibleCount;
      const rate = totalPossible > 0
        ? Number(((submissionCount / totalPossible) * 100).toFixed(2))
        : 0;

      results.push({
        group_id: group.group_id,
        group_name: group.group_name,
        total_members: memberCount,
        total_confirmed_submissions: submissionCount,
        eligible_assignments_count: eligibleCount,
        group_completion_rate: rate,
      });
    }

    return results.sort((a, b) => b.group_completion_rate - a.group_completion_rate);
  }

  async getStudentAnalytics() {
    const studentsRes = await db.query(`
      SELECT u.id AS student_id, u.name AS student_name, u.email, u.student_id AS roll_number,
             g.name AS group_name, gm.group_id
      FROM users u
      LEFT JOIN group_members gm ON u.id = gm.user_id
      LEFT JOIN groups g ON gm.group_id = g.id
      WHERE u.role = 'STUDENT'
      ORDER BY u.name ASC
    `);

    const results = [];
    for (const student of studentsRes.rows) {
      const confirmedRes = await db.query(`
        SELECT COUNT(DISTINCT assignment_id)::int AS count
        FROM submissions
        WHERE student_id = $1 AND status = 'CONFIRMED'
      `, [student.student_id]);
      const confirmedCount = confirmedRes.rows[0]?.count || 0;

      const eligibleRes = await db.query(`
        SELECT COUNT(DISTINCT a.id)::int AS count
        FROM assignments a
        LEFT JOIN assignment_targets at ON a.id = at.assignment_id AND at.group_id = $1
        WHERE a.target_type = 'ALL' OR ($1 IS NOT NULL AND at.group_id = $1)
      `, [student.group_id]);
      const eligibleCount = eligibleRes.rows[0]?.count || 0;

      const rate = eligibleCount > 0
        ? Number(((confirmedCount / eligibleCount) * 100).toFixed(2))
        : 0;

      results.push({
        student_id: student.student_id,
        student_name: student.student_name,
        email: student.email,
        roll_number: student.roll_number,
        group_name: student.group_name || 'No Group',
        completed_assignments: confirmedCount,
        eligible_assignments: eligibleCount,
        student_completion_rate: rate,
      });
    }

    return results.sort((a, b) => b.student_completion_rate - a.student_completion_rate);
  }
}

module.exports = new AnalyticsRepository();
