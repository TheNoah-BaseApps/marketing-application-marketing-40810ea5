/**
 * @swagger
 * /api/websites:
 *   get:
 *     summary: Get all websites
 *     tags: [Websites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of websites
 *   post:
 *     summary: Create new website
 *     tags: [Websites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Website created
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';
import { validateWebsite } from '@/lib/validation';
import { logCreate } from '@/lib/audit';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

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

    if (!hasPermission(user.role, PERMISSIONS.WEBSITE_READ)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const sslStatus = searchParams.get('ssl_status');
    const limit = searchParams.get('limit') || 100;

    let sql = `
      SELECT w.*, u.name as created_by_name 
      FROM websites w 
      LEFT JOIN users u ON w.created_by = u.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (search) {
      sql += ` AND (w.domain_name ILIKE $${paramCount} OR w.website_id ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (sslStatus) {
      sql += ` AND w.ssl_status = $${paramCount}`;
      params.push(sslStatus);
      paramCount++;
    }

    sql += ` ORDER BY w.created_at DESC LIMIT $${paramCount}`;
    params.push(limit);

    const result = await query(sql, params);

    return NextResponse.json(
      {
        success: true,
        data: result.rows,
        count: result.rows.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/websites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch websites' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;

    if (!hasPermission(user.role, PERMISSIONS.WEBSITE_CREATE)) {
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

    const websiteId = body.website_id || `WEB-${Date.now()}`;

    const result = await query(
      `INSERT INTO websites (
        id, website_id, domain_name, page_count, cms_used, launch_date, 
        last_updated_date, ssl_status, page_load_time, uptime_percentage, 
        mobile_responsive, analytics_tool_used, maintenance_schedule, 
        remarks, created_by, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
      ) RETURNING *`,
      [
        websiteId,
        body.domain_name,
        body.page_count,
        body.cms_used || null,
        body.launch_date || null,
        body.last_updated_date || null,
        body.ssl_status || 'none',
        body.page_load_time || null,
        body.uptime_percentage || null,
        body.mobile_responsive || false,
        body.analytics_tool_used || null,
        body.maintenance_schedule || null,
        body.remarks || null,
        user.id
      ]
    );

    const website = result.rows[0];

    await logCreate(user.id, 'websites', website.id, website);

    return NextResponse.json(
      {
        success: true,
        data: website,
        message: 'Website created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/websites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create website' },
      { status: 500 }
    );
  }
}