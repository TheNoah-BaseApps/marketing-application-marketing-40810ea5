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
import { MessageSquare, Plus, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function MarketingWhatsAppPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    totalRecipients: 0,
    avgOpenRate: 0
  });

  const [formData, setFormData] = useState({
    message_id: '',
    campaign_name: '',
    send_date: '',
    recipient_count: '',
    open_rate: '',
    click_rate: '',
    message_type: '',
    media_attached: false,
    language_used: '',
    opt_out_count: '',
    delivery_status: '',
    sender_name: '',
    remarks: ''
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    try {
      setLoading(true);
      const res = await fetch('/api/marketing-whatsapp');
      const data = await res.json();
      
      if (data.success) {
        setCampaigns(data.data);
        calculateStats(data.data);
      } else {
        toast.error('Failed to fetch campaigns');
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Error loading campaigns');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(data) {
    const total = data.length;
    const delivered = data.filter(c => c.delivery_status === 'Delivered').length;
    const totalRecipients = data.reduce((sum, c) => sum + (c.recipient_count || 0), 0);
    const avgOpenRate = data.length > 0 
      ? Math.round(data.reduce((sum, c) => sum + (c.open_rate || 0), 0) / data.length)
      : 0;

    setStats({ total, delivered, totalRecipients, avgOpenRate });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/marketing-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Campaign created successfully');
        setShowAddModal(false);
        resetForm();
        fetchCampaigns();
      } else {
        toast.error(data.error || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Error creating campaign');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    
    try {
      const res = await fetch(`/api/marketing-whatsapp/${selectedCampaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Campaign updated successfully');
        setShowEditModal(false);
        setSelectedCampaign(null);
        resetForm();
        fetchCampaigns();
      } else {
        toast.error(data.error || 'Failed to update campaign');
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error('Error updating campaign');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const res = await fetch(`/api/marketing-whatsapp/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Campaign deleted successfully');
        fetchCampaigns();
      } else {
        toast.error(data.error || 'Failed to delete campaign');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Error deleting campaign');
    }
  }

  function openEditModal(item) {
    setSelectedCampaign(item);
    setFormData({
      message_id: item.message_id,
      campaign_name: item.campaign_name,
      send_date: item.send_date ? item.send_date.split('T')[0] : '',
      recipient_count: item.recipient_count || '',
      open_rate: item.open_rate || '',
      click_rate: item.click_rate || '',
      message_type: item.message_type,
      media_attached: item.media_attached || false,
      language_used: item.language_used || '',
      opt_out_count: item.opt_out_count || '',
      delivery_status: item.delivery_status,
      sender_name: item.sender_name || '',
      remarks: item.remarks || ''
    });
    setShowEditModal(true);
  }

  function resetForm() {
    setFormData({
      message_id: '',
      campaign_name: '',
      send_date: '',
      recipient_count: '',
      open_rate: '',
      click_rate: '',
      message_type: '',
      media_attached: false,
      language_used: '',
      opt_out_count: '',
      delivery_status: '',
      sender_name: '',
      remarks: ''
    });
  }

  const statusColors = {
    'Delivered': 'bg-green-100 text-green-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Failed': 'bg-red-100 text-red-800',
    'Scheduled': 'bg-blue-100 text-blue-800'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">WhatsApp Campaigns</h1>
          <p className="text-gray-600">Manage your WhatsApp marketing campaigns</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Campaigns</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Delivered</CardDescription>
            <CardTitle className="text-3xl">{stats.delivered}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Recipients</CardDescription>
            <CardTitle className="text-3xl">{stats.totalRecipients}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Open Rate</CardDescription>
            <CardTitle className="text-3xl">{stats.avgOpenRate}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign List</CardTitle>
          <CardDescription>View and manage all WhatsApp campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first WhatsApp campaign.</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Campaign
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Message Type</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Open Rate</TableHead>
                  <TableHead>Click Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Media</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.campaign_name}</TableCell>
                    <TableCell>{item.message_type}</TableCell>
                    <TableCell>{item.recipient_count || 0}</TableCell>
                    <TableCell>{item.open_rate || 0}%</TableCell>
                    <TableCell>{item.click_rate || 0}%</TableCell>
                    <TableCell>
                      <Badge className={statusColors[item.delivery_status] || 'bg-gray-100 text-gray-800'}>
                        {item.delivery_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.media_attached ? (
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
            <DialogTitle>Add New Campaign</DialogTitle>
            <DialogDescription>Create a new WhatsApp marketing campaign</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="message_id">Message ID</Label>
                <Input
                  id="message_id"
                  value={formData.message_id}
                  onChange={(e) => setFormData({...formData, message_id: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="campaign_name">Campaign Name</Label>
                <Input
                  id="campaign_name"
                  value={formData.campaign_name}
                  onChange={(e) => setFormData({...formData, campaign_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="send_date">Send Date</Label>
                <Input
                  id="send_date"
                  type="date"
                  value={formData.send_date}
                  onChange={(e) => setFormData({...formData, send_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="recipient_count">Recipient Count</Label>
                <Input
                  id="recipient_count"
                  type="number"
                  value={formData.recipient_count}
                  onChange={(e) => setFormData({...formData, recipient_count: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="message_type">Message Type</Label>
                <Select value={formData.message_type} onValueChange={(value) => setFormData({...formData, message_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Promotional">Promotional</SelectItem>
                    <SelectItem value="Transactional">Transactional</SelectItem>
                    <SelectItem value="Notification">Notification</SelectItem>
                    <SelectItem value="Newsletter">Newsletter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="delivery_status">Delivery Status</Label>
                <Select value={formData.delivery_status} onValueChange={(value) => setFormData({...formData, delivery_status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="open_rate">Open Rate (%)</Label>
                <Input
                  id="open_rate"
                  type="number"
                  value={formData.open_rate}
                  onChange={(e) => setFormData({...formData, open_rate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="click_rate">Click Rate (%)</Label>
                <Input
                  id="click_rate"
                  type="number"
                  value={formData.click_rate}
                  onChange={(e) => setFormData({...formData, click_rate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="language_used">Language Used</Label>
                <Input
                  id="language_used"
                  value={formData.language_used}
                  onChange={(e) => setFormData({...formData, language_used: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="opt_out_count">Opt-Out Count</Label>
                <Input
                  id="opt_out_count"
                  type="number"
                  value={formData.opt_out_count}
                  onChange={(e) => setFormData({...formData, opt_out_count: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="sender_name">Sender Name</Label>
                <Input
                  id="sender_name"
                  value={formData.sender_name}
                  onChange={(e) => setFormData({...formData, sender_name: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="media_attached"
                  checked={formData.media_attached}
                  onChange={(e) => setFormData({...formData, media_attached: e.target.checked})}
                  className="h-4 w-4"
                />
                <Label htmlFor="media_attached">Media Attached</Label>
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
              <Button type="submit">Create Campaign</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogDescription>Update campaign information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_message_id">Message ID</Label>
                <Input
                  id="edit_message_id"
                  value={formData.message_id}
                  onChange={(e) => setFormData({...formData, message_id: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_campaign_name">Campaign Name</Label>
                <Input
                  id="edit_campaign_name"
                  value={formData.campaign_name}
                  onChange={(e) => setFormData({...formData, campaign_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_send_date">Send Date</Label>
                <Input
                  id="edit_send_date"
                  type="date"
                  value={formData.send_date}
                  onChange={(e) => setFormData({...formData, send_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_recipient_count">Recipient Count</Label>
                <Input
                  id="edit_recipient_count"
                  type="number"
                  value={formData.recipient_count}
                  onChange={(e) => setFormData({...formData, recipient_count: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_message_type">Message Type</Label>
                <Select value={formData.message_type} onValueChange={(value) => setFormData({...formData, message_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Promotional">Promotional</SelectItem>
                    <SelectItem value="Transactional">Transactional</SelectItem>
                    <SelectItem value="Notification">Notification</SelectItem>
                    <SelectItem value="Newsletter">Newsletter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_delivery_status">Delivery Status</Label>
                <Select value={formData.delivery_status} onValueChange={(value) => setFormData({...formData, delivery_status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_open_rate">Open Rate (%)</Label>
                <Input
                  id="edit_open_rate"
                  type="number"
                  value={formData.open_rate}
                  onChange={(e) => setFormData({...formData, open_rate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_click_rate">Click Rate (%)</Label>
                <Input
                  id="edit_click_rate"
                  type="number"
                  value={formData.click_rate}
                  onChange={(e) => setFormData({...formData, click_rate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_language_used">Language Used</Label>
                <Input
                  id="edit_language_used"
                  value={formData.language_used}
                  onChange={(e) => setFormData({...formData, language_used: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_opt_out_count">Opt-Out Count</Label>
                <Input
                  id="edit_opt_out_count"
                  type="number"
                  value={formData.opt_out_count}
                  onChange={(e) => setFormData({...formData, opt_out_count: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_sender_name">Sender Name</Label>
                <Input
                  id="edit_sender_name"
                  value={formData.sender_name}
                  onChange={(e) => setFormData({...formData, sender_name: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_media_attached"
                  checked={formData.media_attached}
                  onChange={(e) => setFormData({...formData, media_attached: e.target.checked})}
                  className="h-4 w-4"
                />
                <Label htmlFor="edit_media_attached">Media Attached</Label>
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
              <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setSelectedCampaign(null); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Update Campaign</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}