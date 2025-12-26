'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Pencil, Trash2, Plus, Search, BarChart3, TrendingUp, Users, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function EmailAnalysisPage() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    email_analysis_id: '',
    campaign_id: '',
    campaign_name: '',
    email_subject_line: '',
    send_date: '',
    recipient_count: '',
    open_rate_percent: '',
    click_through_rate: '',
    bounce_rate_percent: '',
    unsubscribe_rate: '',
    spam_complaint_count: '',
    most_clicked_link: '',
    device_breakdown: '',
    time_to_open_average: '',
    engagement_score: '',
    analysis_generated_date: ''
  });

  useEffect(() => {
    fetchAnalyses();
  }, []);

  async function fetchAnalyses() {
    try {
      const res = await fetch('/api/email-analysis');
      const data = await res.json();
      if (data.success) {
        setAnalyses(data.data);
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
      toast.error('Failed to load email analyses');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/email-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Email analysis created successfully');
        setShowAddModal(false);
        resetForm();
        fetchAnalyses();
      } else {
        toast.error(data.error || 'Failed to create analysis');
      }
    } catch (error) {
      console.error('Error creating analysis:', error);
      toast.error('Failed to create analysis');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/email-analysis/${selectedAnalysis.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Email analysis updated successfully');
        setShowEditModal(false);
        resetForm();
        fetchAnalyses();
      } else {
        toast.error(data.error || 'Failed to update analysis');
      }
    } catch (error) {
      console.error('Error updating analysis:', error);
      toast.error('Failed to update analysis');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this analysis?')) return;
    
    try {
      const res = await fetch(`/api/email-analysis/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Email analysis deleted successfully');
        fetchAnalyses();
      } else {
        toast.error(data.error || 'Failed to delete analysis');
      }
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast.error('Failed to delete analysis');
    }
  }

  function openEditModal(analysis) {
    setSelectedAnalysis(analysis);
    setFormData({
      email_analysis_id: analysis.email_analysis_id || '',
      campaign_id: analysis.campaign_id || '',
      campaign_name: analysis.campaign_name || '',
      email_subject_line: analysis.email_subject_line || '',
      send_date: analysis.send_date ? new Date(analysis.send_date).toISOString().split('T')[0] : '',
      recipient_count: analysis.recipient_count || '',
      open_rate_percent: analysis.open_rate_percent || '',
      click_through_rate: analysis.click_through_rate || '',
      bounce_rate_percent: analysis.bounce_rate_percent || '',
      unsubscribe_rate: analysis.unsubscribe_rate || '',
      spam_complaint_count: analysis.spam_complaint_count || '',
      most_clicked_link: analysis.most_clicked_link || '',
      device_breakdown: analysis.device_breakdown || '',
      time_to_open_average: analysis.time_to_open_average || '',
      engagement_score: analysis.engagement_score || '',
      analysis_generated_date: analysis.analysis_generated_date ? new Date(analysis.analysis_generated_date).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  }

  function resetForm() {
    setFormData({
      email_analysis_id: '',
      campaign_id: '',
      campaign_name: '',
      email_subject_line: '',
      send_date: '',
      recipient_count: '',
      open_rate_percent: '',
      click_through_rate: '',
      bounce_rate_percent: '',
      unsubscribe_rate: '',
      spam_complaint_count: '',
      most_clicked_link: '',
      device_breakdown: '',
      time_to_open_average: '',
      engagement_score: '',
      analysis_generated_date: ''
    });
  }

  const filteredAnalyses = analyses.filter(analysis =>
    analysis.campaign_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    analysis.email_subject_line?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: analyses.length,
    avgOpenRate: analyses.length > 0 ? Math.round(analyses.reduce((sum, a) => sum + (a.open_rate_percent || 0), 0) / analyses.length) : 0,
    avgClickRate: analyses.length > 0 ? Math.round(analyses.reduce((sum, a) => sum + (a.click_through_rate || 0), 0) / analyses.length) : 0,
    totalRecipients: analyses.reduce((sum, a) => sum + (a.recipient_count || 0), 0)
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Analysis</h1>
          <p className="text-gray-600 mt-1">Analyze email campaign performance and metrics</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Analysis
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
            <Mail className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgOpenRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Click Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgClickRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecipients.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by campaign name or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAnalyses.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No email analyses found</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Analysis
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Subject Line</TableHead>
                  <TableHead>Send Date</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Open Rate</TableHead>
                  <TableHead>Click Rate</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnalyses.map((analysis) => (
                  <TableRow key={analysis.id}>
                    <TableCell className="font-medium">{analysis.campaign_name}</TableCell>
                    <TableCell>{analysis.email_subject_line}</TableCell>
                    <TableCell>{analysis.send_date ? new Date(analysis.send_date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{analysis.recipient_count?.toLocaleString() || '-'}</TableCell>
                    <TableCell>{analysis.open_rate_percent ? `${analysis.open_rate_percent}%` : '-'}</TableCell>
                    <TableCell>{analysis.click_through_rate ? `${analysis.click_through_rate}%` : '-'}</TableCell>
                    <TableCell>{analysis.engagement_score || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(analysis)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(analysis.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Email Analysis</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email_analysis_id">Analysis ID *</Label>
                <Input
                  id="email_analysis_id"
                  value={formData.email_analysis_id}
                  onChange={(e) => setFormData({ ...formData, email_analysis_id: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="campaign_id">Campaign ID *</Label>
                <Input
                  id="campaign_id"
                  value={formData.campaign_id}
                  onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="campaign_name">Campaign Name *</Label>
                <Input
                  id="campaign_name"
                  value={formData.campaign_name}
                  onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email_subject_line">Subject Line *</Label>
                <Input
                  id="email_subject_line"
                  value={formData.email_subject_line}
                  onChange={(e) => setFormData({ ...formData, email_subject_line: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="send_date">Send Date</Label>
                <Input
                  id="send_date"
                  type="date"
                  value={formData.send_date}
                  onChange={(e) => setFormData({ ...formData, send_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="recipient_count">Recipient Count</Label>
                <Input
                  id="recipient_count"
                  type="number"
                  value={formData.recipient_count}
                  onChange={(e) => setFormData({ ...formData, recipient_count: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="open_rate_percent">Open Rate (%)</Label>
                <Input
                  id="open_rate_percent"
                  type="number"
                  value={formData.open_rate_percent}
                  onChange={(e) => setFormData({ ...formData, open_rate_percent: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="click_through_rate">Click Rate (%)</Label>
                <Input
                  id="click_through_rate"
                  type="number"
                  value={formData.click_through_rate}
                  onChange={(e) => setFormData({ ...formData, click_through_rate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="bounce_rate_percent">Bounce Rate (%)</Label>
                <Input
                  id="bounce_rate_percent"
                  type="number"
                  value={formData.bounce_rate_percent}
                  onChange={(e) => setFormData({ ...formData, bounce_rate_percent: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="unsubscribe_rate">Unsubscribe Rate (%)</Label>
                <Input
                  id="unsubscribe_rate"
                  type="number"
                  value={formData.unsubscribe_rate}
                  onChange={(e) => setFormData({ ...formData, unsubscribe_rate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="spam_complaint_count">Spam Complaints</Label>
                <Input
                  id="spam_complaint_count"
                  type="number"
                  value={formData.spam_complaint_count}
                  onChange={(e) => setFormData({ ...formData, spam_complaint_count: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="engagement_score">Engagement Score</Label>
                <Input
                  id="engagement_score"
                  type="number"
                  value={formData.engagement_score}
                  onChange={(e) => setFormData({ ...formData, engagement_score: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="most_clicked_link">Most Clicked Link</Label>
                <Input
                  id="most_clicked_link"
                  value={formData.most_clicked_link}
                  onChange={(e) => setFormData({ ...formData, most_clicked_link: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="device_breakdown">Device Breakdown</Label>
                <Input
                  id="device_breakdown"
                  value={formData.device_breakdown}
                  onChange={(e) => setFormData({ ...formData, device_breakdown: e.target.value })}
                  placeholder="e.g., Mobile: 60%, Desktop: 35%, Tablet: 5%"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Create Analysis</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Email Analysis</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_campaign_name">Campaign Name</Label>
                <Input
                  id="edit_campaign_name"
                  value={formData.campaign_name}
                  onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_email_subject_line">Subject Line</Label>
                <Input
                  id="edit_email_subject_line"
                  value={formData.email_subject_line}
                  onChange={(e) => setFormData({ ...formData, email_subject_line: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_recipient_count">Recipient Count</Label>
                <Input
                  id="edit_recipient_count"
                  type="number"
                  value={formData.recipient_count}
                  onChange={(e) => setFormData({ ...formData, recipient_count: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_open_rate_percent">Open Rate (%)</Label>
                <Input
                  id="edit_open_rate_percent"
                  type="number"
                  value={formData.open_rate_percent}
                  onChange={(e) => setFormData({ ...formData, open_rate_percent: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_click_through_rate">Click Rate (%)</Label>
                <Input
                  id="edit_click_through_rate"
                  type="number"
                  value={formData.click_through_rate}
                  onChange={(e) => setFormData({ ...formData, click_through_rate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_engagement_score">Engagement Score</Label>
                <Input
                  id="edit_engagement_score"
                  type="number"
                  value={formData.engagement_score}
                  onChange={(e) => setFormData({ ...formData, engagement_score: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Update Analysis</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}