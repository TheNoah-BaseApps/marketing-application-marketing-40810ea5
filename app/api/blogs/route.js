import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Get all blogs
 *     description: Retrieve a list of all marketing blogs with optional filtering and pagination
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by blog status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
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
 *         description: List of blogs retrieved successfully
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
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let queryText = 'SELECT * FROM blogs WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND blog_status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (category) {
      queryText += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/blogs:
 *   post:
 *     summary: Create a new blog
 *     description: Add a new marketing blog to the database
 *     tags: [Blogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - blog_title
 *               - author_name
 *               - category
 *               - blog_status
 *             properties:
 *               blog_title:
 *                 type: string
 *               author_name:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: string
 *               published_date:
 *                 type: string
 *                 format: date-time
 *               word_count:
 *                 type: integer
 *               read_time_minutes:
 *                 type: integer
 *               blog_status:
 *                 type: string
 *               seo_score:
 *                 type: integer
 *               comments_count:
 *                 type: integer
 *               social_shares_count:
 *                 type: integer
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Blog created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      blog_title,
      author_name,
      category,
      tags,
      published_date,
      word_count,
      read_time_minutes,
      blog_status,
      seo_score,
      comments_count,
      social_shares_count,
      remarks
    } = body;

    if (!blog_title || !author_name || !category || !blog_status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO blogs (
        blog_title, author_name, category, tags, published_date, 
        word_count, read_time_minutes, blog_status, seo_score, 
        comments_count, social_shares_count, remarks, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW()) 
      RETURNING *`,
      [
        blog_title,
        author_name,
        category,
        tags || null,
        published_date || null,
        word_count || null,
        read_time_minutes || null,
        blog_status,
        seo_score || null,
        comments_count || 0,
        social_shares_count || 0,
        remarks || null
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}