import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/marketing-content:
 *   get:
 *     summary: Get all marketing content
 *     description: Retrieve all marketing content items with pagination and filtering
 *     tags: [Marketing Content]
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
 *         name: content_type
 *         schema:
 *           type: string
 *         description: Filter by content type
 *       - in: query
 *         name: content_status
 *         schema:
 *           type: string
 *         description: Filter by content status
 *     responses:
 *       200:
 *         description: List of marketing content items
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
    const content_type = searchParams.get('content_type');
    const content_status = searchParams.get('content_status');

    let sql = 'SELECT * FROM marketing_content WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (content_type) {
      sql += ` AND content_type = $${paramCount}`;
      params.push(content_type);
      paramCount++;
    }

    if (content_status) {
      sql += ` AND content_status = $${paramCount}`;
      params.push(content_status);
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
    console.error('Error fetching marketing content:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/marketing-content:
 *   post:
 *     summary: Create new marketing content
 *     description: Create a new marketing content item
 *     tags: [Marketing Content]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content_id
 *               - content_title
 *               - content_type
 *               - author_name
 *               - content_status
 *             properties:
 *               content_id:
 *                 type: string
 *               content_title:
 *                 type: string
 *               content_type:
 *                 type: string
 *               author_name:
 *                 type: string
 *               created_date:
 *                 type: string
 *                 format: date-time
 *               published_date:
 *                 type: string
 *                 format: date-time
 *               word_count:
 *                 type: integer
 *               seo_optimized:
 *                 type: boolean
 *               content_status:
 *                 type: string
 *               content_format:
 *                 type: string
 *               views_count:
 *                 type: integer
 *               engagement_rate:
 *                 type: integer
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Content created successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      content_id,
      content_title,
      content_type,
      author_name,
      created_date,
      published_date,
      word_count,
      seo_optimized,
      content_status,
      content_format,
      views_count,
      engagement_rate,
      remarks
    } = body;

    if (!content_id || !content_title || !content_type || !author_name || !content_status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO marketing_content (
        content_id, content_title, content_type, author_name, created_date,
        published_date, word_count, seo_optimized, content_status, content_format,
        views_count, engagement_rate, remarks, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *`,
      [
        content_id, content_title, content_type, author_name, created_date,
        published_date, word_count, seo_optimized, content_status, content_format,
        views_count, engagement_rate, remarks
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating marketing content:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}