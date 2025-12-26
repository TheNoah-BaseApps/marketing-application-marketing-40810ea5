'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

export default function WebsiteDetail({ website }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Website Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Website ID</p>
            <p className="font-medium">{website.website_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Domain Name</p>
            <p className="font-medium">{website.domain_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Page Count</p>
            <p className="font-medium">{website.page_count}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">CMS Used</p>
            <p className="font-medium">{website.cms_used || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">SSL Status</p>
            <Badge>{website.ssl_status}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500">Mobile Responsive</p>
            {website.mobile_responsive ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <X className="h-5 w-5 text-red-600" />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Page Load Time</p>
            <p className="font-medium">{website.page_load_time ? `${website.page_load_time}s` : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Uptime Percentage</p>
            <p className="font-medium">{website.uptime_percentage ? `${website.uptime_percentage}%` : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Analytics Tool</p>
            <p className="font-medium">{website.analytics_tool_used || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Maintenance Schedule</p>
            <p className="font-medium">{website.maintenance_schedule || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Launch Date</p>
            <p className="font-medium">{website.launch_date || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="font-medium">{website.last_updated_date || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Remarks</p>
            <p className="font-medium">{website.remarks || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}