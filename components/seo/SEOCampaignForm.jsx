'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function SEOCampaignForm({ campaign, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    keyword_targeted: campaign?.keyword_targeted || '',
    search_volume: campaign?.search_volume || '',
    keyword_ranking: campaign?.keyword_ranking || '',
    page_url: campaign?.page_url || '',
    backlink_count: campaign?.backlink_count || '',
    domain_authority: campaign?.domain_authority || '',
    content_updated_date: campaign?.content_updated_date || '',
    crawl_status: campaign?.crawl_status || 'pending',
    meta_title: campaign?.meta_title || '',
    meta_description: campaign?.meta_description || '',
    technical_issues: campaign?.technical_issues || '',
    remarks: campaign?.remarks || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = campaign ? `/api/seo/${campaign.id}` : '/api/seo';
      const method = campaign ? 'PUT' : 'POST';

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
          <Label htmlFor="keyword_targeted">Keyword *</Label>
          <Input
            id="keyword_targeted"
            value={formData.keyword_targeted}
            onChange={(e) => setFormData({ ...formData, keyword_targeted: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="search_volume">Search Volume</Label>
          <Input
            id="search_volume"
            type="number"
            min="0"
            value={formData.search_volume}
            onChange={(e) => setFormData({ ...formData, search_volume: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="keyword_ranking">Ranking (1-100) *</Label>
          <Input
            id="keyword_ranking"
            type="number"
            min="1"
            max="100"
            value={formData.keyword_ranking}
            onChange={(e) => setFormData({ ...formData, keyword_ranking: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="page_url">Page URL</Label>
          <Input
            id="page_url"
            type="url"
            value={formData.page_url}
            onChange={(e) => setFormData({ ...formData, page_url: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="backlink_count">Backlinks</Label>
          <Input
            id="backlink_count"
            type="number"
            min="0"
            value={formData.backlink_count}
            onChange={(e) => setFormData({ ...formData, backlink_count: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="domain_authority">Domain Authority (0-100)</Label>
          <Input
            id="domain_authority"
            type="number"
            min="0"
            max="100"
            value={formData.domain_authority}
            onChange={(e) => setFormData({ ...formData, domain_authority: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content_updated_date">Content Updated</Label>
          <Input
            id="content_updated_date"
            type="date"
            value={formData.content_updated_date}
            onChange={(e) => setFormData({ ...formData, content_updated_date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="crawl_status">Crawl Status</Label>
          <Select
            value={formData.crawl_status}
            onValueChange={(value) => setFormData({ ...formData, crawl_status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="meta_title">Meta Title (max 60 chars)</Label>
        <Input
          id="meta_title"
          maxLength={60}
          value={formData.meta_title}
          onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="meta_description">Meta Description (max 160 chars)</Label>
        <Textarea
          id="meta_description"
          maxLength={160}
          value={formData.meta_description}
          onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="technical_issues">Technical Issues</Label>
        <Textarea
          id="technical_issues"
          value={formData.technical_issues}
          onChange={(e) => setFormData({ ...formData, technical_issues: e.target.value })}
        />
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
          {loading ? 'Saving...' : campaign ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}