import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/marketing-videos:
 *   get:
 *     summary: Get all marketing videos
 *     description: Retrieve a list of all marketing videos with pagination and filtering
 *     tags: [Marketing Videos]
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
 *         name: video_type
 *         schema:
 *           type: string
 *         description: Filter by video type
 *     responses:
 *       200:
 *         description: List of marketing videos
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
    const videoType = searchParams.get('video_type');
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM marketing_videos';
    let countText = 'SELECT COUNT(*) FROM marketing_videos';
    const queryParams = [];
    const countParams = [];

    if (videoType) {
      queryText += ' WHERE video_type = $1';
      countText += ' WHERE video_type = $1';
      queryParams.push(videoType);
      countParams.push(videoType);
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
    console.error('Error fetching marketing videos:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/marketing-videos:
 *   post:
 *     summary: Create a new marketing video
 *     description: Create a new marketing video entry
 *     tags: [Marketing Videos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - video_title
 *               - video_type
 *             properties:
 *               video_title:
 *                 type: string
 *               duration_seconds:
 *                 type: integer
 *               upload_date:
 *                 type: string
 *                 format: date-time
 *               video_type:
 *                 type: string
 *               video_format:
 *                 type: string
 *               views_count:
 *                 type: integer
 *               likes_count:
 *                 type: integer
 *               platform_distributed_on:
 *                 type: string
 *               created_by:
 *                 type: string
 *               subtitles_available:
 *                 type: boolean
 *               performance_rating:
 *                 type: integer
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Video created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      video_title,
      duration_seconds,
      upload_date,
      video_type,
      video_format,
      views_count,
      likes_count,
      platform_distributed_on,
      created_by,
      subtitles_available,
      performance_rating,
      remarks
    } = body;

    if (!video_title || !video_type) {
      return NextResponse.json(
        { success: false, error: 'Video title and type are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO marketing_videos (
        video_title, duration_seconds, upload_date, video_type, video_format,
        views_count, likes_count, platform_distributed_on, created_by,
        subtitles_available, performance_rating, remarks
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        video_title,
        duration_seconds || null,
        upload_date || null,
        video_type,
        video_format || null,
        views_count || 0,
        likes_count || 0,
        platform_distributed_on || null,
        created_by || null,
        subtitles_available || false,
        performance_rating || null,
        remarks || null
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating marketing video:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}