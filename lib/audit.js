import { query, getClient } from './database/aurora';

export async function createAuditLog({
  userId,
  workflowName,
  recordId,
  action,
  changes
}) {
  try {
    const result = await query(
      `INSERT INTO audit_logs (id, user_id, workflow_name, record_id, action, changes, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [userId, workflowName, recordId, action, JSON.stringify(changes)]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error creating audit log:', error);
    throw error;
  }
}

export async function logCreate(userId, workflowName, recordId, data) {
  return createAuditLog({
    userId,
    workflowName,
    recordId,
    action: 'CREATE',
    changes: { new: data }
  });
}

export async function logUpdate(userId, workflowName, recordId, oldData, newData) {
  const changes = {};
  
  for (const key in newData) {
    if (oldData[key] !== newData[key]) {
      changes[key] = {
        old: oldData[key],
        new: newData[key]
      };
    }
  }

  return createAuditLog({
    userId,
    workflowName,
    recordId,
    action: 'UPDATE',
    changes
  });
}

export async function logDelete(userId, workflowName, recordId, data) {
  return createAuditLog({
    userId,
    workflowName,
    recordId,
    action: 'DELETE',
    changes: { old: data }
  });
}

export async function getAuditLogs(filters = {}) {
  try {
    let sql = `
      SELECT al.*, u.name as user_name, u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.userId) {
      sql += ` AND al.user_id = $${paramCount}`;
      params.push(filters.userId);
      paramCount++;
    }

    if (filters.workflowName) {
      sql += ` AND al.workflow_name = $${paramCount}`;
      params.push(filters.workflowName);
      paramCount++;
    }

    if (filters.recordId) {
      sql += ` AND al.record_id = $${paramCount}`;
      params.push(filters.recordId);
      paramCount++;
    }

    if (filters.action) {
      sql += ` AND al.action = $${paramCount}`;
      params.push(filters.action);
      paramCount++;
    }

    if (filters.startDate) {
      sql += ` AND al.created_at >= $${paramCount}`;
      params.push(filters.startDate);
      paramCount++;
    }

    if (filters.endDate) {
      sql += ` AND al.created_at <= $${paramCount}`;
      params.push(filters.endDate);
      paramCount++;
    }

    sql += ' ORDER BY al.created_at DESC';

    if (filters.limit) {
      sql += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
      paramCount++;
    }

    const result = await query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('Error getting audit logs:', error);
    throw error;
  }
}