'use client';

import { Badge } from '@/components/ui/badge';
import DataTable from '@/components/common/DataTable';

export default function AuditLogTable({ logs }) {
  const getActionColor = (action) => {
    const colors = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
      REDEEM: 'bg-purple-100 text-purple-800'
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    {
      key: 'created_at',
      header: 'Date',
      render: (value) => new Date(value).toLocaleString()
    },
    {
      key: 'user_name',
      header: 'User',
      render: (value, log) => value || log.user_email
    },
    {
      key: 'workflow_name',
      header: 'Workflow',
    },
    {
      key: 'action',
      header: 'Action',
      render: (value) => (
        <Badge className={getActionColor(value)}>
          {value}
        </Badge>
      )
    },
    {
      key: 'changes',
      header: 'Changes',
      render: (value) => {
        if (!value) return 'N/A';
        const changes = typeof value === 'string' ? JSON.parse(value) : value;
        return (
          <pre className="text-xs max-w-md overflow-x-auto">
            {JSON.stringify(changes, null, 2)}
          </pre>
        );
      }
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={logs}
      searchPlaceholder="Search audit logs..."
    />
  );
}