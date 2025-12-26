import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/white-papers:
 *   get:
 *     summary: Get all white papers
 *     description: Retrieve a list of all marketing white papers with optional filtering and pagination
 *     tags: [White Papers]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by usage status
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
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
 *         description: List of white papers retrieved successfully
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let queryText = 'SELECT * FROM white_papers WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND usage_status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (department) {
      queryText += ` AND department = $${paramCount}`;
      params.push(department);
      paramCount++;
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching white papers:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/white-papers:
 *   post:
 *     summary: Create a new white paper
 *     description: Add a new marketing white paper to the database
 *     tags: [White Papers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author_name
 *               - department
 *               - usage_status
 *             properties:
 *               title:
 *                 type: string
 *               author_name:
 *                 type: string
 *               department:
 *                 type: string
 *               publication_date:
 *                 type: string
 *                 format: date-time
 *               version:
 *                 type: string
 *               total_pages:
 *                 type: integer
 *               downloads_count:
 *                 type: integer
 *               target_audience:
 *                 type: string
 *               keywords:
 *                 type: string
 *               usage_status:
 *                 type: string
 *               feedback_received:
 *                 type: string
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: White paper created successfully
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
      department,
      publication_date,
      version,
      total_pages,
      downloads_count,
      target_audience,
      keywords,
      usage_status,
      feedback_received,
      remarks
    } = body;

    if (!title || !author_name || !department || !usage_status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO white_papers (
        title, author_name, department, publication_date, version,
        total_pages, downloads_count, target_audience, keywords,
        usage_status, feedback_received, remarks, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW()) 
      RETURNING *`,
      [
        title,
        author_name,
        department,
        publication_date || null,
        version || null,
        total_pages || null,
        downloads_count || 0,
        target_audience || null,
        keywords || null,
        usage_status,
        feedback_received || null,
        remarks || null
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating white paper:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}