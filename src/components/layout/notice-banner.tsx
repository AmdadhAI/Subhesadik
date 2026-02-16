'use client';

import { useEffect, useState } from 'react';
import { getContent } from '@/lib/firebase-data';
import { Megaphone, X } from 'lucide-react';

export function NoticeBanner() {
  const [notice, setNotice] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    async function fetchNotice() {
      try {
        const content = await getContent();
        if (content.noticeBanner) {
          setNotice(content.noticeBanner);
          // Use session storage to show the banner only once per session
          const isDismissed = sessionStorage.getItem('noticeDismissed');
          if (!isDismissed) {
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch notice banner:", error);
      }
    }
    fetchNotice();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('noticeDismissed', 'true');
  };

  if (!isVisible || !notice) {
    return null;
  }

  return (
    <div className="bg-primary text-primary-foreground relative flex items-center justify-center p-2 text-sm min-h-10">
      <Megaphone className="h-4 w-4 mr-2" />
      <span>{notice}</span>
      <button onClick={handleDismiss} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-primary/80">
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </button>
    </div>
  );
}
