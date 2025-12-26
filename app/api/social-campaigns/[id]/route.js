import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/social-campaigns/{id}:
 *   get:
 *     summary: Get social campaign by ID
 *     tags:
 *       - Social Campaigns
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved social campaign
 *       404:
 *         description: Social campaign not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM social_campaigns WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Social campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching social campaign:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/social-campaigns/{id}:
 *   put:
 *     summary: Update social campaign
 *     tags:
 *       - Social Campaigns
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
 *         description: Social campaign updated successfully
 *       404:
 *         description: Social campaign not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
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

    const result = await query(
      `UPDATE social_campaigns SET
        campaign_id = $1, platform = $2, campaign_title = $3,
        launch_date = $4, end_date = $5, target_audience = $6,
        budget_allocated = $7, impressions_count = $8, engagement_rate = $9,
        click_through_rate = $10, leads_generated = $11,
        campaign_manager_name = $12, status = $13, remarks = $14,
        updated_at = NOW()
      WHERE id = $15
      RETURNING *`,
      [
        campaign_id, platform, campaign_title, launch_date, end_date,
        target_audience, budget_allocated, impressions_count,
        engagement_rate, click_through_rate, leads_generated,
        campaign_manager_name, status, remarks, id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Social campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating social campaign:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/social-campaigns/{id}:
 *   delete:
 *     summary: Delete social campaign
 *     tags:
 *       - Social Campaigns
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Social campaign deleted successfully
 *       404:
 *         description: Social campaign not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM social_campaigns WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Social campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Social campaign deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting social campaign:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}