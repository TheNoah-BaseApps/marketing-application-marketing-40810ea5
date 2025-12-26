import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/ad-campaigns:
 *   get:
 *     summary: Get all ad campaigns
 *     description: Retrieve a list of all ad campaigns with optional filtering
 *     tags:
 *       - Ad Campaigns
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *       - in: query
 *         name: ad_type
 *         schema:
 *           type: string
 *         description: Filter by ad type
 *       - in: query
 *         name: platform_or_channel
 *         schema:
 *           type: string
 *         description: Filter by platform or channel
 *     responses:
 *       200:
 *         description: Successfully retrieved ad campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const ad_type = searchParams.get('ad_type');
    const platform_or_channel = searchParams.get('platform_or_channel');

    let sql = 'SELECT * FROM ad_campaigns WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (ad_type) {
      sql += ` AND ad_type = $${paramIndex}`;
      params.push(ad_type);
      paramIndex++;
    }

    if (platform_or_channel) {
      sql += ` AND platform_or_channel = $${paramIndex}`;
      params.push(platform_or_channel);
      paramIndex++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching ad campaigns:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/ad-campaigns:
 *   post:
 *     summary: Create a new ad campaign
 *     description: Create a new ad campaign with the provided data
 *     tags:
 *       - Ad Campaigns
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ad_campaign_id
 *               - ad_type
 *               - ad_title
 *               - platform_or_channel
 *             properties:
 *               ad_campaign_id:
 *                 type: string
 *               ad_type:
 *                 type: string
 *               ad_title:
 *                 type: string
 *               platform_or_channel:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               ad_budget:
 *                 type: integer
 *               target_demographic:
 *                 type: string
 *               impressions_achieved:
 *                 type: integer
 *               cpm:
 *                 type: integer
 *               conversions_count:
 *                 type: integer
 *               creative_agency_name:
 *                 type: string
 *               ad_approval_date:
 *                 type: string
 *                 format: date-time
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ad campaign created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      ad_campaign_id,
      ad_type,
      ad_title,
      platform_or_channel,
      start_date,
      end_date,
      ad_budget,
      target_demographic,
      impressions_achieved,
      cpm,
      conversions_count,
      creative_agency_name,
      ad_approval_date,
      remarks
    } = body;

    if (!ad_campaign_id || !ad_type || !ad_title || !platform_or_channel) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO ad_campaigns (
        ad_campaign_id, ad_type, ad_title, platform_or_channel,
        start_date, end_date, ad_budget, target_demographic,
        impressions_achieved, cpm, conversions_count,
        creative_agency_name, ad_approval_date, remarks,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING *`,
      [
        ad_campaign_id, ad_type, ad_title, platform_or_channel,
        start_date, end_date, ad_budget, target_demographic,
        impressions_achieved, cpm, conversions_count,
        creative_agency_name, ad_approval_date, remarks
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating ad campaign:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}