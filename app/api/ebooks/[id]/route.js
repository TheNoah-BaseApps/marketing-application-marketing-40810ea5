import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/ebooks/{id}:
 *   get:
 *     summary: Get a single ebook
 *     description: Retrieve details of a specific ebook by ID
 *     tags: [EBooks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ebook ID
 *     responses:
 *       200:
 *         description: Ebook details retrieved successfully
 *       404:
 *         description: Ebook not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM ebooks WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Ebook not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching ebook:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/ebooks/{id}:
 *   put:
 *     summary: Update an ebook
 *     description: Update an existing ebook's information
 *     tags: [EBooks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ebook ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ebook updated successfully
 *       404:
 *         description: Ebook not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
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

    const result = await query(
      `UPDATE ebooks SET 
        title = COALESCE($1, title),
        author_name = COALESCE($2, author_name),
        genre = COALESCE($3, genre),
        release_date = COALESCE($4, release_date),
        format_type = COALESCE($5, format_type),
        total_pages = COALESCE($6, total_pages),
        downloads_count = COALESCE($7, downloads_count),
        language = COALESCE($8, language),
        preview_available = COALESCE($9, preview_available),
        ratings_average = COALESCE($10, ratings_average),
        feedback_summary = COALESCE($11, feedback_summary),
        usage_permission = COALESCE($12, usage_permission),
        remarks = COALESCE($13, remarks)
      WHERE id = $14 
      RETURNING *`,
      [
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
        remarks,
        id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Ebook not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating ebook:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/ebooks/{id}:
 *   delete:
 *     summary: Delete an ebook
 *     description: Remove an ebook from the database
 *     tags: [EBooks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ebook ID
 *     responses:
 *       200:
 *         description: Ebook deleted successfully
 *       404:
 *         description: Ebook not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM ebooks WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Ebook not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting ebook:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}