/**
 * @swagger
 * /api/coupons:
 *   get:
 *     summary: Get all coupons
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of coupons
 *   post:
 *     summary: Create new coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Coupon created
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';
import { validateCoupon } from '@/lib/validation';
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

    if (!hasPermission(user.role, PERMISSIONS.COUPON_READ)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || 100;

    let sql = `
      SELECT c.*, u.name as created_by_name 
      FROM coupons c 
      LEFT JOIN users u ON c.created_by = u.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (search) {
      sql += ` AND (c.coupon_code ILIKE $${paramCount} OR c.coupon_id ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (status) {
      sql += ` AND c.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    sql += ` ORDER BY c.created_at DESC LIMIT $${paramCount}`;
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
    console.error('Error in GET /api/coupons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupons' },
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

    if (!hasPermission(user.role, PERMISSIONS.COUPON_CREATE)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const validation = validateCoupon(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    const existingCoupon = await query(
      'SELECT id FROM coupons WHERE coupon_code = $1',
      [body.coupon_code.toUpperCase()]
    );

    if (existingCoupon.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Coupon code already exists' },
        { status: 400 }
      );
    }

    const couponId = body.coupon_id || `CPN-${Date.now()}`;

    const result = await query(
      `INSERT INTO coupons (
        id, coupon_id, coupon_code, issued_date, expiry_date, discount_amount, 
        usage_limit, redemption_count, applicable_items, is_stackable, 
        status, campaign_source, created_by, remarks, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
      ) RETURNING *`,
      [
        couponId,
        body.coupon_code.toUpperCase(),
        body.issued_date,
        body.expiry_date,
        body.discount_amount,
        body.usage_limit || -1,
        0,
        body.applicable_items || null,
        body.is_stackable || false,
        'active',
        body.campaign_source || null,
        user.id,
        body.remarks || null
      ]
    );

    const coupon = result.rows[0];

    await logCreate(user.id, 'coupons', coupon.id, coupon);

    return NextResponse.json(
      {
        success: true,
        data: coupon,
        message: 'Coupon created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/coupons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}