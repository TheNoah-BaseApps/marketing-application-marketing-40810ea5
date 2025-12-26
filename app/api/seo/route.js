/**
 * @swagger
 * /api/seo:
 *   get:
 *     summary: Get all SEO campaigns
 *     tags: [SEO]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of SEO campaigns
 *   post:
 *     summary: Create new SEO campaign
 *     tags: [SEO]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: SEO campaign created
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';
import { validateSEOCampaign } from '@/lib/validation';
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

    if (!hasPermission(user.role, PERMISSIONS.SEO_READ)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const crawlStatus = searchParams.get('crawl_status');
    const limit = searchParams.get('limit') || 100;

    let sql = `
      SELECT s.*, u.name as created_by_name 
      FROM seo_campaigns s 
      LEFT JOIN users u ON s.created_by = u.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (search) {
      sql += ` AND (s.keyword_targeted ILIKE $${paramCount} OR s.seo_campaign_id ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (crawlStatus) {
      sql += ` AND s.crawl_status = $${paramCount}`;
      params.push(crawlStatus);
      paramCount++;
    }

    sql += ` ORDER BY s.created_at DESC LIMIT $${paramCount}`;
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
    console.error('Error in GET /api/seo:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SEO campaigns' },
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

    if (!hasPermission(user.role, PERMISSIONS.SEO_CREATE)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const validation = validateSEOCampaign(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    const campaignId = body.seo_campaign_id || `SEO-${Date.now()}`;

    const result = await query(
      `INSERT INTO seo_campaigns (
        id, seo_campaign_id, keyword_targeted, search_volume, keyword_ranking, 
        page_url, backlink_count, domain_authority, content_updated_date, 
        crawl_status, meta_title, meta_description, technical_issues, 
        remarks, created_by, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
      ) RETURNING *`,
      [
        campaignId,
        body.keyword_targeted,
        body.search_volume || 0,
        body.keyword_ranking,
        body.page_url || null,
        body.backlink_count || 0,
        body.domain_authority || 0,
        body.content_updated_date || null,
        body.crawl_status || 'pending',
        body.meta_title || null,
        body.meta_description || null,
        body.technical_issues || null,
        body.remarks || null,
        user.id
      ]
    );

    const campaign = result.rows[0];

    await logCreate(user.id, 'seo_campaigns', campaign.id, campaign);

    return NextResponse.json(
      {
        success: true,
        data: campaign,
        message: 'SEO campaign created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/seo:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create SEO campaign' },
      { status: 500 }
    );
  }
}