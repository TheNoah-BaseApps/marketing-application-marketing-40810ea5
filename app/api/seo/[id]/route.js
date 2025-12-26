/**
 * @swagger
 * /api/seo/{id}:
 *   get:
 *     summary: Get SEO campaign by ID
 *     tags: [SEO]
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
 *         description: SEO campaign details
 *       404:
 *         description: Not found
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';
import { validateSEOCampaign } from '@/lib/validation';
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

    if (!hasPermission(user.role, PERMISSIONS.SEO_READ)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const result = await query(
      `SELECT s.*, u.name as created_by_name 
       FROM seo_campaigns s 
       LEFT JOIN users u ON s.created_by = u.id 
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'SEO campaign not found' },
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
    console.error('Error in GET /api/seo/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SEO campaign' },
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
      'SELECT * FROM seo_campaigns WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'SEO campaign not found' },
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

    const validation = validateSEOCampaign(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE seo_campaigns SET 
        keyword_targeted = $1, search_volume = $2, keyword_ranking = $3, 
        page_url = $4, backlink_count = $5, domain_authority = $6, 
        content_updated_date = $7, crawl_status = $8, meta_title = $9, 
        meta_description = $10, technical_issues = $11, remarks = $12, 
        updated_at = NOW()
       WHERE id = $13 
       RETURNING *`,
      [
        body.keyword_targeted,
        body.search_volume,
        body.keyword_ranking,
        body.page_url,
        body.backlink_count,
        body.domain_authority,
        body.content_updated_date,
        body.crawl_status,
        body.meta_title,
        body.meta_description,
        body.technical_issues,
        body.remarks,
        id
      ]
    );

    const updated = result.rows[0];

    await logUpdate(user.id, 'seo_campaigns', id, existing, updated);

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: 'SEO campaign updated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/seo/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update SEO campaign' },
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
      'SELECT * FROM seo_campaigns WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'SEO campaign not found' },
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

    await query('DELETE FROM seo_campaigns WHERE id = $1', [id]);

    await logDelete(user.id, 'seo_campaigns', id, existing);

    return NextResponse.json(
      {
        success: true,
        message: 'SEO campaign deleted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/seo/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete SEO campaign' },
      { status: 500 }
    );
  }
}