'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DataTable from '@/components/common/DataTable';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import WebsiteForm from './WebsiteForm';
import FormDialog from '@/components/common/FormDialog';
import { Edit, Trash2, Eye, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function WebsiteTable({ websites, onUpdate }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState(null);
  const [editWebsite, setEditWebsite] = useState(null);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/websites/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Delete failed');

      toast.success('Website deleted successfully');
      setDeleteId(null);
      onUpdate?.();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getSSLStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      invalid: 'bg-orange-100 text-orange-800',
      none: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    {
      key: 'domain_name',
      header: 'Domain',
    },
    {
      key: 'page_count',
      header: 'Pages',
    },
    {
      key: 'cms_used',
      header: 'CMS',
    },
    {
      key: 'ssl_status',
      header: 'SSL',
      render: (value) => (
        <Badge className={getSSLStatusColor(value)}>
          {value}
        </Badge>
      )
    },
    {
      key: 'uptime_percentage',
      header: 'Uptime',
      render: (value) => value ? `${value}%` : 'N/A'
    },
    {
      key: 'mobile_responsive',
      header: 'Mobile',
      render: (value) => value ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <X className="h-4 w-4 text-red-600" />
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, website) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/websites/${website.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditWebsite(website)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteId(website.id)}
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
        data={websites}
        searchPlaceholder="Search websites..."
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Website"
        description="Are you sure you want to delete this website? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />

      <FormDialog
        open={!!editWebsite}
        onOpenChange={() => setEditWebsite(null)}
        title="Edit Website"
      >
        <WebsiteForm
          website={editWebsite}
          onSuccess={() => {
            setEditWebsite(null);
            onUpdate?.();
          }}
        />
      </FormDialog>
    </>
  );
}