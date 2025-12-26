'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DataTable from '@/components/common/DataTable';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import SEOCampaignForm from './SEOCampaignForm';
import FormDialog from '@/components/common/FormDialog';
import SEORankingIndicator from './SEORankingIndicator';
import { Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function SEOCampaignTable({ campaigns, onUpdate }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState(null);
  const [editCampaign, setEditCampaign] = useState(null);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/seo/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Delete failed');

      toast.success('Campaign deleted successfully');
      setDeleteId(null);
      onUpdate?.();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getCrawlStatusColor = (status) => {
    const colors = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      blocked: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    {
      key: 'keyword_targeted',
      header: 'Keyword',
    },
    {
      key: 'keyword_ranking',
      header: 'Ranking',
      render: (value) => <SEORankingIndicator ranking={value} />
    },
    {
      key: 'search_volume',
      header: 'Search Volume',
      render: (value) => value?.toLocaleString() || '0'
    },
    {
      key: 'domain_authority',
      header: 'DA',
    },
    {
      key: 'backlink_count',
      header: 'Backlinks',
    },
    {
      key: 'crawl_status',
      header: 'Status',
      render: (value) => (
        <Badge className={getCrawlStatusColor(value)}>
          {value}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, campaign) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/seo/${campaign.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditCampaign(campaign)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteId(campaign.id)}
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
        data={campaigns}
        searchPlaceholder="Search campaigns..."
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Campaign"
        description="Are you sure you want to delete this SEO campaign? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />

      <FormDialog
        open={!!editCampaign}
        onOpenChange={() => setEditCampaign(null)}
        title="Edit SEO Campaign"
      >
        <SEOCampaignForm
          campaign={editCampaign}
          onSuccess={() => {
            setEditCampaign(null);
            onUpdate?.();
          }}
        />
      </FormDialog>
    </>
  );
}