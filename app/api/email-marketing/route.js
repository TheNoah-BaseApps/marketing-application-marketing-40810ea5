import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/email-marketing:
 *   get:
 *     summary: Get all email marketing campaigns
 *     description: Retrieve a list of all email marketing campaigns with optional filtering and pagination
 *     tags: [Email Marketing]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *       - in: query
 *         name: email_content_type
 *         schema:
 *           type: string
 *         description: Filter by email content type
 *     responses:
 *       200:
 *         description: List of email marketing campaigns
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const email_content_type = searchParams.get('email_content_type');

    let queryText = 'SELECT * FROM email_marketing WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (email_content_type) {
      queryText += ` AND email_content_type = $${paramIndex}`;
      params.push(email_content_type);
      paramIndex++;
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching email marketing campaigns:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/email-marketing:
 *   post:
 *     summary: Create a new email marketing campaign
 *     description: Create a new email marketing campaign with the provided data
 *     tags: [Email Marketing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email_campaign_id
 *               - subject_line
 *               - sender_name
 *               - email_content_type
 *             properties:
 *               email_campaign_id:
 *                 type: string
 *               subject_line:
 *                 type: string
 *               sender_name:
 *                 type: string
 *               send_date:
 *                 type: string
 *                 format: date-time
 *               email_list_size:
 *                 type: integer
 *               open_rate:
 *                 type: integer
 *               click_rate:
 *                 type: integer
 *               bounce_rate:
 *                 type: integer
 *               unsubscribe_count:
 *                 type: integer
 *               conversion_count:
 *                 type: integer
 *               email_content_type:
 *                 type: string
 *               tested_a_or_b:
 *                 type: boolean
 *               test_winner:
 *                 type: string
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Email marketing campaign created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    const {
      email_campaign_id,
      subject_line,
      sender_name,
      send_date,
      email_list_size,
      open_rate,
      click_rate,
      bounce_rate,
      unsubscribe_count,
      conversion_count,
      email_content_type,
      tested_a_or_b,
      test_winner,
      remarks
    } = body;

    if (!email_campaign_id || !subject_line || !sender_name || !email_content_type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO email_marketing (
        email_campaign_id, subject_line, sender_name, send_date,
        email_list_size, open_rate, click_rate, bounce_rate,
        unsubscribe_count, conversion_count, email_content_type,
        tested_a_or_b, test_winner, remarks, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING *`,
      [
        email_campaign_id, subject_line, sender_name, send_date,
        email_list_size, open_rate, click_rate, bounce_rate,
        unsubscribe_count, conversion_count, email_content_type,
        tested_a_or_b, test_winner, remarks
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating email marketing campaign:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}