'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, Plus, Pencil, Trash2, TrendingUp, Users, MousePointer, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function EmailMarketingPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email_campaign_id: '',
    subject_line: '',
    sender_name: '',
    send_date: '',
    email_list_size: '',
    open_rate: '',
    click_rate: '',
    bounce_rate: '',
    unsubscribe_count: '',
    conversion_count: '',
    email_content_type: 'Newsletter',
    tested_a_or_b: false,
    test_winner: '',
    remarks: ''
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/email-marketing');
      const result = await response.json();
      if (result.success) {
        setCampaigns(result.data);
      } else {
        toast.error('Failed to load campaigns');
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Error loading campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = showEditDialog ? `/api/email-marketing/${selectedCampaign.id}` : '/api/email-marketing';
      const method = showEditDialog ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success(showEditDialog ? 'Campaign updated successfully' : 'Campaign created successfully');
        setShowAddDialog(false);
        setShowEditDialog(false);
        resetForm();
        fetchCampaigns();
      } else {
        toast.error(result.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error saving campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (campaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      email_campaign_id: campaign.email_campaign_id || '',
      subject_line: campaign.subject_line || '',
      sender_name: campaign.sender_name || '',
      send_date: campaign.send_date ? campaign.send_date.split('T')[0] : '',
      email_list_size: campaign.email_list_size || '',
      open_rate: campaign.open_rate || '',
      click_rate: campaign.click_rate || '',
      bounce_rate: campaign.bounce_rate || '',
      unsubscribe_count: campaign.unsubscribe_count || '',
      conversion_count: campaign.conversion_count || '',
      email_content_type: campaign.email_content_type || 'Newsletter',
      tested_a_or_b: campaign.tested_a_or_b || false,
      test_winner: campaign.test_winner || '',
      remarks: campaign.remarks || ''
    });
    setShowEditDialog(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const response = await fetch(`/api/email-marketing/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Campaign deleted successfully');
        fetchCampaigns();
      } else {
        toast.error(result.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Error deleting campaign');
    }
  };

  const resetForm = () => {
    setFormData({
      email_campaign_id: '',
      subject_line: '',
      sender_name: '',
      send_date: '',
      email_list_size: '',
      open_rate: '',
      click_rate: '',
      bounce_rate: '',
      unsubscribe_count: '',
      conversion_count: '',
      email_content_type: 'Newsletter',
      tested_a_or_b: false,
      test_winner: '',
      remarks: ''
    });
    setSelectedCampaign(null);
  };

  const calculateStats = () => {
    const totalCampaigns = campaigns.length;
    const avgOpenRate = campaigns.length > 0 
      ? Math.round(campaigns.reduce((sum, c) => sum + (c.open_rate || 0), 0) / campaigns.length)
      : 0;
    const avgClickRate = campaigns.length > 0
      ? Math.round(campaigns.reduce((sum, c) => sum + (c.click_rate || 0), 0) / campaigns.length)
      : 0;
    const totalConversions = campaigns.reduce((sum, c) => sum + (c.conversion_count || 0), 0);

    return { totalCampaigns, avgOpenRate, avgClickRate, totalConversions };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Marketing</h1>
          <p className="text-gray-600 mt-1">Manage email campaigns and performance</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgOpenRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgClickRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversions}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No campaigns yet</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Campaign
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign ID</TableHead>
                  <TableHead>Subject Line</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Content Type</TableHead>
                  <TableHead>List Size</TableHead>
                  <TableHead>Open Rate</TableHead>
                  <TableHead>Click Rate</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.email_campaign_id}</TableCell>
                    <TableCell>{campaign.subject_line}</TableCell>
                    <TableCell>{campaign.sender_name}</TableCell>
                    <TableCell>{campaign.email_content_type}</TableCell>
                    <TableCell>{campaign.email_list_size?.toLocaleString()}</TableCell>
                    <TableCell>{campaign.open_rate}%</TableCell>
                    <TableCell>{campaign.click_rate}%</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(campaign)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(campaign.id)}
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

      <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setShowEditDialog(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{showEditDialog ? 'Edit Campaign' : 'Add Campaign'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email_campaign_id">Campaign ID *</Label>
                  <Input
                    id="email_campaign_id"
                    value={formData.email_campaign_id}
                    onChange={(e) => setFormData({ ...formData, email_campaign_id: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender_name">Sender Name *</Label>
                  <Input
                    id="sender_name"
                    value={formData.sender_name}
                    onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject_line">Subject Line *</Label>
                <Input
                  id="subject_line"
                  value={formData.subject_line}
                  onChange={(e) => setFormData({ ...formData, subject_line: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email_content_type">Content Type *</Label>
                  <Select
                    value={formData.email_content_type}
                    onValueChange={(value) => setFormData({ ...formData, email_content_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Newsletter">Newsletter</SelectItem>
                      <SelectItem value="Promotional">Promotional</SelectItem>
                      <SelectItem value="Transactional">Transactional</SelectItem>
                      <SelectItem value="Announcement">Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="send_date">Send Date</Label>
                  <Input
                    id="send_date"
                    type="date"
                    value={formData.send_date}
                    onChange={(e) => setFormData({ ...formData, send_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email_list_size">List Size</Label>
                  <Input
                    id="email_list_size"
                    type="number"
                    value={formData.email_list_size}
                    onChange={(e) => setFormData({ ...formData, email_list_size: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conversion_count">Conversions</Label>
                  <Input
                    id="conversion_count"
                    type="number"
                    value={formData.conversion_count}
                    onChange={(e) => setFormData({ ...formData, conversion_count: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="open_rate">Open Rate (%)</Label>
                  <Input
                    id="open_rate"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.open_rate}
                    onChange={(e) => setFormData({ ...formData, open_rate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="click_rate">Click Rate (%)</Label>
                  <Input
                    id="click_rate"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.click_rate}
                    onChange={(e) => setFormData({ ...formData, click_rate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bounce_rate">Bounce Rate (%)</Label>
                  <Input
                    id="bounce_rate"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.bounce_rate}
                    onChange={(e) => setFormData({ ...formData, bounce_rate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unsubscribe_count">Unsubscribes</Label>
                  <Input
                    id="unsubscribe_count"
                    type="number"
                    value={formData.unsubscribe_count}
                    onChange={(e) => setFormData({ ...formData, unsubscribe_count: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="test_winner">Test Winner</Label>
                  <Input
                    id="test_winner"
                    value={formData.test_winner}
                    onChange={(e) => setFormData({ ...formData, test_winner: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <input
                    type="checkbox"
                    id="tested_a_or_b"
                    checked={formData.tested_a_or_b}
                    onChange={(e) => setFormData({ ...formData, tested_a_or_b: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="tested_a_or_b">A/B Tested</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setShowEditDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : (showEditDialog ? 'Update' : 'Create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}