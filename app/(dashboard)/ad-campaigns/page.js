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
import { Plus, Pencil, Trash2, TrendingUp, DollarSign, Eye, Target } from 'lucide-react';
import { toast } from 'sonner';

export default function AdCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    ad_campaign_id: '',
    ad_type: '',
    ad_title: '',
    platform_or_channel: '',
    start_date: '',
    end_date: '',
    ad_budget: '',
    target_demographic: '',
    impressions_achieved: '',
    cpm: '',
    conversions_count: '',
    creative_agency_name: '',
    ad_approval_date: '',
    remarks: ''
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    try {
      const res = await fetch('/api/ad-campaigns');
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.data);
      }
    } catch (error) {
      console.error('Error fetching ad campaigns:', error);
      toast.error('Failed to load ad campaigns');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/ad-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Ad campaign created successfully');
        setShowAddModal(false);
        resetForm();
        fetchCampaigns();
      } else {
        toast.error(data.error || 'Failed to create ad campaign');
      }
    } catch (error) {
      console.error('Error creating ad campaign:', error);
      toast.error('Failed to create ad campaign');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/ad-campaigns/${editingCampaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Ad campaign updated successfully');
        setShowEditModal(false);
        setEditingCampaign(null);
        resetForm();
        fetchCampaigns();
      } else {
        toast.error(data.error || 'Failed to update ad campaign');
      }
    } catch (error) {
      console.error('Error updating ad campaign:', error);
      toast.error('Failed to update ad campaign');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this ad campaign?')) return;
    
    try {
      const res = await fetch(`/api/ad-campaigns/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Ad campaign deleted successfully');
        fetchCampaigns();
      } else {
        toast.error(data.error || 'Failed to delete ad campaign');
      }
    } catch (error) {
      console.error('Error deleting ad campaign:', error);
      toast.error('Failed to delete ad campaign');
    }
  }

  function openEditModal(campaign) {
    setEditingCampaign(campaign);
    setFormData({
      ad_campaign_id: campaign.ad_campaign_id || '',
      ad_type: campaign.ad_type || '',
      ad_title: campaign.ad_title || '',
      platform_or_channel: campaign.platform_or_channel || '',
      start_date: campaign.start_date ? campaign.start_date.split('T')[0] : '',
      end_date: campaign.end_date ? campaign.end_date.split('T')[0] : '',
      ad_budget: campaign.ad_budget || '',
      target_demographic: campaign.target_demographic || '',
      impressions_achieved: campaign.impressions_achieved || '',
      cpm: campaign.cpm || '',
      conversions_count: campaign.conversions_count || '',
      creative_agency_name: campaign.creative_agency_name || '',
      ad_approval_date: campaign.ad_approval_date ? campaign.ad_approval_date.split('T')[0] : '',
      remarks: campaign.remarks || ''
    });
    setShowEditModal(true);
  }

  function resetForm() {
    setFormData({
      ad_campaign_id: '',
      ad_type: '',
      ad_title: '',
      platform_or_channel: '',
      start_date: '',
      end_date: '',
      ad_budget: '',
      target_demographic: '',
      impressions_achieved: '',
      cpm: '',
      conversions_count: '',
      creative_agency_name: '',
      ad_approval_date: '',
      remarks: ''
    });
  }

  const totalBudget = campaigns.reduce((sum, c) => sum + (parseInt(c.ad_budget) || 0), 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + (parseInt(c.impressions_achieved) || 0), 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + (parseInt(c.conversions_count) || 0), 0);

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
          <h1 className="text-3xl font-bold">Ad Campaigns</h1>
          <p className="text-gray-600 mt-1">Manage advertising campaigns and performance</p>
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
            <Target className="h-4 w-4 text-blue-600" />
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
            <CardTitle className="text-sm font-medium text-gray-600">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Conversions</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No ad campaigns found</p>
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
                  <TableHead>Type</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Impressions</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.ad_campaign_id}</TableCell>
                    <TableCell>{campaign.ad_title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{campaign.ad_type}</Badge>
                    </TableCell>
                    <TableCell>{campaign.platform_or_channel}</TableCell>
                    <TableCell>${parseInt(campaign.ad_budget || 0).toLocaleString()}</TableCell>
                    <TableCell>{parseInt(campaign.impressions_achieved || 0).toLocaleString()}</TableCell>
                    <TableCell>{parseInt(campaign.conversions_count || 0).toLocaleString()}</TableCell>
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
            <DialogTitle>Add New Ad Campaign</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ad_campaign_id">Campaign ID *</Label>
                <Input
                  id="ad_campaign_id"
                  required
                  value={formData.ad_campaign_id}
                  onChange={(e) => setFormData({ ...formData, ad_campaign_id: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ad_type">Ad Type *</Label>
                <Input
                  id="ad_type"
                  required
                  value={formData.ad_type}
                  onChange={(e) => setFormData({ ...formData, ad_type: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ad_title">Ad Title *</Label>
                <Input
                  id="ad_title"
                  required
                  value={formData.ad_title}
                  onChange={(e) => setFormData({ ...formData, ad_title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="platform_or_channel">Platform/Channel *</Label>
                <Input
                  id="platform_or_channel"
                  required
                  value={formData.platform_or_channel}
                  onChange={(e) => setFormData({ ...formData, platform_or_channel: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
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
                <Label htmlFor="ad_budget">Budget</Label>
                <Input
                  id="ad_budget"
                  type="number"
                  value={formData.ad_budget}
                  onChange={(e) => setFormData({ ...formData, ad_budget: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="target_demographic">Target Demographic</Label>
                <Input
                  id="target_demographic"
                  value={formData.target_demographic}
                  onChange={(e) => setFormData({ ...formData, target_demographic: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="impressions_achieved">Impressions</Label>
                <Input
                  id="impressions_achieved"
                  type="number"
                  value={formData.impressions_achieved}
                  onChange={(e) => setFormData({ ...formData, impressions_achieved: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cpm">CPM</Label>
                <Input
                  id="cpm"
                  type="number"
                  value={formData.cpm}
                  onChange={(e) => setFormData({ ...formData, cpm: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="conversions_count">Conversions</Label>
                <Input
                  id="conversions_count"
                  type="number"
                  value={formData.conversions_count}
                  onChange={(e) => setFormData({ ...formData, conversions_count: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="creative_agency_name">Creative Agency</Label>
                <Input
                  id="creative_agency_name"
                  value={formData.creative_agency_name}
                  onChange={(e) => setFormData({ ...formData, creative_agency_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ad_approval_date">Approval Date</Label>
                <Input
                  id="ad_approval_date"
                  type="date"
                  value={formData.ad_approval_date}
                  onChange={(e) => setFormData({ ...formData, ad_approval_date: e.target.value })}
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
            <DialogTitle>Edit Ad Campaign</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_ad_campaign_id">Campaign ID *</Label>
                <Input
                  id="edit_ad_campaign_id"
                  required
                  value={formData.ad_campaign_id}
                  onChange={(e) => setFormData({ ...formData, ad_campaign_id: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_ad_type">Ad Type *</Label>
                <Input
                  id="edit_ad_type"
                  required
                  value={formData.ad_type}
                  onChange={(e) => setFormData({ ...formData, ad_type: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_ad_title">Ad Title *</Label>
                <Input
                  id="edit_ad_title"
                  required
                  value={formData.ad_title}
                  onChange={(e) => setFormData({ ...formData, ad_title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_platform_or_channel">Platform/Channel *</Label>
                <Input
                  id="edit_platform_or_channel"
                  required
                  value={formData.platform_or_channel}
                  onChange={(e) => setFormData({ ...formData, platform_or_channel: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_start_date">Start Date</Label>
                <Input
                  id="edit_start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
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
                <Label htmlFor="edit_ad_budget">Budget</Label>
                <Input
                  id="edit_ad_budget"
                  type="number"
                  value={formData.ad_budget}
                  onChange={(e) => setFormData({ ...formData, ad_budget: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_target_demographic">Target Demographic</Label>
                <Input
                  id="edit_target_demographic"
                  value={formData.target_demographic}
                  onChange={(e) => setFormData({ ...formData, target_demographic: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_impressions_achieved">Impressions</Label>
                <Input
                  id="edit_impressions_achieved"
                  type="number"
                  value={formData.impressions_achieved}
                  onChange={(e) => setFormData({ ...formData, impressions_achieved: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_cpm">CPM</Label>
                <Input
                  id="edit_cpm"
                  type="number"
                  value={formData.cpm}
                  onChange={(e) => setFormData({ ...formData, cpm: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_conversions_count">Conversions</Label>
                <Input
                  id="edit_conversions_count"
                  type="number"
                  value={formData.conversions_count}
                  onChange={(e) => setFormData({ ...formData, conversions_count: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_creative_agency_name">Creative Agency</Label>
                <Input
                  id="edit_creative_agency_name"
                  value={formData.creative_agency_name}
                  onChange={(e) => setFormData({ ...formData, creative_agency_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_ad_approval_date">Approval Date</Label>
                <Input
                  id="edit_ad_approval_date"
                  type="date"
                  value={formData.ad_approval_date}
                  onChange={(e) => setFormData({ ...formData, ad_approval_date: e.target.value })}
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