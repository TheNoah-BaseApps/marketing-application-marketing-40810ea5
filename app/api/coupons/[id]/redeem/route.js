/**
 * @swagger
 * /api/coupons/{id}/redeem:
 *   post:
 *     summary: Redeem a coupon
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
 *         description: Coupon redeemed successfully
 *       400:
 *         description: Coupon cannot be redeemed
 */

import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { logUpdate } from '@/lib/audit';

export async function POST(request, { params }) {
  const client = await getClient();
  
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

    if (!hasPermission(user.role, PERMISSIONS.COUPON_REDEEM)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await client.query('BEGIN');

    const result = await client.query(
      'SELECT * FROM coupons WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    const coupon = result.rows[0];

    if (coupon.status === 'expired') {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'Coupon has expired' },
        { status: 400 }
      );
    }

    if (coupon.status === 'depleted') {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'Coupon usage limit reached' },
        { status: 400 }
      );
    }

    if (coupon.status === 'inactive') {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'Coupon is inactive' },
        { status: 400 }
      );
    }

    const expiryDate = new Date(coupon.expiry_date);
    const now = new Date();

    if (expiryDate < now) {
      await client.query(
        "UPDATE coupons SET status = 'expired', updated_at = NOW() WHERE id = $1",
        [id]
      );
      await client.query('COMMIT');
      return NextResponse.json(
        { success: false, error: 'Coupon has expired' },
        { status: 400 }
      );
    }

    const newRedemptionCount = coupon.redemption_count + 1;
    let newStatus = coupon.status;

    if (coupon.usage_limit !== -1 && newRedemptionCount >= coupon.usage_limit) {
      newStatus = 'depleted';
    }

    const updateResult = await client.query(
      `UPDATE coupons 
       SET redemption_count = $1, status = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [newRedemptionCount, newStatus, id]
    );

    const updated = updateResult.rows[0];

    await client.query(
      `INSERT INTO audit_logs (id, user_id, workflow_name, record_id, action, changes, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())`,
      [
        user.id,
        'coupons',
        id,
        'REDEEM',
        JSON.stringify({
          redemption_count: { old: coupon.redemption_count, new: newRedemptionCount },
          status: { old: coupon.status, new: newStatus }
        })
      ]
    );

    await client.query('COMMIT');

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: 'Coupon redeemed successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in POST /api/coupons/[id]/redeem:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to redeem coupon' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}