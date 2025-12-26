'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import BarChart from '@/components/common/BarChart';
import DateRangePicker from '@/components/common/DateRangePicker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function CouponAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString()
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/analytics/coupons?start_date=${dateRange.start}&end_date=${dateRange.end}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch analytics');

      const data = await response.json();
      setAnalytics(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (start, end) => {
    setDateRange({
      start: start.toISOString(),
      end: end.toISOString()
    });
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const statusData = analytics?.statusDistribution?.map(item => ({
    label: item.status,
    value: parseInt(item.count)
  })) || [];

  return (
    <div className="space-y-6">
      <DateRangePicker onDateChange={handleDateChange} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Redemptions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics?.totalRedemptions?.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${analytics?.avgDiscount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Redemption Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics?.redemptionRate}%</p>
          </CardContent>
        </Card>
      </div>

      <BarChart title="Coupon Status Distribution" data={statusData} />

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Redemptions</TableHead>
                <TableHead>Discount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics?.topCoupons?.length > 0 ? (
                analytics.topCoupons.map((coupon, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{coupon.coupon_code}</TableCell>
                    <TableCell>{coupon.redemption_count}</TableCell>
                    <TableCell>${parseFloat(coupon.discount_amount).toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
