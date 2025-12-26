'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export default function SuccessToast({ message, show }) {
  useEffect(() => {
    if (show && message) {
      toast.success(message);
    }
  }, [show, message]);

  return null;
}