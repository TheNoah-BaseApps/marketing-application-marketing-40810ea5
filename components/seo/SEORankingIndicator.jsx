'use client';

import { Badge } from '@/components/ui/badge';

export default function SEORankingIndicator({ ranking }) {
  const getRankingColor = (rank) => {
    if (rank <= 10) return 'bg-green-100 text-green-800';
    if (rank <= 20) return 'bg-blue-100 text-blue-800';
    if (rank <= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Badge className={getRankingColor(ranking)}>
      #{ranking}
    </Badge>
  );
}