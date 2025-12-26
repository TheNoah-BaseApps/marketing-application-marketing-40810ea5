/**
 * @swagger
 * /api/analytics/coupons:
 *   get:
 *     summary: Get coupon analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coupon metrics
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { getCouponAnalytics } from '@/lib/analytics';

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

    if (!hasPermission(user.role, PERMISSIONS.ANALYTICS_VIEW)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('end_date') || new Date().toISOString();

    const analytics = await getCouponAnalytics(startDate, endDate);

    return NextResponse.json(
      {
        success: true,
        data: analytics
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/analytics/coupons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupon analytics' },
      { status: 500 }
    );
  }
}