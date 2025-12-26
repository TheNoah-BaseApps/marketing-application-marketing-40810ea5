import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/white-papers/{id}:
 *   get:
 *     summary: Get a single white paper
 *     description: Retrieve details of a specific white paper by ID
 *     tags: [White Papers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: White paper ID
 *     responses:
 *       200:
 *         description: White paper details retrieved successfully
 *       404:
 *         description: White paper not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM white_papers WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'White paper not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching white paper:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/white-papers/{id}:
 *   put:
 *     summary: Update a white paper
 *     description: Update an existing white paper's information
 *     tags: [White Papers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: White paper ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: White paper updated successfully
 *       404:
 *         description: White paper not found
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

    const result = await query(
      `UPDATE white_papers SET 
        title = COALESCE($1, title),
        author_name = COALESCE($2, author_name),
        department = COALESCE($3, department),
        publication_date = COALESCE($4, publication_date),
        version = COALESCE($5, version),
        total_pages = COALESCE($6, total_pages),
        downloads_count = COALESCE($7, downloads_count),
        target_audience = COALESCE($8, target_audience),
        keywords = COALESCE($9, keywords),
        usage_status = COALESCE($10, usage_status),
        feedback_received = COALESCE($11, feedback_received),
        remarks = COALESCE($12, remarks)
      WHERE id = $13 
      RETURNING *`,
      [
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
        remarks,
        id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'White paper not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating white paper:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/white-papers/{id}:
 *   delete:
 *     summary: Delete a white paper
 *     description: Remove a white paper from the database
 *     tags: [White Papers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: White paper ID
 *     responses:
 *       200:
 *         description: White paper deleted successfully
 *       404:
 *         description: White paper not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM white_papers WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'White paper not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting white paper:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}