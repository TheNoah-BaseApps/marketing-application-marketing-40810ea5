import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/social-campaigns:
 *   get:
 *     summary: Get all social campaigns
 *     description: Retrieve a list of all social media campaigns with optional filtering
 *     tags:
 *       - Social Campaigns
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
 *         name: platform
 *         schema:
 *           type: string
 *         description: Filter by platform
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Successfully retrieved social campaigns
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
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');

    let sql = 'SELECT * FROM social_campaigns WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (platform) {
      sql += ` AND platform = $${paramIndex}`;
      params.push(platform);
      paramIndex++;
    }

    if (status) {
      sql += ` AND status = $${paramIndex}`;
      params.push(status);
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
    console.error('Error fetching social campaigns:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/social-campaigns:
 *   post:
 *     summary: Create a new social campaign
 *     description: Create a new social media campaign with the provided data
 *     tags:
 *       - Social Campaigns
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - campaign_id
 *               - platform
 *               - campaign_title
 *               - status
 *             properties:
 *               campaign_id:
 *                 type: string
 *               platform:
 *                 type: string
 *               campaign_title:
 *                 type: string
 *               launch_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               target_audience:
 *                 type: string
 *               budget_allocated:
 *                 type: integer
 *               impressions_count:
 *                 type: integer
 *               engagement_rate:
 *                 type: integer
 *               click_through_rate:
 *                 type: integer
 *               leads_generated:
 *                 type: integer
 *               campaign_manager_name:
 *                 type: string
 *               status:
 *                 type: string
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Social campaign created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      campaign_id,
      platform,
      campaign_title,
      launch_date,
      end_date,
      target_audience,
      budget_allocated,
      impressions_count,
      engagement_rate,
      click_through_rate,
      leads_generated,
      campaign_manager_name,
      status,
      remarks
    } = body;

    if (!campaign_id || !platform || !campaign_title || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO social_campaigns (
        campaign_id, platform, campaign_title, launch_date, end_date,
        target_audience, budget_allocated, impressions_count,
        engagement_rate, click_through_rate, leads_generated,
        campaign_manager_name, status, remarks, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING *`,
      [
        campaign_id, platform, campaign_title, launch_date, end_date,
        target_audience, budget_allocated, impressions_count,
        engagement_rate, click_through_rate, leads_generated,
        campaign_manager_name, status, remarks
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating social campaign:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}