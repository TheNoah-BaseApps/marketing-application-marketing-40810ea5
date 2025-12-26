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
import { BookOpen, Plus, Edit, Trash2, Download, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function EBooksPage() {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEbook, setSelectedEbook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author_name: '',
    genre: '',
    release_date: '',
    format_type: '',
    total_pages: '',
    downloads_count: '0',
    language: '',
    preview_available: false,
    ratings_average: '',
    feedback_summary: '',
    usage_permission: '',
    remarks: ''
  });

  useEffect(() => {
    fetchEbooks();
  }, []);

  async function fetchEbooks() {
    try {
      setLoading(true);
      const response = await fetch('/api/ebooks');
      const data = await response.json();
      if (data.success) {
        setEbooks(data.data);
      } else {
        toast.error('Failed to fetch ebooks');
      }
    } catch (error) {
      console.error('Error fetching ebooks:', error);
      toast.error('Error loading ebooks');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch('/api/ebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Ebook created successfully');
        setIsAddOpen(false);
        resetForm();
        fetchEbooks();
      } else {
        toast.error(data.error || 'Failed to create ebook');
      }
    } catch (error) {
      console.error('Error creating ebook:', error);
      toast.error('Error creating ebook');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      const response = await fetch(`/api/ebooks/${selectedEbook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Ebook updated successfully');
        setIsEditOpen(false);
        setSelectedEbook(null);
        resetForm();
        fetchEbooks();
      } else {
        toast.error(data.error || 'Failed to update ebook');
      }
    } catch (error) {
      console.error('Error updating ebook:', error);
      toast.error('Error updating ebook');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this ebook?')) return;
    try {
      const response = await fetch(`/api/ebooks/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        toast.success('Ebook deleted successfully');
        fetchEbooks();
      } else {
        toast.error(data.error || 'Failed to delete ebook');
      }
    } catch (error) {
      console.error('Error deleting ebook:', error);
      toast.error('Error deleting ebook');
    }
  }

  function openEditDialog(ebook) {
    setSelectedEbook(ebook);
    setFormData({
      title: ebook.title || '',
      author_name: ebook.author_name || '',
      genre: ebook.genre || '',
      release_date: ebook.release_date ? new Date(ebook.release_date).toISOString().split('T')[0] : '',
      format_type: ebook.format_type || '',
      total_pages: ebook.total_pages || '',
      downloads_count: ebook.downloads_count || '0',
      language: ebook.language || '',
      preview_available: ebook.preview_available || false,
      ratings_average: ebook.ratings_average || '',
      feedback_summary: ebook.feedback_summary || '',
      usage_permission: ebook.usage_permission || '',
      remarks: ebook.remarks || ''
    });
    setIsEditOpen(true);
  }

  function resetForm() {
    setFormData({
      title: '',
      author_name: '',
      genre: '',
      release_date: '',
      format_type: '',
      total_pages: '',
      downloads_count: '0',
      language: '',
      preview_available: false,
      ratings_average: '',
      feedback_summary: '',
      usage_permission: '',
      remarks: ''
    });
  }

  const stats = {
    total: ebooks.length,
    totalDownloads: ebooks.reduce((sum, e) => sum + (e.downloads_count || 0), 0),
    avgRating: ebooks.length > 0 ? (ebooks.reduce((sum, e) => sum + (e.ratings_average || 0), 0) / ebooks.length).toFixed(1) : 0,
    withPreview: ebooks.filter(e => e.preview_available).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg font-medium">Loading ebooks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">EBooks</h1>
          <p className="text-muted-foreground mt-1">Manage your marketing ebooks and digital publications</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add EBook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New EBook</DialogTitle>
              <DialogDescription>Add a new ebook to your content library</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  <Label htmlFor="genre">Genre *</Label>
                  <Input
                    id="genre"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="release_date">Release Date</Label>
                  <Input
                    id="release_date"
                    type="date"
                    value={formData.release_date}
                    onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="format_type">Format Type</Label>
                  <Select value={formData.format_type} onValueChange={(value) => setFormData({ ...formData, format_type: value })}>
                    <SelectTrigger id="format_type">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="EPUB">EPUB</SelectItem>
                      <SelectItem value="MOBI">MOBI</SelectItem>
                      <SelectItem value="AZW">AZW</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="total_pages">Total Pages</Label>
                  <Input
                    id="total_pages"
                    type="number"
                    value={formData.total_pages}
                    onChange={(e) => setFormData({ ...formData, total_pages: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    placeholder="English"
                  />
                </div>
                <div>
                  <Label htmlFor="ratings_average">Average Rating (1-5)</Label>
                  <Input
                    id="ratings_average"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.ratings_average}
                    onChange={(e) => setFormData({ ...formData, ratings_average: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="usage_permission">Usage Permission</Label>
                  <Select value={formData.usage_permission} onValueChange={(value) => setFormData({ ...formData, usage_permission: value })}>
                    <SelectTrigger id="usage_permission">
                      <SelectValue placeholder="Select permission" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                      <SelectItem value="internal">Internal Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="preview_available"
                      checked={formData.preview_available}
                      onChange={(e) => setFormData({ ...formData, preview_available: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="preview_available" className="cursor-pointer">Preview Available</Label>
                  </div>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="feedback_summary">Feedback Summary</Label>
                  <Textarea
                    id="feedback_summary"
                    value={formData.feedback_summary}
                    onChange={(e) => setFormData({ ...formData, feedback_summary: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setIsAddOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit">Create EBook</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total EBooks</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDownloads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Preview</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withPreview}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All EBooks</CardTitle>
          <CardDescription>A list of all your marketing ebooks</CardDescription>
        </CardHeader>
        <CardContent>
          {ebooks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No ebooks yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">Get started by creating your first ebook</p>
              <Button className="mt-4" onClick={() => setIsAddOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add EBook
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ebooks.map((ebook) => (
                  <TableRow key={ebook.id}>
                    <TableCell className="font-medium">{ebook.title}</TableCell>
                    <TableCell>{ebook.author_name}</TableCell>
                    <TableCell>{ebook.genre}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ebook.format_type || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        {ebook.ratings_average || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-muted-foreground" />
                        {ebook.downloads_count || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(ebook)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(ebook.id)}>
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
            <DialogTitle>Edit EBook</DialogTitle>
            <DialogDescription>Update ebook information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="edit_title">Title *</Label>
                <Input
                  id="edit_title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                <Label htmlFor="edit_genre">Genre *</Label>
                <Input
                  id="edit_genre"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_release_date">Release Date</Label>
                <Input
                  id="edit_release_date"
                  type="date"
                  value={formData.release_date}
                  onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_format_type">Format Type</Label>
                <Select value={formData.format_type} onValueChange={(value) => setFormData({ ...formData, format_type: value })}>
                  <SelectTrigger id="edit_format_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="EPUB">EPUB</SelectItem>
                    <SelectItem value="MOBI">MOBI</SelectItem>
                    <SelectItem value="AZW">AZW</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_total_pages">Total Pages</Label>
                <Input
                  id="edit_total_pages"
                  type="number"
                  value={formData.total_pages}
                  onChange={(e) => setFormData({ ...formData, total_pages: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_language">Language</Label>
                <Input
                  id="edit_language"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_ratings_average">Average Rating (1-5)</Label>
                <Input
                  id="edit_ratings_average"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.ratings_average}
                  onChange={(e) => setFormData({ ...formData, ratings_average: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_usage_permission">Usage Permission</Label>
                <Select value={formData.usage_permission} onValueChange={(value) => setFormData({ ...formData, usage_permission: value })}>
                  <SelectTrigger id="edit_usage_permission">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                    <SelectItem value="internal">Internal Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit_preview_available"
                    checked={formData.preview_available}
                    onChange={(e) => setFormData({ ...formData, preview_available: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="edit_preview_available" className="cursor-pointer">Preview Available</Label>
                </div>
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit_feedback_summary">Feedback Summary</Label>
                <Textarea
                  id="edit_feedback_summary"
                  value={formData.feedback_summary}
                  onChange={(e) => setFormData({ ...formData, feedback_summary: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit_remarks">Remarks</Label>
                <Textarea
                  id="edit_remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setIsEditOpen(false); setSelectedEbook(null); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Update EBook</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}