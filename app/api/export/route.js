/**
 * @swagger
 * /api/export:
 *   post:
 *     summary: Export data to CSV
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workflow:
 *                 type: string
 *                 enum: [seo, websites, coupons]
 *     responses:
 *       200:
 *         description: CSV data
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { arrayToCSV, SEO_CSV_COLUMNS, WEBSITE_CSV_COLUMNS, COUPON_CSV_COLUMNS } from '@/lib/csv';

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

    if (!hasPermission(user.role, PERMISSIONS.DATA_EXPORT)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { workflow } = body;

    let data, columns, filename;

    if (workflow === 'seo') {
      const result = await query('SELECT * FROM seo_campaigns ORDER BY created_at DESC');
      data = result.rows;
      columns = SEO_CSV_COLUMNS;
      filename = `seo_campaigns_${Date.now()}.csv`;
    } else if (workflow === 'websites') {
      const result = await query('SELECT * FROM websites ORDER BY created_at DESC');
      data = result.rows;
      columns = WEBSITE_CSV_COLUMNS;
      filename = `websites_${Date.now()}.csv`;
    } else if (workflow === 'coupons') {
      const result = await query('SELECT * FROM coupons ORDER BY created_at DESC');
      data = result.rows;
      columns = COUPON_CSV_COLUMNS;
      filename = `coupons_${Date.now()}.csv`;
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid workflow' },
        { status: 400 }
      );
    }

    const csv = arrayToCSV(data, columns);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Error in POST /api/export:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    );
  }
}