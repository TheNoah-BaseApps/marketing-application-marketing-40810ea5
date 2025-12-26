'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/common/DataTable';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import CouponForm from './CouponForm';
import FormDialog from '@/components/common/FormDialog';
import CouponStatusBadge from './CouponStatusBadge';
import { Edit, Trash2, Eye, Gift } from 'lucide-react';
import { toast } from 'sonner';

export default function CouponTable({ coupons, onUpdate }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState(null);
  const [editCoupon, setEditCoupon] = useState(null);
  const [redeemId, setRedeemId] = useState(null);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/coupons/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Delete failed');

      toast.success('Coupon deleted successfully');
      setDeleteId(null);
      onUpdate?.();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRedeem = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/coupons/${redeemId}/redeem`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Redemption failed');

      toast.success('Coupon redeemed successfully');
      setRedeemId(null);
      onUpdate?.();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const columns = [
    {
      key: 'coupon_code',
      header: 'Code',
    },
    {
      key: 'discount_amount',
      header: 'Discount',
      render: (value) => `$${parseFloat(value).toFixed(2)}`
    },
    {
      key: 'redemption_count',
      header: 'Redeemed',
      render: (value, coupon) => {
        const limit = coupon.usage_limit === -1 ? '∞' : coupon.usage_limit;
        return `${value} / ${limit}`;
      }
    },
    {
      key: 'expiry_date',
      header: 'Expiry',
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => <CouponStatusBadge status={value} />
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, coupon) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/coupons/${coupon.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setRedeemId(coupon.id)}
            disabled={coupon.status !== 'active'}
          >
            <Gift className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditCoupon(coupon)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteId(coupon.id)}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={coupons}
        searchPlaceholder="Search coupons..."
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Coupon"
        description="Are you sure you want to delete this coupon? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />

      <ConfirmDialog
        open={!!redeemId}
        onOpenChange={() => setRedeemId(null)}
        title="Redeem Coupon"
        description="This will increment the redemption count. Continue?"
        onConfirm={handleRedeem}
        confirmText="Redeem"
      />

      <FormDialog
        open={!!editCoupon}
        onOpenChange={() => setEditCoupon(null)}
        title="Edit Coupon"
      >
        <CouponForm
          coupon={editCoupon}
          onSuccess={() => {
            setEditCoupon(null);
            onUpdate?.();
          }}
        />
      </FormDialog>
    </>
  );
}