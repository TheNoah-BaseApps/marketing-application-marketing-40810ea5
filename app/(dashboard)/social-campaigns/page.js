'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, TrendingUp, DollarSign, Users, MousePointer } from 'lucide-react';
import { toast } from 'sonner';

export default function SocialCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    campaign_id: '',
    platform: '',
    campaign_title: '',
    launch_date: '',
    end_date: '',
    target_audience: '',
    budget_allocated: '',
    impressions_count: '',
    engagement_rate: '',
    click_through_rate: '',
    leads_generated: '',
    campaign_manager_name: '',
    status: '',
    remarks: ''
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    try {
      const res = await fetch('/api/social-campaigns');
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.data);
      }
    } catch (error) {
      console.error('Error fetching social campaigns:', error);
      toast.error('Failed to load social campaigns');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/social-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Social campaign created successfully');
        setShowAddModal(false);
        resetForm();
        fetchCampaigns();
      } else {
        toast.error(data.error || 'Failed to create social campaign');
      }
    } catch (error) {
      console.error('Error creating social campaign:', error);
      toast.error('Failed to create social campaign');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/social-campaigns/${editingCampaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Social campaign updated successfully');
        setShowEditModal(false);
        setEditingCampaign(null);
        resetForm();
        fetchCampaigns();
      } else {
        toast.error(data.error || 'Failed to update social campaign');
      }
    } catch (error) {
      console.error('Error updating social campaign:', error);
      toast.error('Failed to update social campaign');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this social campaign?')) return;
    
    try {
      const res = await fetch(`/api/social-campaigns/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Social campaign deleted successfully');
        fetchCampaigns();
      } else {
        toast.error(data.error || 'Failed to delete social campaign');
      }
    } catch (error) {
      console.error('Error deleting social campaign:', error);
      toast.error('Failed to delete social campaign');
    }
  }

  function openEditModal(campaign) {
    setEditingCampaign(campaign);
    setFormData({
      campaign_id: campaign.campaign_id || '',
      platform: campaign.platform || '',
      campaign_title: campaign.campaign_title || '',
      launch_date: campaign.launch_date ? campaign.launch_date.split('T')[0] : '',
      end_date: campaign.end_date ? campaign.end_date.split('T')[0] : '',
      target_audience: campaign.target_audience || '',
      budget_allocated: campaign.budget_allocated || '',
      impressions_count: campaign.impressions_count || '',
      engagement_rate: campaign.engagement_rate || '',
      click_through_rate: campaign.click_through_rate || '',
      leads_generated: campaign.leads_generated || '',
      campaign_manager_name: campaign.campaign_manager_name || '',
      status: campaign.status || '',
      remarks: campaign.remarks || ''
    });
    setShowEditModal(true);
  }

  function resetForm() {
    setFormData({
      campaign_id: '',
      platform: '',
      campaign_title: '',
      launch_date: '',
      end_date: '',
      target_audience: '',
      budget_allocated: '',
      impressions_count: '',
      engagement_rate: '',
      click_through_rate: '',
      leads_generated: '',
      campaign_manager_name: '',
      status: '',
      remarks: ''
    });
  }

  const totalBudget = campaigns.reduce((sum, c) => sum + (parseInt(c.budget_allocated) || 0), 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + (parseInt(c.impressions_count) || 0), 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + (parseInt(c.leads_generated) || 0), 0);
  const avgEngagement = campaigns.length > 0
    ? campaigns.reduce((sum, c) => sum + (parseInt(c.engagement_rate) || 0), 0) / campaigns.length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Social Campaigns</h1>
          <p className="text-gray-600 mt-1">Manage social media campaigns and engagement</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Campaigns</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Engagement</CardTitle>
            <MousePointer className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEngagement.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No social campaigns found</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Campaign
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.campaign_id}</TableCell>
                    <TableCell>{campaign.campaign_title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{campaign.platform}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>${parseInt(campaign.budget_allocated || 0).toLocaleString()}</TableCell>
                    <TableCell>{parseInt(campaign.leads_generated || 0).toLocaleString()}</TableCell>
                    <TableCell>{campaign.engagement_rate}%</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(campaign)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
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

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Social Campaign</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="campaign_id">Campaign ID *</Label>
                <Input
                  id="campaign_id"
                  required
                  value={formData.campaign_id}
                  onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="platform">Platform *</Label>
                <Input
                  id="platform"
                  required
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="campaign_title">Campaign Title *</Label>
                <Input
                  id="campaign_title"
                  required
                  value={formData.campaign_title}
                  onChange={(e) => setFormData({ ...formData, campaign_title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="launch_date">Launch Date</Label>
                <Input
                  id="launch_date"
                  type="date"
                  value={formData.launch_date}
                  onChange={(e) => setFormData({ ...formData, launch_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="target_audience">Target Audience</Label>
                <Input
                  id="target_audience"
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="budget_allocated">Budget</Label>
                <Input
                  id="budget_allocated"
                  type="number"
                  value={formData.budget_allocated}
                  onChange={(e) => setFormData({ ...formData, budget_allocated: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="impressions_count">Impressions</Label>
                <Input
                  id="impressions_count"
                  type="number"
                  value={formData.impressions_count}
                  onChange={(e) => setFormData({ ...formData, impressions_count: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="engagement_rate">Engagement Rate (%)</Label>
                <Input
                  id="engagement_rate"
                  type="number"
                  value={formData.engagement_rate}
                  onChange={(e) => setFormData({ ...formData, engagement_rate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="click_through_rate">Click-Through Rate (%)</Label>
                <Input
                  id="click_through_rate"
                  type="number"
                  value={formData.click_through_rate}
                  onChange={(e) => setFormData({ ...formData, click_through_rate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="leads_generated">Leads Generated</Label>
                <Input
                  id="leads_generated"
                  type="number"
                  value={formData.leads_generated}
                  onChange={(e) => setFormData({ ...formData, leads_generated: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="campaign_manager_name">Campaign Manager</Label>
                <Input
                  id="campaign_manager_name"
                  value={formData.campaign_manager_name}
                  onChange={(e) => setFormData({ ...formData, campaign_manager_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Input
                  id="status"
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Campaign</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Social Campaign</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_campaign_id">Campaign ID *</Label>
                <Input
                  id="edit_campaign_id"
                  required
                  value={formData.campaign_id}
                  onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_platform">Platform *</Label>
                <Input
                  id="edit_platform"
                  required
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit_campaign_title">Campaign Title *</Label>
                <Input
                  id="edit_campaign_title"
                  required
                  value={formData.campaign_title}
                  onChange={(e) => setFormData({ ...formData, campaign_title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_launch_date">Launch Date</Label>
                <Input
                  id="edit_launch_date"
                  type="date"
                  value={formData.launch_date}
                  onChange={(e) => setFormData({ ...formData, launch_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_end_date">End Date</Label>
                <Input
                  id="edit_end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
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
              <div>
                <Label htmlFor="edit_budget_allocated">Budget</Label>
                <Input
                  id="edit_budget_allocated"
                  type="number"
                  value={formData.budget_allocated}
                  onChange={(e) => setFormData({ ...formData, budget_allocated: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_impressions_count">Impressions</Label>
                <Input
                  id="edit_impressions_count"
                  type="number"
                  value={formData.impressions_count}
                  onChange={(e) => setFormData({ ...formData, impressions_count: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_engagement_rate">Engagement Rate (%)</Label>
                <Input
                  id="edit_engagement_rate"
                  type="number"
                  value={formData.engagement_rate}
                  onChange={(e) => setFormData({ ...formData, engagement_rate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_click_through_rate">Click-Through Rate (%)</Label>
                <Input
                  id="edit_click_through_rate"
                  type="number"
                  value={formData.click_through_rate}
                  onChange={(e) => setFormData({ ...formData, click_through_rate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_leads_generated">Leads Generated</Label>
                <Input
                  id="edit_leads_generated"
                  type="number"
                  value={formData.leads_generated}
                  onChange={(e) => setFormData({ ...formData, leads_generated: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_campaign_manager_name">Campaign Manager</Label>
                <Input
                  id="edit_campaign_manager_name"
                  value={formData.campaign_manager_name}
                  onChange={(e) => setFormData({ ...formData, campaign_manager_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_status">Status *</Label>
                <Input
                  id="edit_status"
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_remarks">Remarks</Label>
              <Textarea
                id="edit_remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Campaign</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}