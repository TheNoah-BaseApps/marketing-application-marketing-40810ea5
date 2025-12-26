import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/marketing-whatsapp:
 *   get:
 *     summary: Get all WhatsApp campaigns
 *     description: Retrieve all WhatsApp marketing campaigns with pagination and filtering
 *     tags: [Marketing WhatsApp]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of items to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *       - in: query
 *         name: message_type
 *         schema:
 *           type: string
 *         description: Filter by message type
 *       - in: query
 *         name: delivery_status
 *         schema:
 *           type: string
 *         description: Filter by delivery status
 *     responses:
 *       200:
 *         description: List of WhatsApp campaigns
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
    const message_type = searchParams.get('message_type');
    const delivery_status = searchParams.get('delivery_status');

    let sql = 'SELECT * FROM marketing_whatsapp WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (message_type) {
      sql += ` AND message_type = $${paramCount}`;
      params.push(message_type);
      paramCount++;
    }

    if (delivery_status) {
      sql += ` AND delivery_status = $${paramCount}`;
      params.push(delivery_status);
      paramCount++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching WhatsApp campaigns:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/marketing-whatsapp:
 *   post:
 *     summary: Create new WhatsApp campaign
 *     description: Create a new WhatsApp marketing campaign
 *     tags: [Marketing WhatsApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message_id
 *               - campaign_name
 *               - message_type
 *               - delivery_status
 *             properties:
 *               message_id:
 *                 type: string
 *               campaign_name:
 *                 type: string
 *               send_date:
 *                 type: string
 *                 format: date-time
 *               recipient_count:
 *                 type: integer
 *               open_rate:
 *                 type: integer
 *               click_rate:
 *                 type: integer
 *               message_type:
 *                 type: string
 *               media_attached:
 *                 type: boolean
 *               language_used:
 *                 type: string
 *               opt_out_count:
 *                 type: integer
 *               delivery_status:
 *                 type: string
 *               sender_name:
 *                 type: string
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      message_id,
      campaign_name,
      send_date,
      recipient_count,
      open_rate,
      click_rate,
      message_type,
      media_attached,
      language_used,
      opt_out_count,
      delivery_status,
      sender_name,
      remarks
    } = body;

    if (!message_id || !campaign_name || !message_type || !delivery_status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO marketing_whatsapp (
        message_id, campaign_name, send_date, recipient_count, open_rate,
        click_rate, message_type, media_attached, language_used, opt_out_count,
        delivery_status, sender_name, remarks, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *`,
      [
        message_id, campaign_name, send_date, recipient_count, open_rate,
        click_rate, message_type, media_attached, language_used, opt_out_count,
        delivery_status, sender_name, remarks
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating WhatsApp campaign:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}