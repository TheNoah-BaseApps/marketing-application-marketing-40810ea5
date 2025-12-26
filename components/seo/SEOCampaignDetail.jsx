'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SEORankingIndicator from './SEORankingIndicator';

export default function SEOCampaignDetail({ campaign }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Campaign ID</p>
            <p className="font-medium">{campaign.seo_campaign_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Keyword</p>
            <p className="font-medium">{campaign.keyword_targeted}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Ranking</p>
            <SEORankingIndicator ranking={campaign.keyword_ranking} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Search Volume</p>
            <p className="font-medium">{campaign.search_volume?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Domain Authority</p>
            <p className="font-medium">{campaign.domain_authority}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Backlinks</p>
            <p className="font-medium">{campaign.backlink_count}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Crawl Status</p>
            <Badge>{campaign.crawl_status}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500">Page URL</p>
            <a href={campaign.page_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {campaign.page_url}
            </a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Meta Title</p>
            <p className="font-medium">{campaign.meta_title || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Meta Description</p>
            <p className="font-medium">{campaign.meta_description || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Technical Issues</p>
            <p className="font-medium">{campaign.technical_issues || 'None'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Remarks</p>
            <p className="font-medium">{campaign.remarks || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}