import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/marketing-audios:
 *   get:
 *     summary: Get all marketing audios
 *     description: Retrieve a list of all marketing audio content with pagination and filtering
 *     tags: [Marketing Audios]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: audio_type
 *         schema:
 *           type: string
 *         description: Filter by audio type
 *     responses:
 *       200:
 *         description: List of marketing audios
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
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const audioType = searchParams.get('audio_type');
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM marketing_audios';
    let countText = 'SELECT COUNT(*) FROM marketing_audios';
    const queryParams = [];
    const countParams = [];

    if (audioType) {
      queryText += ' WHERE audio_type = $1';
      countText += ' WHERE audio_type = $1';
      queryParams.push(audioType);
      countParams.push(audioType);
    }

    queryText += ' ORDER BY created_at DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
    queryParams.push(limit, offset);

    const [dataResult, countResult] = await Promise.all([
      query(queryText, queryParams),
      query(countText, countParams)
    ]);

    return NextResponse.json({
      success: true,
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching marketing audios:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/marketing-audios:
 *   post:
 *     summary: Create a new marketing audio
 *     description: Create a new marketing audio entry
 *     tags: [Marketing Audios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - audio_title
 *               - audio_type
 *             properties:
 *               audio_title:
 *                 type: string
 *               audio_type:
 *                 type: string
 *               duration_seconds:
 *                 type: integer
 *               recorded_date:
 *                 type: string
 *                 format: date-time
 *               release_date:
 *                 type: string
 *                 format: date-time
 *               format_type:
 *                 type: string
 *               published_on:
 *                 type: string
 *               listeners_count:
 *                 type: integer
 *               feedback_score:
 *                 type: integer
 *               created_by:
 *                 type: string
 *               licensing_info:
 *                 type: string
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Audio created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      audio_title,
      audio_type,
      duration_seconds,
      recorded_date,
      release_date,
      format_type,
      published_on,
      listeners_count,
      feedback_score,
      created_by,
      licensing_info,
      remarks
    } = body;

    if (!audio_title || !audio_type) {
      return NextResponse.json(
        { success: false, error: 'Audio title and type are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO marketing_audios (
        audio_title, audio_type, duration_seconds, recorded_date, release_date,
        format_type, published_on, listeners_count, feedback_score, created_by,
        licensing_info, remarks
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        audio_title,
        audio_type,
        duration_seconds || null,
        recorded_date || null,
        release_date || null,
        format_type || null,
        published_on || null,
        listeners_count || 0,
        feedback_score || null,
        created_by || null,
        licensing_info || null,
        remarks || null
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating marketing audio:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}