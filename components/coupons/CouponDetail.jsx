'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CouponStatusBadge from './CouponStatusBadge';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function CouponDetail({ coupon, onUpdate }) {
  const handleRedeem = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/coupons/${coupon.id}/redeem`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Redemption failed');

      toast.success('Coupon redeemed successfully');
      onUpdate?.();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Coupon Details</CardTitle>
          <Button
            onClick={handleRedeem}
            disabled={coupon.status !== 'active'}
          >
            Redeem Coupon
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Coupon ID</p>
            <p className="font-medium">{coupon.coupon_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Coupon Code</p>
            <Badge variant="outline" className="font-mono text-lg">
              {coupon.coupon_code}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500">Discount Amount</p>
            <p className="font-medium text-green-600 text-xl">
              ${parseFloat(coupon.discount_amount).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <CouponStatusBadge status={coupon.status} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Issued Date</p>
            <p className="font-medium">{new Date(coupon.issued_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Expiry Date</p>
            <p className="font-medium">{new Date(coupon.expiry_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Usage Limit</p>
            <p className="font-medium">
              {coupon.usage_limit === -1 ? 'Unlimited' : coupon.usage_limit}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Redemption Count</p>
            <p className="font-medium">{coupon.redemption_count}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Stackable</p>
            {coupon.is_stackable ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <X className="h-5 w-5 text-red-600" />
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Campaign Source</p>
            <p className="font-medium">{coupon.campaign_source || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Applicable Items</p>
            <p className="font-medium">{coupon.applicable_items || 'All items'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Remarks</p>
            <p className="font-medium">{coupon.remarks || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}