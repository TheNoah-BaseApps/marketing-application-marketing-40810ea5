import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
 *     summary: Get a single blog
 *     description: Retrieve details of a specific blog by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog details retrieved successfully
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM blogs WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/blogs/{id}:
 *   put:
 *     summary: Update a blog
 *     description: Update an existing blog's information
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
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

    const result = await query(
      `UPDATE blogs SET 
        blog_title = COALESCE($1, blog_title),
        author_name = COALESCE($2, author_name),
        category = COALESCE($3, category),
        tags = COALESCE($4, tags),
        published_date = COALESCE($5, published_date),
        word_count = COALESCE($6, word_count),
        read_time_minutes = COALESCE($7, read_time_minutes),
        blog_status = COALESCE($8, blog_status),
        seo_score = COALESCE($9, seo_score),
        comments_count = COALESCE($10, comments_count),
        social_shares_count = COALESCE($11, social_shares_count),
        remarks = COALESCE($12, remarks),
        updated_date = NOW()
      WHERE id = $13 
      RETURNING *`,
      [
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
        remarks,
        id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/blogs/{id}:
 *   delete:
 *     summary: Delete a blog
 *     description: Remove a blog from the database
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM blogs WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}