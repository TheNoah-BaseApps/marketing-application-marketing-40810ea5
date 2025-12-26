/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of audit logs
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { getAuditLogs } from '@/lib/audit';

export async function GET(request) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;

    if (!hasPermission(user.role, PERMISSIONS.AUDIT_VIEW)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      workflowName: searchParams.get('workflow'),
      action: searchParams.get('action'),
      userId: searchParams.get('user_id'),
      startDate: searchParams.get('start_date'),
      endDate: searchParams.get('end_date'),
      limit: searchParams.get('limit') || 100
    };

    const logs = await getAuditLogs(filters);

    return NextResponse.json(
      {
        success: true,
        data: logs,
        count: logs.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/audit-logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}