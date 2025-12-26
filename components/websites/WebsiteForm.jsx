'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function WebsiteForm({ website, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    domain_name: website?.domain_name || '',
    page_count: website?.page_count || '',
    cms_used: website?.cms_used || '',
    launch_date: website?.launch_date || '',
    last_updated_date: website?.last_updated_date || '',
    ssl_status: website?.ssl_status || 'none',
    page_load_time: website?.page_load_time || '',
    uptime_percentage: website?.uptime_percentage || '',
    mobile_responsive: website?.mobile_responsive || false,
    analytics_tool_used: website?.analytics_tool_used || '',
    maintenance_schedule: website?.maintenance_schedule || '',
    remarks: website?.remarks || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = website ? `/api/websites/${website.id}` : '/api/websites';
      const method = website ? 'PUT' : 'POST';

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
          <Label htmlFor="domain_name">Domain Name *</Label>
          <Input
            id="domain_name"
            value={formData.domain_name}
            onChange={(e) => setFormData({ ...formData, domain_name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="page_count">Page Count *</Label>
          <Input
            id="page_count"
            type="number"
            min="1"
            value={formData.page_count}
            onChange={(e) => setFormData({ ...formData, page_count: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cms_used">CMS Used</Label>
          <Input
            id="cms_used"
            value={formData.cms_used}
            onChange={(e) => setFormData({ ...formData, cms_used: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ssl_status">SSL Status</Label>
          <Select
            value={formData.ssl_status}
            onValueChange={(value) => setFormData({ ...formData, ssl_status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="invalid">Invalid</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="launch_date">Launch Date</Label>
          <Input
            id="launch_date"
            type="date"
            value={formData.launch_date}
            onChange={(e) => setFormData({ ...formData, launch_date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_updated_date">Last Updated</Label>
          <Input
            id="last_updated_date"
            type="date"
            value={formData.last_updated_date}
            onChange={(e) => setFormData({ ...formData, last_updated_date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="page_load_time">Page Load Time (s)</Label>
          <Input
            id="page_load_time"
            type="number"
            step="0.01"
            min="0"
            value={formData.page_load_time}
            onChange={(e) => setFormData({ ...formData, page_load_time: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="uptime_percentage">Uptime %</Label>
          <Input
            id="uptime_percentage"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.uptime_percentage}
            onChange={(e) => setFormData({ ...formData, uptime_percentage: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="analytics_tool_used">Analytics Tool</Label>
          <Input
            id="analytics_tool_used"
            value={formData.analytics_tool_used}
            onChange={(e) => setFormData({ ...formData, analytics_tool_used: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maintenance_schedule">Maintenance Schedule</Label>
          <Input
            id="maintenance_schedule"
            value={formData.maintenance_schedule}
            onChange={(e) => setFormData({ ...formData, maintenance_schedule: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="mobile_responsive"
          checked={formData.mobile_responsive}
          onCheckedChange={(checked) => setFormData({ ...formData, mobile_responsive: checked })}
        />
        <Label htmlFor="mobile_responsive">Mobile Responsive</Label>
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
          {loading ? 'Saving...' : website ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}