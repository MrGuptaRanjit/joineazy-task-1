const db = require('../db');

class GroupRepository {
  async createGroupWithCreator(name, creatorId) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // 1. Create group
      const groupRes = await client.query(
        `INSERT INTO groups (name, created_by)
         VALUES ($1, $2)
         RETURNING id, name, created_by, created_at, updated_at`,
        [name, creatorId]
      );
      const group = groupRes.rows[0];

      // 2. Add creator as first member
      await client.query(
        `INSERT INTO group_members (group_id, user_id)
         VALUES ($1, $2)`,
        [group.id, creatorId]
      );

      await client.query('COMMIT');
      return group;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findByName(name) {
    const query = `SELECT * FROM groups WHERE LOWER(name) = LOWER($1)`;
    const result = await db.query(query, [name]);
    return result.rows[0] || null;
  }

  async findById(id) {
    const query = `
      SELECT g.*, u.name AS creator_name, u.email AS creator_email
      FROM groups g
      JOIN users u ON g.created_by = u.id
      WHERE g.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  async getGroupByUserId(userId) {
    const query = `
      SELECT g.id, g.name, g.created_by, g.created_at, g.updated_at,
             (g.created_by = $1) AS is_creator
      FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0] || null;
  }

  async getGroupMembers(groupId) {
    const query = `
      SELECT u.id, u.name, u.email, u.student_id, gm.joined_at,
             (g.created_by = u.id) AS is_creator
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      JOIN groups g ON gm.group_id = g.id
      WHERE gm.group_id = $1
      ORDER BY is_creator DESC, gm.joined_at ASC
    `;
    const result = await db.query(query, [groupId]);
    return result.rows;
  }

  async addMember(groupId, userId) {
    const query = `
      INSERT INTO group_members (group_id, user_id)
      VALUES ($1, $2)
      RETURNING id, group_id, user_id, joined_at
    `;
    const result = await db.query(query, [groupId, userId]);
    return result.rows[0];
  }

  async removeMember(groupId, userId) {
    const query = `
      DELETE FROM group_members
      WHERE group_id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await db.query(query, [groupId, userId]);
    return result.rows[0] || null;
  }

  async findAll() {
    const query = `
      SELECT g.id, g.name, g.created_by, g.created_at,
             u.name AS creator_name,
             COUNT(DISTINCT gm.user_id)::int AS member_count
      FROM groups g
      JOIN users u ON g.created_by = u.id
      LEFT JOIN group_members gm ON g.id = gm.group_id
      GROUP BY g.id, g.name, g.created_by, g.created_at, u.name
      ORDER BY g.created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  async getGroupAudit(groupId) {
    const group = await this.findById(groupId);
    if (!group) return null;

    const members = await this.getGroupMembers(groupId);

    // Get assignments targeted to ALL or this group
    const assignmentsRes = await db.query(`
      SELECT a.id, a.title, a.due_date, a.target_type, a.onedrive_link
      FROM assignments a
      LEFT JOIN assignment_targets at ON a.id = at.assignment_id AND at.group_id = $1
      WHERE a.target_type = 'ALL' OR at.group_id IS NOT NULL
      ORDER BY a.due_date ASC
    `, [groupId]);

    const assignmentsWithSubmissions = [];
    let totalConfirmedOverall = 0;

    for (const a of assignmentsRes.rows) {
      const memberStatuses = [];
      let confirmedCount = 0;

      for (const m of members) {
        const subRes = await db.query(`
          SELECT status, confirmed_at
          FROM submissions
          WHERE assignment_id = $1 AND student_id = $2 AND status = 'CONFIRMED'
        `, [a.id, m.id]);

        const isConfirmed = subRes.rows.length > 0;
        if (isConfirmed) confirmedCount++;

        memberStatuses.push({
          student_id: m.id,
          student_name: m.name,
          email: m.email,
          roll_number: m.student_id,
          status: isConfirmed ? 'CONFIRMED' : 'PENDING',
          confirmed_at: subRes.rows[0]?.confirmed_at || null,
        });
      }

      totalConfirmedOverall += confirmedCount;
      const totalMembers = members.length;
      const rate = totalMembers > 0 ? Number(((confirmedCount / totalMembers) * 100).toFixed(2)) : 0;

      assignmentsWithSubmissions.push({
        id: a.id,
        title: a.title,
        due_date: a.due_date,
        target_type: a.target_type,
        onedrive_link: a.onedrive_link,
        total_members: totalMembers,
        confirmed_count: confirmedCount,
        pending_count: totalMembers - confirmedCount,
        completion_percentage: rate,
        member_statuses: memberStatuses,
      });
    }

    const totalPossibleSubmissions = members.length * assignmentsRes.rows.length;
    const overallCompletionRate = totalPossibleSubmissions > 0
      ? Number(((totalConfirmedOverall / totalPossibleSubmissions) * 100).toFixed(2))
      : 0;

    return {
      group,
      members,
      overall_completion_rate: overallCompletionRate,
      assignments: assignmentsWithSubmissions,
    };
  }
}

module.exports = new GroupRepository();
