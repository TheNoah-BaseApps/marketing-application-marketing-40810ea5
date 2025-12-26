'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LineChart({ title, data = [] }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end space-x-2">
          {data.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No data available
            </div>
          ) : (
            data.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${(item.value / maxValue) * 100}%` }}
                />
                <span className="text-xs mt-2 text-gray-600">{item.label}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}