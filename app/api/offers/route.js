import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/offers:
 *   get:
 *     summary: Get all offers
 *     description: Retrieve a list of all marketing offers with optional filtering and pagination
 *     tags: [Offers]
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
 *         name: offer_status
 *         schema:
 *           type: string
 *         description: Filter by offer status
 *       - in: query
 *         name: offer_type
 *         schema:
 *           type: string
 *         description: Filter by offer type
 *     responses:
 *       200:
 *         description: List of offers
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
    const offer_status = searchParams.get('offer_status');
    const offer_type = searchParams.get('offer_type');

    let queryText = 'SELECT * FROM offers WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (offer_status) {
      queryText += ` AND offer_status = $${paramIndex}`;
      params.push(offer_status);
      paramIndex++;
    }

    if (offer_type) {
      queryText += ` AND offer_type = $${paramIndex}`;
      params.push(offer_type);
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
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/offers:
 *   post:
 *     summary: Create a new offer
 *     description: Create a new marketing offer with the provided data
 *     tags: [Offers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - offer_id
 *               - offer_title
 *               - offer_type
 *               - offer_status
 *             properties:
 *               offer_id:
 *                 type: string
 *               offer_title:
 *                 type: string
 *               offer_type:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               applicable_products:
 *                 type: string
 *               discount_value:
 *                 type: integer
 *               terms_and_conditions:
 *                 type: string
 *               offer_status:
 *                 type: string
 *               claimed_count:
 *                 type: integer
 *               offer_channel:
 *                 type: string
 *               promo_code:
 *                 type: string
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Offer created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    const {
      offer_id,
      offer_title,
      offer_type,
      start_date,
      end_date,
      applicable_products,
      discount_value,
      terms_and_conditions,
      offer_status,
      claimed_count,
      offer_channel,
      promo_code,
      remarks
    } = body;

    if (!offer_id || !offer_title || !offer_type || !offer_status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO offers (
        offer_id, offer_title, offer_type, start_date, end_date,
        applicable_products, discount_value, terms_and_conditions,
        offer_status, claimed_count, offer_channel, promo_code,
        remarks, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *`,
      [
        offer_id, offer_title, offer_type, start_date, end_date,
        applicable_products, discount_value, terms_and_conditions,
        offer_status, claimed_count, offer_channel, promo_code, remarks
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}