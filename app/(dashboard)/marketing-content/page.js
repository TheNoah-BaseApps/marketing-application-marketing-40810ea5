'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Edit, Trash2, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function MarketingContentPage() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    avgEngagement: 0
  });

  const [formData, setFormData] = useState({
    content_id: '',
    content_title: '',
    content_type: '',
    author_name: '',
    created_date: '',
    published_date: '',
    word_count: '',
    seo_optimized: false,
    content_status: '',
    content_format: '',
    views_count: '',
    engagement_rate: '',
    remarks: ''
  });

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    try {
      setLoading(true);
      const res = await fetch('/api/marketing-content');
      const data = await res.json();
      
      if (data.success) {
        setContent(data.data);
        calculateStats(data.data);
      } else {
        toast.error('Failed to fetch content');
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Error loading content');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(data) {
    const total = data.length;
    const published = data.filter(c => c.content_status === 'Published').length;
    const draft = data.filter(c => c.content_status === 'Draft').length;
    const avgEngagement = data.length > 0 
      ? Math.round(data.reduce((sum, c) => sum + (c.engagement_rate || 0), 0) / data.length)
      : 0;

    setStats({ total, published, draft, avgEngagement });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/marketing-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Content created successfully');
        setShowAddModal(false);
        resetForm();
        fetchContent();
      } else {
        toast.error(data.error || 'Failed to create content');
      }
    } catch (error) {
      console.error('Error creating content:', error);
      toast.error('Error creating content');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    
    try {
      const res = await fetch(`/api/marketing-content/${selectedContent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Content updated successfully');
        setShowEditModal(false);
        setSelectedContent(null);
        resetForm();
        fetchContent();
      } else {
        toast.error(data.error || 'Failed to update content');
      }
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Error updating content');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const res = await fetch(`/api/marketing-content/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Content deleted successfully');
        fetchContent();
      } else {
        toast.error(data.error || 'Failed to delete content');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Error deleting content');
    }
  }

  function openEditModal(item) {
    setSelectedContent(item);
    setFormData({
      content_id: item.content_id,
      content_title: item.content_title,
      content_type: item.content_type,
      author_name: item.author_name,
      created_date: item.created_date ? item.created_date.split('T')[0] : '',
      published_date: item.published_date ? item.published_date.split('T')[0] : '',
      word_count: item.word_count || '',
      seo_optimized: item.seo_optimized || false,
      content_status: item.content_status,
      content_format: item.content_format || '',
      views_count: item.views_count || '',
      engagement_rate: item.engagement_rate || '',
      remarks: item.remarks || ''
    });
    setShowEditModal(true);
  }

  function resetForm() {
    setFormData({
      content_id: '',
      content_title: '',
      content_type: '',
      author_name: '',
      created_date: '',
      published_date: '',
      word_count: '',
      seo_optimized: false,
      content_status: '',
      content_format: '',
      views_count: '',
      engagement_rate: '',
      remarks: ''
    });
  }

  const statusColors = {
    'Published': 'bg-green-100 text-green-800',
    'Draft': 'bg-yellow-100 text-yellow-800',
    'Archived': 'bg-gray-100 text-gray-800'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Marketing Content</h1>
          <p className="text-gray-600">Manage your marketing content and publications</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Content</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-3xl">{stats.published}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Draft</CardDescription>
            <CardTitle className="text-3xl">{stats.draft}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Engagement</CardDescription>
            <CardTitle className="text-3xl">{stats.avgEngagement}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content List</CardTitle>
          <CardDescription>View and manage all marketing content</CardDescription>
        </CardHeader>
        <CardContent>
          {content.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first content piece.</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Content
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>SEO</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {content.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.content_title}</TableCell>
                    <TableCell>{item.content_type}</TableCell>
                    <TableCell>{item.author_name}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[item.content_status] || 'bg-gray-100 text-gray-800'}>
                        {item.content_status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.views_count || 0}</TableCell>
                    <TableCell>{item.engagement_rate || 0}%</TableCell>
                    <TableCell>
                      {item.seo_optimized ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                        >
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

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Content</DialogTitle>
            <DialogDescription>Create a new marketing content item</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="content_id">Content ID</Label>
                <Input
                  id="content_id"
                  value={formData.content_id}
                  onChange={(e) => setFormData({...formData, content_id: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="content_title">Content Title</Label>
                <Input
                  id="content_title"
                  value={formData.content_title}
                  onChange={(e) => setFormData({...formData, content_title: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="content_type">Content Type</Label>
                <Select value={formData.content_type} onValueChange={(value) => setFormData({...formData, content_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Blog">Blog</SelectItem>
                    <SelectItem value="Article">Article</SelectItem>
                    <SelectItem value="Social Post">Social Post</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Landing Page">Landing Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="author_name">Author Name</Label>
                <Input
                  id="author_name"
                  value={formData.author_name}
                  onChange={(e) => setFormData({...formData, author_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="created_date">Created Date</Label>
                <Input
                  id="created_date"
                  type="date"
                  value={formData.created_date}
                  onChange={(e) => setFormData({...formData, created_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="published_date">Published Date</Label>
                <Input
                  id="published_date"
                  type="date"
                  value={formData.published_date}
                  onChange={(e) => setFormData({...formData, published_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="word_count">Word Count</Label>
                <Input
                  id="word_count"
                  type="number"
                  value={formData.word_count}
                  onChange={(e) => setFormData({...formData, word_count: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="content_status">Status</Label>
                <Select value={formData.content_status} onValueChange={(value) => setFormData({...formData, content_status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="content_format">Content Format</Label>
                <Input
                  id="content_format"
                  value={formData.content_format}
                  onChange={(e) => setFormData({...formData, content_format: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="views_count">Views Count</Label>
                <Input
                  id="views_count"
                  type="number"
                  value={formData.views_count}
                  onChange={(e) => setFormData({...formData, views_count: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="engagement_rate">Engagement Rate (%)</Label>
                <Input
                  id="engagement_rate"
                  type="number"
                  value={formData.engagement_rate}
                  onChange={(e) => setFormData({...formData, engagement_rate: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="seo_optimized"
                  checked={formData.seo_optimized}
                  onChange={(e) => setFormData({...formData, seo_optimized: e.target.checked})}
                  className="h-4 w-4"
                />
                <Label htmlFor="seo_optimized">SEO Optimized</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Create Content</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>Update content information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_content_id">Content ID</Label>
                <Input
                  id="edit_content_id"
                  value={formData.content_id}
                  onChange={(e) => setFormData({...formData, content_id: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_content_title">Content Title</Label>
                <Input
                  id="edit_content_title"
                  value={formData.content_title}
                  onChange={(e) => setFormData({...formData, content_title: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_content_type">Content Type</Label>
                <Select value={formData.content_type} onValueChange={(value) => setFormData({...formData, content_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Blog">Blog</SelectItem>
                    <SelectItem value="Article">Article</SelectItem>
                    <SelectItem value="Social Post">Social Post</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Landing Page">Landing Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_author_name">Author Name</Label>
                <Input
                  id="edit_author_name"
                  value={formData.author_name}
                  onChange={(e) => setFormData({...formData, author_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_created_date">Created Date</Label>
                <Input
                  id="edit_created_date"
                  type="date"
                  value={formData.created_date}
                  onChange={(e) => setFormData({...formData, created_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_published_date">Published Date</Label>
                <Input
                  id="edit_published_date"
                  type="date"
                  value={formData.published_date}
                  onChange={(e) => setFormData({...formData, published_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_word_count">Word Count</Label>
                <Input
                  id="edit_word_count"
                  type="number"
                  value={formData.word_count}
                  onChange={(e) => setFormData({...formData, word_count: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_content_status">Status</Label>
                <Select value={formData.content_status} onValueChange={(value) => setFormData({...formData, content_status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_content_format">Content Format</Label>
                <Input
                  id="edit_content_format"
                  value={formData.content_format}
                  onChange={(e) => setFormData({...formData, content_format: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_views_count">Views Count</Label>
                <Input
                  id="edit_views_count"
                  type="number"
                  value={formData.views_count}
                  onChange={(e) => setFormData({...formData, views_count: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_engagement_rate">Engagement Rate (%)</Label>
                <Input
                  id="edit_engagement_rate"
                  type="number"
                  value={formData.engagement_rate}
                  onChange={(e) => setFormData({...formData, engagement_rate: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_seo_optimized"
                  checked={formData.seo_optimized}
                  onChange={(e) => setFormData({...formData, seo_optimized: e.target.checked})}
                  className="h-4 w-4"
                />
                <Label htmlFor="edit_seo_optimized">SEO Optimized</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="edit_remarks">Remarks</Label>
              <Textarea
                id="edit_remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setSelectedContent(null); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Update Content</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}