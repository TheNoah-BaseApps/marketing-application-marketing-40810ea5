import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/marketing-videos/{id}:
 *   get:
 *     summary: Get a marketing video by ID
 *     description: Retrieve a single marketing video by its ID
 *     tags: [Marketing Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Marketing video details
 *       404:
 *         description: Video not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'SELECT * FROM marketing_videos WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching marketing video:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/marketing-videos/{id}:
 *   put:
 *     summary: Update a marketing video
 *     description: Update an existing marketing video
 *     tags: [Marketing Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               video_title:
 *                 type: string
 *               duration_seconds:
 *                 type: integer
 *               video_type:
 *                 type: string
 *               views_count:
 *                 type: integer
 *               likes_count:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Video updated successfully
 *       404:
 *         description: Video not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
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

    const result = await query(
      `UPDATE marketing_videos SET
        video_title = COALESCE($1, video_title),
        duration_seconds = COALESCE($2, duration_seconds),
        upload_date = COALESCE($3, upload_date),
        video_type = COALESCE($4, video_type),
        video_format = COALESCE($5, video_format),
        views_count = COALESCE($6, views_count),
        likes_count = COALESCE($7, likes_count),
        platform_distributed_on = COALESCE($8, platform_distributed_on),
        created_by = COALESCE($9, created_by),
        subtitles_available = COALESCE($10, subtitles_available),
        performance_rating = COALESCE($11, performance_rating),
        remarks = COALESCE($12, remarks),
        updated_at = NOW()
      WHERE id = $13 RETURNING *`,
      [
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
        remarks,
        id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating marketing video:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/marketing-videos/{id}:
 *   delete:
 *     summary: Delete a marketing video
 *     description: Delete a marketing video by ID
 *     tags: [Marketing Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Video deleted successfully
 *       404:
 *         description: Video not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'DELETE FROM marketing_videos WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting marketing video:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}