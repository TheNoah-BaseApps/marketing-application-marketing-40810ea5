import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/ad-campaigns/{id}:
 *   get:
 *     summary: Get ad campaign by ID
 *     tags:
 *       - Ad Campaigns
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved ad campaign
 *       404:
 *         description: Ad campaign not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM ad_campaigns WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Ad campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching ad campaign:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/ad-campaigns/{id}:
 *   put:
 *     summary: Update ad campaign
 *     tags:
 *       - Ad Campaigns
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ad campaign updated successfully
 *       404:
 *         description: Ad campaign not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
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

    const result = await query(
      `UPDATE ad_campaigns SET
        ad_campaign_id = $1, ad_type = $2, ad_title = $3,
        platform_or_channel = $4, start_date = $5, end_date = $6,
        ad_budget = $7, target_demographic = $8, impressions_achieved = $9,
        cpm = $10, conversions_count = $11, creative_agency_name = $12,
        ad_approval_date = $13, remarks = $14, updated_at = NOW()
      WHERE id = $15
      RETURNING *`,
      [
        ad_campaign_id, ad_type, ad_title, platform_or_channel,
        start_date, end_date, ad_budget, target_demographic,
        impressions_achieved, cpm, conversions_count,
        creative_agency_name, ad_approval_date, remarks, id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Ad campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating ad campaign:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/ad-campaigns/{id}:
 *   delete:
 *     summary: Delete ad campaign
 *     tags:
 *       - Ad Campaigns
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ad campaign deleted successfully
 *       404:
 *         description: Ad campaign not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM ad_campaigns WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Ad campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Ad campaign deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ad campaign:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}