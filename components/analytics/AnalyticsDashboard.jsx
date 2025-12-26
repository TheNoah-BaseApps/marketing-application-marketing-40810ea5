'use client';

import { useState, useEffect } from 'react';
import StatsCard from '@/components/common/StatsCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Globe, Ticket, BarChart3 } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch metrics');

      const data = await response.json();
      setMetrics(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="SEO Campaigns"
        value={metrics?.seoCount || 0}
        icon={TrendingUp}
        description="Total campaigns"
      />
      <StatsCard
        title="Websites"
        value={metrics?.websiteCount || 0}
        icon={Globe}
        description="Managed properties"
      />
      <StatsCard
        title="Total Coupons"
        value={metrics?.couponCount || 0}
        icon={Ticket}
        description="All coupons"
      />
      <StatsCard
        title="Active Coupons"
        value={metrics?.activeCoupons || 0}
        icon={BarChart3}
        description="Currently active"
      />
    </div>
  );
}