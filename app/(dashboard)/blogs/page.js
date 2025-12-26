'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Plus, Edit, Trash2, TrendingUp, MessageSquare, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [formData, setFormData] = useState({
    blog_title: '',
    author_name: '',
    category: '',
    tags: '',
    published_date: '',
    word_count: '',
    read_time_minutes: '',
    blog_status: 'draft',
    seo_score: '',
    comments_count: '0',
    social_shares_count: '0',
    remarks: ''
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function fetchBlogs() {
    try {
      setLoading(true);
      const response = await fetch('/api/blogs');
      const data = await response.json();
      if (data.success) {
        setBlogs(data.data);
      } else {
        toast.error('Failed to fetch blogs');
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Error loading blogs');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Blog created successfully');
        setIsAddOpen(false);
        resetForm();
        fetchBlogs();
      } else {
        toast.error(data.error || 'Failed to create blog');
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      toast.error('Error creating blog');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      const response = await fetch(`/api/blogs/${selectedBlog.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Blog updated successfully');
        setIsEditOpen(false);
        setSelectedBlog(null);
        resetForm();
        fetchBlogs();
      } else {
        toast.error(data.error || 'Failed to update blog');
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      toast.error('Error updating blog');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    try {
      const response = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        toast.success('Blog deleted successfully');
        fetchBlogs();
      } else {
        toast.error(data.error || 'Failed to delete blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Error deleting blog');
    }
  }

  function openEditDialog(blog) {
    setSelectedBlog(blog);
    setFormData({
      blog_title: blog.blog_title || '',
      author_name: blog.author_name || '',
      category: blog.category || '',
      tags: blog.tags || '',
      published_date: blog.published_date ? new Date(blog.published_date).toISOString().split('T')[0] : '',
      word_count: blog.word_count || '',
      read_time_minutes: blog.read_time_minutes || '',
      blog_status: blog.blog_status || 'draft',
      seo_score: blog.seo_score || '',
      comments_count: blog.comments_count || '0',
      social_shares_count: blog.social_shares_count || '0',
      remarks: blog.remarks || ''
    });
    setIsEditOpen(true);
  }

  function resetForm() {
    setFormData({
      blog_title: '',
      author_name: '',
      category: '',
      tags: '',
      published_date: '',
      word_count: '',
      read_time_minutes: '',
      blog_status: 'draft',
      seo_score: '',
      comments_count: '0',
      social_shares_count: '0',
      remarks: ''
    });
  }

  const stats = {
    total: blogs.length,
    published: blogs.filter(b => b.blog_status === 'published').length,
    draft: blogs.filter(b => b.blog_status === 'draft').length,
    avgSeoScore: blogs.length > 0 ? Math.round(blogs.reduce((sum, b) => sum + (b.seo_score || 0), 0) / blogs.length) : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg font-medium">Loading blogs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blogs</h1>
          <p className="text-muted-foreground mt-1">Manage your marketing blogs and content</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Blog
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Blog</DialogTitle>
              <DialogDescription>Add a new blog to your content library</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="blog_title">Blog Title *</Label>
                  <Input
                    id="blog_title"
                    value={formData.blog_title}
                    onChange={(e) => setFormData({ ...formData, blog_title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="author_name">Author Name *</Label>
                  <Input
                    id="author_name"
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="technology, marketing, seo"
                  />
                </div>
                <div>
                  <Label htmlFor="published_date">Published Date</Label>
                  <Input
                    id="published_date"
                    type="date"
                    value={formData.published_date}
                    onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="word_count">Word Count</Label>
                  <Input
                    id="word_count"
                    type="number"
                    value={formData.word_count}
                    onChange={(e) => setFormData({ ...formData, word_count: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="read_time_minutes">Read Time (minutes)</Label>
                  <Input
                    id="read_time_minutes"
                    type="number"
                    value={formData.read_time_minutes}
                    onChange={(e) => setFormData({ ...formData, read_time_minutes: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="blog_status">Status *</Label>
                  <Select value={formData.blog_status} onValueChange={(value) => setFormData({ ...formData, blog_status: value })}>
                    <SelectTrigger id="blog_status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="seo_score">SEO Score</Label>
                  <Input
                    id="seo_score"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.seo_score}
                    onChange={(e) => setFormData({ ...formData, seo_score: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setIsAddOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit">Create Blog</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg SEO Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgSeoScore}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Blogs</CardTitle>
          <CardDescription>A list of all your marketing blogs</CardDescription>
        </CardHeader>
        <CardContent>
          {blogs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No blogs yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">Get started by creating your first blog post</p>
              <Button className="mt-4" onClick={() => setIsAddOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Blog
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SEO</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogs.map((blog) => (
                  <TableRow key={blog.id}>
                    <TableCell className="font-medium">{blog.blog_title}</TableCell>
                    <TableCell>{blog.author_name}</TableCell>
                    <TableCell>{blog.category}</TableCell>
                    <TableCell>
                      <Badge variant={blog.blog_status === 'published' ? 'default' : 'secondary'}>
                        {blog.blog_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        {blog.seo_score || 0}/100
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {blog.comments_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="h-3 w-3" />
                          {blog.social_shares_count || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(blog)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(blog.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog</DialogTitle>
            <DialogDescription>Update blog information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="edit_blog_title">Blog Title *</Label>
                <Input
                  id="edit_blog_title"
                  value={formData.blog_title}
                  onChange={(e) => setFormData({ ...formData, blog_title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_author_name">Author Name *</Label>
                <Input
                  id="edit_author_name"
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_category">Category *</Label>
                <Input
                  id="edit_category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_tags">Tags</Label>
                <Input
                  id="edit_tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_published_date">Published Date</Label>
                <Input
                  id="edit_published_date"
                  type="date"
                  value={formData.published_date}
                  onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_word_count">Word Count</Label>
                <Input
                  id="edit_word_count"
                  type="number"
                  value={formData.word_count}
                  onChange={(e) => setFormData({ ...formData, word_count: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_read_time_minutes">Read Time (minutes)</Label>
                <Input
                  id="edit_read_time_minutes"
                  type="number"
                  value={formData.read_time_minutes}
                  onChange={(e) => setFormData({ ...formData, read_time_minutes: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_blog_status">Status *</Label>
                <Select value={formData.blog_status} onValueChange={(value) => setFormData({ ...formData, blog_status: value })}>
                  <SelectTrigger id="edit_blog_status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_seo_score">SEO Score</Label>
                <Input
                  id="edit_seo_score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.seo_score}
                  onChange={(e) => setFormData({ ...formData, seo_score: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit_remarks">Remarks</Label>
                <Textarea
                  id="edit_remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setIsEditOpen(false); setSelectedBlog(null); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Update Blog</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}