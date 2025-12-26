'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function CouponForm({ coupon, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    coupon_code: coupon?.coupon_code || '',
    issued_date: coupon?.issued_date || '',
    expiry_date: coupon?.expiry_date || '',
    discount_amount: coupon?.discount_amount || '',
    usage_limit: coupon?.usage_limit || '',
    applicable_items: coupon?.applicable_items || '',
    is_stackable: coupon?.is_stackable || false,
    campaign_source: coupon?.campaign_source || '',
    remarks: coupon?.remarks || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = coupon ? `/api/coupons/${coupon.id}` : '/api/coupons';
      const method = coupon ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Operation failed');
      }

      toast.success(data.message);
      onSuccess?.();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="coupon_code">Coupon Code *</Label>
          <Input
            id="coupon_code"
            value={formData.coupon_code}
            onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value.toUpperCase() })}
            required
            disabled={!!coupon}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="discount_amount">Discount Amount *</Label>
          <Input
            id="discount_amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.discount_amount}
            onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="issued_date">Issued Date *</Label>
          <Input
            id="issued_date"
            type="date"
            value={formData.issued_date}
            onChange={(e) => setFormData({ ...formData, issued_date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiry_date">Expiry Date *</Label>
          <Input
            id="expiry_date"
            type="date"
            value={formData.expiry_date}
            onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="usage_limit">Usage Limit (-1 for unlimited)</Label>
          <Input
            id="usage_limit"
            type="number"
            value={formData.usage_limit}
            onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="campaign_source">Campaign Source</Label>
          <Input
            id="campaign_source"
            value={formData.campaign_source}
            onChange={(e) => setFormData({ ...formData, campaign_source: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="applicable_items">Applicable Items</Label>
        <Input
          id="applicable_items"
          value={formData.applicable_items}
          onChange={(e) => setFormData({ ...formData, applicable_items: e.target.value })}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_stackable"
          checked={formData.is_stackable}
          onCheckedChange={(checked) => setFormData({ ...formData, is_stackable: checked })}
        />
        <Label htmlFor="is_stackable">Stackable with other coupons</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          value={formData.remarks}
          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : coupon ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}