import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/marketing-audios/{id}:
 *   get:
 *     summary: Get a marketing audio by ID
 *     description: Retrieve a single marketing audio by its ID
 *     tags: [Marketing Audios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Audio ID
 *     responses:
 *       200:
 *         description: Marketing audio details
 *       404:
 *         description: Audio not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'SELECT * FROM marketing_audios WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Audio not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching marketing audio:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/marketing-audios/{id}:
 *   put:
 *     summary: Update a marketing audio
 *     description: Update an existing marketing audio
 *     tags: [Marketing Audios]
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
 *               audio_title:
 *                 type: string
 *               audio_type:
 *                 type: string
 *               duration_seconds:
 *                 type: integer
 *               listeners_count:
 *                 type: integer
 *               feedback_score:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Audio updated successfully
 *       404:
 *         description: Audio not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
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

    const result = await query(
      `UPDATE marketing_audios SET
        audio_title = COALESCE($1, audio_title),
        audio_type = COALESCE($2, audio_type),
        duration_seconds = COALESCE($3, duration_seconds),
        recorded_date = COALESCE($4, recorded_date),
        release_date = COALESCE($5, release_date),
        format_type = COALESCE($6, format_type),
        published_on = COALESCE($7, published_on),
        listeners_count = COALESCE($8, listeners_count),
        feedback_score = COALESCE($9, feedback_score),
        created_by = COALESCE($10, created_by),
        licensing_info = COALESCE($11, licensing_info),
        remarks = COALESCE($12, remarks),
        updated_at = NOW()
      WHERE id = $13 RETURNING *`,
      [
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
        remarks,
        id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Audio not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating marketing audio:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/marketing-audios/{id}:
 *   delete:
 *     summary: Delete a marketing audio
 *     description: Delete a marketing audio by ID
 *     tags: [Marketing Audios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Audio deleted successfully
 *       404:
 *         description: Audio not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'DELETE FROM marketing_audios WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Audio not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Audio deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting marketing audio:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}