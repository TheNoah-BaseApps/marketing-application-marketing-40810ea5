/**
 * @swagger
 * /api/websites/{id}:
 *   get:
 *     summary: Get website by ID
 *     tags: [Websites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Website details
 *       404:
 *         description: Not found
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';
import { validateWebsite } from '@/lib/validation';
import { logUpdate, logDelete } from '@/lib/audit';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { canUpdate, canDelete } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;
    const { id } = params;

    if (!hasPermission(user.role, PERMISSIONS.WEBSITE_READ)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const result = await query(
      `SELECT w.*, u.name as created_by_name 
       FROM websites w 
       LEFT JOIN users u ON w.created_by = u.id 
       WHERE w.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Website not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/websites/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch website' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;
    const { id } = params;

    const existingResult = await query(
      'SELECT * FROM websites WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Website not found' },
        { status: 404 }
      );
    }

    const existing = existingResult.rows[0];

    if (!canUpdate(user.role, existing.created_by, user.id)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const validation = validateWebsite(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE websites SET 
        domain_name = $1, page_count = $2, cms_used = $3, launch_date = $4, 
        last_updated_date = $5, ssl_status = $6, page_load_time = $7, 
        uptime_percentage = $8, mobile_responsive = $9, analytics_tool_used = $10, 
        maintenance_schedule = $11, remarks = $12, updated_at = NOW()
       WHERE id = $13 
       RETURNING *`,
      [
        body.domain_name,
        body.page_count,
        body.cms_used,
        body.launch_date,
        body.last_updated_date,
        body.ssl_status,
        body.page_load_time,
        body.uptime_percentage,
        body.mobile_responsive,
        body.analytics_tool_used,
        body.maintenance_schedule,
        body.remarks,
        id
      ]
    );

    const updated = result.rows[0];

    await logUpdate(user.id, 'websites', id, existing, updated);

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: 'Website updated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/websites/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update website' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;
    const { id } = params;

    const existingResult = await query(
      'SELECT * FROM websites WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Website not found' },
        { status: 404 }
      );
    }

    const existing = existingResult.rows[0];

    if (!canDelete(user.role, existing.created_by, user.id)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await query('DELETE FROM websites WHERE id = $1', [id]);

    await logDelete(user.id, 'websites', id, existing);

    return NextResponse.json(
      {
        success: true,
        message: 'Website deleted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/websites/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete website' },
      { status: 500 }
    );
  }
}