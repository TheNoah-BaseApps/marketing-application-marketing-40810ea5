/**
 * @swagger
 * /api/coupons/{id}:
 *   get:
 *     summary: Get coupon by ID
 *     tags: [Coupons]
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
 *         description: Coupon details
 *       404:
 *         description: Not found
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';
import { validateCoupon } from '@/lib/validation';
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

    if (!hasPermission(user.role, PERMISSIONS.COUPON_READ)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const result = await query(
      `SELECT c.*, u.name as created_by_name 
       FROM coupons c 
       LEFT JOIN users u ON c.created_by = u.id 
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
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
    console.error('Error in GET /api/coupons/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupon' },
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
      'SELECT * FROM coupons WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
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

    const validation = validateCoupon(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    const expiryDate = new Date(body.expiry_date);
    const now = new Date();
    let newStatus = body.status || existing.status;

    if (expiryDate < now) {
      newStatus = 'expired';
    } else if (body.usage_limit !== -1 && body.redemption_count >= body.usage_limit) {
      newStatus = 'depleted';
    }

    const result = await query(
      `UPDATE coupons SET 
        issued_date = $1, expiry_date = $2, discount_amount = $3, 
        usage_limit = $4, applicable_items = $5, is_stackable = $6, 
        status = $7, campaign_source = $8, remarks = $9, updated_at = NOW()
       WHERE id = $10 
       RETURNING *`,
      [
        body.issued_date,
        body.expiry_date,
        body.discount_amount,
        body.usage_limit,
        body.applicable_items,
        body.is_stackable,
        newStatus,
        body.campaign_source,
        body.remarks,
        id
      ]
    );

    const updated = result.rows[0];

    await logUpdate(user.id, 'coupons', id, existing, updated);

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: 'Coupon updated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/coupons/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update coupon' },
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
      'SELECT * FROM coupons WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
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

    await query('DELETE FROM coupons WHERE id = $1', [id]);

    await logDelete(user.id, 'coupons', id, existing);

    return NextResponse.json(
      {
        success: true,
        message: 'Coupon deleted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/coupons/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}