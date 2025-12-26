'use client';

import { Badge } from '@/components/ui/badge';

export default function CouponStatusBadge({ status }) {
  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      depleted: 'bg-orange-100 text-orange-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Badge className={getStatusColor(status)}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </Badge>
  );
}