'use client';

import { useState } from 'react';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import SEOAnalytics from '@/components/analytics/SEOAnalytics';
import CouponAnalytics from '@/components/analytics/CouponAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="seo">SEO Analytics</TabsTrigger>
          <TabsTrigger value="coupons">Coupon Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <SEOAnalytics />
        </TabsContent>

        <TabsContent value="coupons" className="space-y-6">
          <CouponAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}