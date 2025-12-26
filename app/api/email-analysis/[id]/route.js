import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/email-analysis/{id}:
 *   get:
 *     summary: Get email analysis by ID
 *     description: Retrieve a specific email analysis record by ID
 *     tags: [Email Analysis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Email analysis record ID
 *     responses:
 *       200:
 *         description: Email analysis record retrieved successfully
 *       404:
 *         description: Email analysis record not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM email_analysis WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Email analysis not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching email analysis:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/email-analysis/{id}:
 *   put:
 *     summary: Update email analysis
 *     description: Update an existing email analysis record
 *     tags: [Email Analysis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Email analysis record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campaign_name:
 *                 type: string
 *               email_subject_line:
 *                 type: string
 *               recipient_count:
 *                 type: integer
 *               open_rate_percent:
 *                 type: integer
 *               click_through_rate:
 *                 type: integer
 *               engagement_score:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Email analysis updated successfully
 *       404:
 *         description: Email analysis not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE email_analysis SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Email analysis not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating email analysis:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/email-analysis/{id}:
 *   delete:
 *     summary: Delete email analysis
 *     description: Delete an email analysis record
 *     tags: [Email Analysis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Email analysis record ID
 *     responses:
 *       200:
 *         description: Email analysis deleted successfully
 *       404:
 *         description: Email analysis not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM email_analysis WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Email analysis not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting email analysis:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}