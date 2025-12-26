import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/email-analysis:
 *   get:
 *     summary: Get all email analysis records
 *     description: Retrieve all email analysis records with pagination and filtering
 *     tags: [Email Analysis]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by campaign name or email subject
 *     responses:
 *       200:
 *         description: List of email analysis records retrieved successfully
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
 *                 total:
 *                   type: integer
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [limit, offset];
    
    if (search) {
      whereClause = 'WHERE campaign_name ILIKE $3 OR email_subject_line ILIKE $3';
      params = [limit, offset, `%${search}%`];
    }

    const result = await query(
      `SELECT * FROM email_analysis ${whereClause} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM email_analysis ${whereClause}`,
      search ? [`%${search}%`] : []
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      total: parseInt(countResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching email analysis:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/email-analysis:
 *   post:
 *     summary: Create a new email analysis record
 *     description: Create a new email analysis record with campaign performance data
 *     tags: [Email Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email_analysis_id
 *               - campaign_id
 *               - campaign_name
 *               - email_subject_line
 *             properties:
 *               email_analysis_id:
 *                 type: string
 *               campaign_id:
 *                 type: string
 *               campaign_name:
 *                 type: string
 *               email_subject_line:
 *                 type: string
 *               send_date:
 *                 type: string
 *                 format: date-time
 *               recipient_count:
 *                 type: integer
 *               open_rate_percent:
 *                 type: integer
 *               click_through_rate:
 *                 type: integer
 *               bounce_rate_percent:
 *                 type: integer
 *               unsubscribe_rate:
 *                 type: integer
 *               spam_complaint_count:
 *                 type: integer
 *               most_clicked_link:
 *                 type: string
 *               device_breakdown:
 *                 type: string
 *               time_to_open_average:
 *                 type: integer
 *               engagement_score:
 *                 type: integer
 *               analysis_generated_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Email analysis record created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      email_analysis_id,
      campaign_id,
      campaign_name,
      email_subject_line,
      send_date,
      recipient_count,
      open_rate_percent,
      click_through_rate,
      bounce_rate_percent,
      unsubscribe_rate,
      spam_complaint_count,
      most_clicked_link,
      device_breakdown,
      time_to_open_average,
      engagement_score,
      analysis_generated_date
    } = body;

    if (!email_analysis_id || !campaign_id || !campaign_name || !email_subject_line) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: email_analysis_id, campaign_id, campaign_name, email_subject_line' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO email_analysis (
        email_analysis_id, campaign_id, campaign_name, email_subject_line,
        send_date, recipient_count, open_rate_percent, click_through_rate,
        bounce_rate_percent, unsubscribe_rate, spam_complaint_count, most_clicked_link,
        device_breakdown, time_to_open_average, engagement_score, analysis_generated_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      [
        email_analysis_id, campaign_id, campaign_name, email_subject_line,
        send_date, recipient_count, open_rate_percent, click_through_rate,
        bounce_rate_percent, unsubscribe_rate, spam_complaint_count, most_clicked_link,
        device_breakdown, time_to_open_average, engagement_score, analysis_generated_date
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating email analysis:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}