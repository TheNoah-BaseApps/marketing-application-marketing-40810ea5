import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/email-marketing/{id}:
 *   get:
 *     summary: Get email marketing campaign by ID
 *     description: Retrieve a single email marketing campaign by its ID
 *     tags: [Email Marketing]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Email marketing campaign ID
 *     responses:
 *       200:
 *         description: Email marketing campaign details
 *       404:
 *         description: Email marketing campaign not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM email_marketing WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Email marketing campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching email marketing campaign:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/email-marketing/{id}:
 *   put:
 *     summary: Update email marketing campaign
 *     description: Update an existing email marketing campaign
 *     tags: [Email Marketing]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Email marketing campaign updated successfully
 *       404:
 *         description: Email marketing campaign not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const updates = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = [
      'email_campaign_id', 'subject_line', 'sender_name', 'send_date',
      'email_list_size', 'open_rate', 'click_rate', 'bounce_rate',
      'unsubscribe_count', 'conversion_count', 'email_content_type',
      'tested_a_or_b', 'test_winner', 'remarks'
    ];

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE email_marketing SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Email marketing campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating email marketing campaign:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/email-marketing/{id}:
 *   delete:
 *     summary: Delete email marketing campaign
 *     description: Delete an email marketing campaign by ID
 *     tags: [Email Marketing]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email marketing campaign deleted successfully
 *       404:
 *         description: Email marketing campaign not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM email_marketing WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Email marketing campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email marketing campaign deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting email marketing campaign:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}