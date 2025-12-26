/**
 * @swagger
 * /api/import:
 *   post:
 *     summary: Import data from CSV
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
 *               csvData:
 *                 type: string
 *     responses:
 *       200:
 *         description: Data imported successfully
 */

import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { csvToArray, SEO_CSV_COLUMNS, WEBSITE_CSV_COLUMNS, COUPON_CSV_COLUMNS } from '@/lib/csv';
import { validateSEOCampaign, validateWebsite, validateCoupon } from '@/lib/validation';

export async function POST(request) {
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

    if (!hasPermission(user.role, PERMISSIONS.DATA_IMPORT)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { workflow, csvData } = body;

    if (!csvData) {
      return NextResponse.json(
        { success: false, error: 'CSV data is required' },
        { status: 400 }
      );
    }

    let columns, data;

    if (workflow === 'seo') {
      columns = SEO_CSV_COLUMNS;
    } else if (workflow === 'websites') {
      columns = WEBSITE_CSV_COLUMNS;
    } else if (workflow === 'coupons') {
      columns = COUPON_CSV_COLUMNS;
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid workflow' },
        { status: 400 }
      );
    }

    try {
      data = csvToArray(csvData, columns);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid CSV format' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    let imported = 0;
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        if (workflow === 'seo') {
          const validation = validateSEOCampaign(row);
          if (!validation.isValid) {
            errors.push({ row: i + 2, errors: validation.errors });
            continue;
          }

          await client.query(
            `INSERT INTO seo_campaigns (
              id, seo_campaign_id, keyword_targeted, search_volume, keyword_ranking, 
              page_url, backlink_count, domain_authority, content_updated_date, 
              crawl_status, meta_title, meta_description, technical_issues, 
              remarks, created_by, created_at, updated_at
            ) VALUES (
              gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
            )`,
            [
              row.seo_campaign_id || `SEO-${Date.now()}-${i}`,
              row.keyword_targeted,
              row.search_volume,
              row.keyword_ranking,
              row.page_url,
              row.backlink_count,
              row.domain_authority,
              row.content_updated_date,
              row.crawl_status,
              row.meta_title,
              row.meta_description,
              row.technical_issues,
              row.remarks,
              user.id
            ]
          );
          imported++;
        } else if (workflow === 'websites') {
          const validation = validateWebsite(row);
          if (!validation.isValid) {
            errors.push({ row: i + 2, errors: validation.errors });
            continue;
          }

          await client.query(
            `INSERT INTO websites (
              id, website_id, domain_name, page_count, cms_used, launch_date, 
              last_updated_date, ssl_status, page_load_time, uptime_percentage, 
              mobile_responsive, analytics_tool_used, maintenance_schedule, 
              remarks, created_by, created_at, updated_at
            ) VALUES (
              gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
            )`,
            [
              row.website_id || `WEB-${Date.now()}-${i}`,
              row.domain_name,
              row.page_count,
              row.cms_used,
              row.launch_date,
              row.last_updated_date,
              row.ssl_status,
              row.page_load_time,
              row.uptime_percentage,
              row.mobile_responsive,
              row.analytics_tool_used,
              row.maintenance_schedule,
              row.remarks,
              user.id
            ]
          );
          imported++;
        } else if (workflow === 'coupons') {
          const validation = validateCoupon(row);
          if (!validation.isValid) {
            errors.push({ row: i + 2, errors: validation.errors });
            continue;
          }

          await client.query(
            `INSERT INTO coupons (
              id, coupon_id, coupon_code, issued_date, expiry_date, discount_amount, 
              usage_limit, redemption_count, applicable_items, is_stackable, 
              status, campaign_source, created_by, remarks, created_at, updated_at
            ) VALUES (
              gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
            )`,
            [
              row.coupon_id || `CPN-${Date.now()}-${i}`,
              row.coupon_code.toUpperCase(),
              row.issued_date,
              row.expiry_date,
              row.discount_amount,
              row.usage_limit,
              0,
              row.applicable_items,
              row.is_stackable,
              'active',
              row.campaign_source,
              user.id,
              row.remarks
            ]
          );
          imported++;
        }
      } catch (error) {
        errors.push({ row: i + 2, error: error.message });
      }
    }

    await client.query('COMMIT');

    return NextResponse.json(
      {
        success: true,
        data: {
          imported,
          total: data.length,
          errors: errors.length > 0 ? errors : undefined
        },
        message: `Successfully imported ${imported} of ${data.length} records`
      },
      { status: 200 }
    );
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in POST /api/import:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import data' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}