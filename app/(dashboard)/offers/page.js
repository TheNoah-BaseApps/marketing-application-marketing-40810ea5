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
import { Badge } from '@/components/ui/badge';
import { Tag, Plus, Pencil, Trash2, TrendingUp, Package, Percent, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    offer_id: '',
    offer_title: '',
    offer_type: 'Discount',
    start_date: '',
    end_date: '',
    applicable_products: '',
    discount_value: '',
    terms_and_conditions: '',
    offer_status: 'Active',
    claimed_count: '',
    offer_channel: '',
    promo_code: '',
    remarks: ''
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/offers');
      const result = await response.json();
      if (result.success) {
        setOffers(result.data);
      } else {
        toast.error('Failed to load offers');
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error('Error loading offers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = showEditDialog ? `/api/offers/${selectedOffer.id}` : '/api/offers';
      const method = showEditDialog ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success(showEditDialog ? 'Offer updated successfully' : 'Offer created successfully');
        setShowAddDialog(false);
        setShowEditDialog(false);
        resetForm();
        fetchOffers();
      } else {
        toast.error(result.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error saving offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (offer) => {
    setSelectedOffer(offer);
    setFormData({
      offer_id: offer.offer_id || '',
      offer_title: offer.offer_title || '',
      offer_type: offer.offer_type || 'Discount',
      start_date: offer.start_date ? offer.start_date.split('T')[0] : '',
      end_date: offer.end_date ? offer.end_date.split('T')[0] : '',
      applicable_products: offer.applicable_products || '',
      discount_value: offer.discount_value || '',
      terms_and_conditions: offer.terms_and_conditions || '',
      offer_status: offer.offer_status || 'Active',
      claimed_count: offer.claimed_count || '',
      offer_channel: offer.offer_channel || '',
      promo_code: offer.promo_code || '',
      remarks: offer.remarks || ''
    });
    setShowEditDialog(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;

    try {
      const response = await fetch(`/api/offers/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Offer deleted successfully');
        fetchOffers();
      } else {
        toast.error(result.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast.error('Error deleting offer');
    }
  };

  const resetForm = () => {
    setFormData({
      offer_id: '',
      offer_title: '',
      offer_type: 'Discount',
      start_date: '',
      end_date: '',
      applicable_products: '',
      discount_value: '',
      terms_and_conditions: '',
      offer_status: 'Active',
      claimed_count: '',
      offer_channel: '',
      promo_code: '',
      remarks: ''
    });
    setSelectedOffer(null);
  };

  const calculateStats = () => {
    const totalOffers = offers.length;
    const activeOffers = offers.filter(o => o.offer_status === 'Active').length;
    const totalClaimed = offers.reduce((sum, o) => sum + (o.claimed_count || 0), 0);
    const avgDiscount = offers.length > 0
      ? Math.round(offers.reduce((sum, o) => sum + (o.discount_value || 0), 0) / offers.length)
      : 0;

    return { totalOffers, activeOffers, totalClaimed, avgDiscount };
  };

  const stats = calculateStats();

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-800',
      'Expired': 'bg-red-100 text-red-800',
      'Scheduled': 'bg-blue-100 text-blue-800',
      'Draft': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Offers</h1>
          <p className="text-gray-600 mt-1">Manage promotional offers and discounts</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Offer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Offers</CardTitle>
            <Tag className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOffers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOffers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClaimed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Discount</CardTitle>
            <Percent className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDiscount}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Marketing Offers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : offers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No offers yet</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Offer
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Offer ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Promo Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Claims</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium">{offer.offer_id}</TableCell>
                    <TableCell>{offer.offer_title}</TableCell>
                    <TableCell>{offer.offer_type}</TableCell>
                    <TableCell>{offer.discount_value}%</TableCell>
                    <TableCell>
                      {offer.promo_code && (
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {offer.promo_code}
                        </code>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(offer.offer_status)}>
                        {offer.offer_status}
                      </Badge>
                    </TableCell>
                    <TableCell>{offer.claimed_count || 0}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(offer)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(offer.id)}
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
            <DialogTitle>{showEditDialog ? 'Edit Offer' : 'Add Offer'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="offer_id">Offer ID *</Label>
                  <Input
                    id="offer_id"
                    value={formData.offer_id}
                    onChange={(e) => setFormData({ ...formData, offer_id: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offer_type">Offer Type *</Label>
                  <Select
                    value={formData.offer_type}
                    onValueChange={(value) => setFormData({ ...formData, offer_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Discount">Discount</SelectItem>
                      <SelectItem value="BOGO">Buy One Get One</SelectItem>
                      <SelectItem value="Bundle">Bundle</SelectItem>
                      <SelectItem value="Cashback">Cashback</SelectItem>
                      <SelectItem value="Freebie">Freebie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="offer_title">Offer Title *</Label>
                <Input
                  id="offer_title"
                  value={formData.offer_title}
                  onChange={(e) => setFormData({ ...formData, offer_title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount_value">Discount Value (%)</Label>
                  <Input
                    id="discount_value"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promo_code">Promo Code</Label>
                  <Input
                    id="promo_code"
                    value={formData.promo_code}
                    onChange={(e) => setFormData({ ...formData, promo_code: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicable_products">Applicable Products</Label>
                <Input
                  id="applicable_products"
                  value={formData.applicable_products}
                  onChange={(e) => setFormData({ ...formData, applicable_products: e.target.value })}
                  placeholder="e.g., All products, Electronics, Clothing"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="offer_channel">Offer Channel</Label>
                  <Input
                    id="offer_channel"
                    value={formData.offer_channel}
                    onChange={(e) => setFormData({ ...formData, offer_channel: e.target.value })}
                    placeholder="e.g., Email, Website, Social Media"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offer_status">Status *</Label>
                  <Select
                    value={formData.offer_status}
                    onValueChange={(value) => setFormData({ ...formData, offer_status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="claimed_count">Claimed Count</Label>
                <Input
                  id="claimed_count"
                  type="number"
                  value={formData.claimed_count}
                  onChange={(e) => setFormData({ ...formData, claimed_count: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms_and_conditions">Terms and Conditions</Label>
                <Textarea
                  id="terms_and_conditions"
                  value={formData.terms_and_conditions}
                  onChange={(e) => setFormData({ ...formData, terms_and_conditions: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows={2}
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