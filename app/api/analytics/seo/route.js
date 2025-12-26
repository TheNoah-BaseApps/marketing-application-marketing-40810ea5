/**
 * @swagger
 * /api/analytics/seo:
 *   get:
 *     summary: Get SEO analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: SEO metrics
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { getSEOAnalytics } from '@/lib/analytics';

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

    const analytics = await getSEOAnalytics(startDate, endDate);

    return NextResponse.json(
      {
        success: true,
        data: analytics
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/analytics/seo:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SEO analytics' },
      { status: 500 }
    );
  }
}