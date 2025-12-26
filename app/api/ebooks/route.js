import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/ebooks:
 *   get:
 *     summary: Get all ebooks
 *     description: Retrieve a list of all marketing ebooks with optional filtering and pagination
 *     tags: [EBooks]
 *     parameters:
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter by language
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of results
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: List of ebooks retrieved successfully
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre');
    const language = searchParams.get('language');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let queryText = 'SELECT * FROM ebooks WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (genre) {
      queryText += ` AND genre = $${paramCount}`;
      params.push(genre);
      paramCount++;
    }

    if (language) {
      queryText += ` AND language = $${paramCount}`;
      params.push(language);
      paramCount++;
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching ebooks:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/ebooks:
 *   post:
 *     summary: Create a new ebook
 *     description: Add a new marketing ebook to the database
 *     tags: [EBooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author_name
 *               - genre
 *             properties:
 *               title:
 *                 type: string
 *               author_name:
 *                 type: string
 *               genre:
 *                 type: string
 *               release_date:
 *                 type: string
 *                 format: date-time
 *               format_type:
 *                 type: string
 *               total_pages:
 *                 type: integer
 *               downloads_count:
 *                 type: integer
 *               language:
 *                 type: string
 *               preview_available:
 *                 type: boolean
 *               ratings_average:
 *                 type: integer
 *               feedback_summary:
 *                 type: string
 *               usage_permission:
 *                 type: string
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ebook created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      author_name,
      genre,
      release_date,
      format_type,
      total_pages,
      downloads_count,
      language,
      preview_available,
      ratings_average,
      feedback_summary,
      usage_permission,
      remarks
    } = body;

    if (!title || !author_name || !genre) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO ebooks (
        title, author_name, genre, release_date, format_type,
        total_pages, downloads_count, language, preview_available,
        ratings_average, feedback_summary, usage_permission, remarks, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()) 
      RETURNING *`,
      [
        title,
        author_name,
        genre,
        release_date || null,
        format_type || null,
        total_pages || null,
        downloads_count || 0,
        language || null,
        preview_available || false,
        ratings_average || null,
        feedback_summary || null,
        usage_permission || null,
        remarks || null
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating ebook:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}