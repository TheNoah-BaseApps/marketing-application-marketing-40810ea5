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
import { FileText, Plus, Edit, Trash2, Download, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function WhitePapersPage() {
  const [whitePapers, setWhitePapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author_name: '',
    department: '',
    publication_date: '',
    version: '',
    total_pages: '',
    downloads_count: '0',
    target_audience: '',
    keywords: '',
    usage_status: 'active',
    feedback_received: '',
    remarks: ''
  });

  useEffect(() => {
    fetchWhitePapers();
  }, []);

  async function fetchWhitePapers() {
    try {
      setLoading(true);
      const response = await fetch('/api/white-papers');
      const data = await response.json();
      if (data.success) {
        setWhitePapers(data.data);
      } else {
        toast.error('Failed to fetch white papers');
      }
    } catch (error) {
      console.error('Error fetching white papers:', error);
      toast.error('Error loading white papers');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch('/api/white-papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('White paper created successfully');
        setIsAddOpen(false);
        resetForm();
        fetchWhitePapers();
      } else {
        toast.error(data.error || 'Failed to create white paper');
      }
    } catch (error) {
      console.error('Error creating white paper:', error);
      toast.error('Error creating white paper');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      const response = await fetch(`/api/white-papers/${selectedPaper.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('White paper updated successfully');
        setIsEditOpen(false);
        setSelectedPaper(null);
        resetForm();
        fetchWhitePapers();
      } else {
        toast.error(data.error || 'Failed to update white paper');
      }
    } catch (error) {
      console.error('Error updating white paper:', error);
      toast.error('Error updating white paper');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this white paper?')) return;
    try {
      const response = await fetch(`/api/white-papers/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        toast.success('White paper deleted successfully');
        fetchWhitePapers();
      } else {
        toast.error(data.error || 'Failed to delete white paper');
      }
    } catch (error) {
      console.error('Error deleting white paper:', error);
      toast.error('Error deleting white paper');
    }
  }

  function openEditDialog(paper) {
    setSelectedPaper(paper);
    setFormData({
      title: paper.title || '',
      author_name: paper.author_name || '',
      department: paper.department || '',
      publication_date: paper.publication_date ? new Date(paper.publication_date).toISOString().split('T')[0] : '',
      version: paper.version || '',
      total_pages: paper.total_pages || '',
      downloads_count: paper.downloads_count || '0',
      target_audience: paper.target_audience || '',
      keywords: paper.keywords || '',
      usage_status: paper.usage_status || 'active',
      feedback_received: paper.feedback_received || '',
      remarks: paper.remarks || ''
    });
    setIsEditOpen(true);
  }

  function resetForm() {
    setFormData({
      title: '',
      author_name: '',
      department: '',
      publication_date: '',
      version: '',
      total_pages: '',
      downloads_count: '0',
      target_audience: '',
      keywords: '',
      usage_status: 'active',
      feedback_received: '',
      remarks: ''
    });
  }

  const stats = {
    total: whitePapers.length,
    active: whitePapers.filter(p => p.usage_status === 'active').length,
    totalDownloads: whitePapers.reduce((sum, p) => sum + (p.downloads_count || 0), 0),
    avgPages: whitePapers.length > 0 ? Math.round(whitePapers.reduce((sum, p) => sum + (p.total_pages || 0), 0) / whitePapers.length) : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg font-medium">Loading white papers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">White Papers</h1>
          <p className="text-muted-foreground mt-1">Manage your marketing white papers and research documents</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add White Paper
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New White Paper</DialogTitle>
              <DialogDescription>Add a new white paper to your content library</DialogDescription>
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
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="publication_date">Publication Date</Label>
                  <Input
                    id="publication_date"
                    type="date"
                    value={formData.publication_date}
                    onChange={(e) => setFormData({ ...formData, publication_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="1.0"
                  />
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
                  <Label htmlFor="target_audience">Target Audience</Label>
                  <Input
                    id="target_audience"
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    placeholder="Marketing professionals, Business leaders"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="marketing, strategy, digital transformation"
                  />
                </div>
                <div>
                  <Label htmlFor="usage_status">Status *</Label>
                  <Select value={formData.usage_status} onValueChange={(value) => setFormData({ ...formData, usage_status: value })}>
                    <SelectTrigger id="usage_status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="feedback_received">Feedback Received</Label>
                  <Textarea
                    id="feedback_received"
                    value={formData.feedback_received}
                    onChange={(e) => setFormData({ ...formData, feedback_received: e.target.value })}
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
                <Button type="submit">Create White Paper</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Papers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
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
            <CardTitle className="text-sm font-medium">Avg Pages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgPages}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All White Papers</CardTitle>
          <CardDescription>A list of all your marketing white papers</CardDescription>
        </CardHeader>
        <CardContent>
          {whitePapers.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No white papers yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">Get started by creating your first white paper</p>
              <Button className="mt-4" onClick={() => setIsAddOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add White Paper
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {whitePapers.map((paper) => (
                  <TableRow key={paper.id}>
                    <TableCell className="font-medium">{paper.title}</TableCell>
                    <TableCell>{paper.author_name}</TableCell>
                    <TableCell>{paper.department}</TableCell>
                    <TableCell>{paper.version || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={paper.usage_status === 'active' ? 'default' : 'secondary'}>
                        {paper.usage_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-muted-foreground" />
                        {paper.downloads_count || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(paper)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(paper.id)}>
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
            <DialogTitle>Edit White Paper</DialogTitle>
            <DialogDescription>Update white paper information</DialogDescription>
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
                <Label htmlFor="edit_department">Department *</Label>
                <Input
                  id="edit_department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_publication_date">Publication Date</Label>
                <Input
                  id="edit_publication_date"
                  type="date"
                  value={formData.publication_date}
                  onChange={(e) => setFormData({ ...formData, publication_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_version">Version</Label>
                <Input
                  id="edit_version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                />
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
                <Label htmlFor="edit_target_audience">Target Audience</Label>
                <Input
                  id="edit_target_audience"
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit_keywords">Keywords</Label>
                <Input
                  id="edit_keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_usage_status">Status *</Label>
                <Select value={formData.usage_status} onValueChange={(value) => setFormData({ ...formData, usage_status: value })}>
                  <SelectTrigger id="edit_usage_status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit_feedback_received">Feedback Received</Label>
                <Textarea
                  id="edit_feedback_received"
                  value={formData.feedback_received}
                  onChange={(e) => setFormData({ ...formData, feedback_received: e.target.value })}
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
              <Button type="button" variant="outline" onClick={() => { setIsEditOpen(false); setSelectedPaper(null); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Update White Paper</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}