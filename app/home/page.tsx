"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Get hash parameters (Supabase often sends errors as hash parameters)
    const hashParams = typeof window !== 'undefined' ? 
      window.location.hash.substring(1).split('&').reduce((result, item) => {
        const parts = item.split('=');
        if (parts.length === 2) {
          result[parts[0]] = decodeURIComponent(parts[1]);
        }
        return result;
      }, {} as Record<string, string>) : {};
    
    // Check if there are error parameters in the hash
    if (hashParams.error) {
      // Redirect to verify page with the relevant error parameters
      const queryParams = new URLSearchParams({
        error: hashParams.error || '',
        error_code: hashParams.error_code || '',
        error_description: hashParams.error_description || '',
      });
      
      // If we have email in sessionStorage (Supabase might have saved it there)
      let email = '';
      if (typeof window !== 'undefined') {
        email = sessionStorage.getItem('supabase.auth.email') || '';
      }
      
      if (email) {
        queryParams.append('email', email);
      }
      
      router.push(`/verify?${queryParams.toString()}`);
    } else {
      // No error, redirect to the main page
      router.push('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-400" />
        <p className="mt-4 text-slate-300">Redirecting...</p>
      </div>
    </div>
  );
} 