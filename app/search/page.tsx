"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SearchPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to home page with focus on search
    router.push('/');
    
    // Focus the search input after a short delay to ensure the page is loaded
    const timer = setTimeout(() => {
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement | null;
      if (searchInput) searchInput.focus();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center">
          <Loader2 className="h-10 w-10 text-teal-500 animate-spin" />
        </div>
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          Redirecting to search...
        </p>
      </div>
    </div>
  );
} 